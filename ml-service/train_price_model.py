"""
train_price_model.py
=====================
VALORA — Used Vehicle Price Prediction Module.

Trains and compares Linear Regression, Random Forest, and CatBoost regressors
on the CarDekho-style used-car listings export, and persists the winning
model as a single scikit-learn Pipeline (preprocessing + estimator) so the
inference API can call `.predict(raw_dataframe[feature_columns])` directly
without re-implementing any cleaning logic.

Usage
-----
    python train_price_model.py
    python train_price_model.py --data-path datasets/cars_details_merges.csv

Outputs
-------
    reports/feature_analysis.csv          per-column classification report
    reports/model_comparison.csv          MAE / RMSE / R2 for every model
    reports/eda_summary.txt               plain-text EDA snapshot
    trained_models/price_model.pkl        best fitted Pipeline (preprocess+model)
    trained_models/feature_columns.pkl    exact ordered list of raw input columns
    trained_models/feature_importance.png top-20 feature importance (if supported)

Author: VALORA ML Team
"""

from __future__ import annotations

import argparse
import ast
import logging
import pickle
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

import matplotlib

matplotlib.use("Agg")  # never open interactive windows (headless/server safe)
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

try:
    from catboost import CatBoostRegressor

    CATBOOST_AVAILABLE = True
except ImportError:  # pragma: no cover - environment without catboost installed
    CATBOOST_AVAILABLE = False


# ======================================================================================
# Constants / configuration
# ======================================================================================

RANDOM_STATE = 42
TEST_SIZE = 0.20

# --- thresholds used by the automatic column classifier ---------------------------------
HIGH_MISSING_THRESHOLD_PCT = 40.0     # columns missing more than this % are dropped
DOMINANT_CLASS_RATIO_THRESHOLD = 0.99  # near-constant columns (one value >99%) are low-info
NEAR_UNIQUE_RATIO_THRESHOLD = 0.95     # columns that are ~as unique as the row count -> IDs
HIGH_CARDINALITY_ONEHOT_CAP = 40       # max one-hot columns produced per categorical feature

# --- target reconstruction ---------------------------------------------------------------
TARGET_COL = "price"
PRICE_LOWER_QUANTILE = 0.01   # outlier trimming applied to the *target* only
PRICE_UPPER_QUANTILE = 0.99

CURRENT_YEAR = pd.Timestamp.now().year

OUTPUT_DIR_MODELS = Path("trained_models")
OUTPUT_DIR_REPORTS = Path("reports")


# ======================================================================================
# Logging
# ======================================================================================

def setup_logging() -> logging.Logger:
    """Configure a module-level logger (used instead of scattered print statements)."""
    logger = logging.getLogger("valora_price_model")
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-7s | %(message)s", datefmt="%H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


logger = setup_logging()


# ======================================================================================
# 1. Data loading
# ======================================================================================

def load_data(path: Path) -> pd.DataFrame:
    """Load the raw listings export."""
    logger.info("Loading dataset from %s", path)
    if not path.exists():
        raise FileNotFoundError(
            f"Could not find '{path}'. Pass the correct location with --data-path."
        )
    df = pd.read_csv(path, low_memory=False)
    logger.info("Loaded %d rows x %d columns", df.shape[0], df.shape[1])
    return df


# ======================================================================================
# 2. Exploratory Data Analysis
# ======================================================================================

def run_eda(df: pd.DataFrame, output_path: Path) -> None:
    """
    Log + persist a plain-text EDA snapshot: shape, dtypes, missing values,
    duplicates, numeric/categorical summaries, and target distribution.
    """
    lines: List[str] = []

    def emit(msg: str = "") -> None:
        lines.append(msg)

    emit("=" * 90)
    emit("VALORA PRICE MODEL — EXPLORATORY DATA ANALYSIS")
    emit("=" * 90)

    # --- shape ---
    emit(f"\nDataset shape: {df.shape[0]} rows x {df.shape[1]} columns")

    # --- dtypes ---
    emit("\nData types (count of columns per dtype):")
    emit(df.dtypes.astype(str).value_counts().to_string())

    # --- missing values ---
    missing_count = df.isna().sum()
    missing_pct = (missing_count / len(df) * 100).round(2)
    missing_report = (
        pd.DataFrame({"missing_count": missing_count, "missing_pct": missing_pct})
        .query("missing_count > 0")
        .sort_values("missing_pct", ascending=False)
    )
    emit(f"\nColumns with missing values: {len(missing_report)} / {df.shape[1]}")
    emit(missing_report.to_string())

    # --- duplicates ---
    dup_count = df.duplicated().sum()
    emit(f"\nFully duplicated rows: {dup_count}")

    # --- numerical summary ---
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    emit(f"\nNumerical summary ({len(numeric_cols)} numeric columns):")
    if numeric_cols:
        emit(df[numeric_cols].describe().T.to_string())

    # --- categorical summary ---
    cat_cols = df.select_dtypes(include=["object", "bool"]).columns.tolist()
    emit(f"\nCategorical summary ({len(cat_cols)} categorical/bool columns):")
    cat_summary = pd.DataFrame(
        {
            "unique_values": df[cat_cols].nunique(),
            "top_value": df[cat_cols].mode().iloc[0] if len(df) else np.nan,
        }
    ).sort_values("unique_values", ascending=False)
    emit(cat_summary.to_string())

    # --- target variable analysis (raw, pre-cleaning) ---
    if TARGET_COL in df.columns:
        emit(f"\nRaw target column ('{TARGET_COL}') sample values:")
        emit(df[TARGET_COL].astype(str).head(5).to_string())

    logger.info("EDA complete. Shape=%s, duplicate_rows=%d, columns_with_missing=%d",
                df.shape, dup_count, len(missing_report))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    logger.info("EDA summary written to %s", output_path)


# ======================================================================================
# 3 & 4. Automatic column classification + feature analysis report
# ======================================================================================
#
# The classifier below is a HYBRID system:
#   (a) A curated, domain-informed mapping built by inspecting this specific
#       CarDekho/Gaadi export (feature_dictionary.csv) — this is necessary
#       because things like "which columns are literally the same value
#       encoded twice" or "which column is a raw image URL" cannot be
#       determined from summary statistics alone.
#   (b) A statistical fallback that classifies ANY column not covered by (a),
#       so the script keeps working (and stays honest) if the upstream export
#       gains/loses columns later.
#
# Every classification decision is explained in `Reason` in the CSV report.
# ======================================================================================

# --- (a) curated domain knowledge -----------------------------------------------------

# Columns that together encode the SAME real-world concept. We keep exactly one
# canonical column per group (see KEEP_CANONICAL) and drop the rest as duplicates.
DUPLICATE_GROUPS: Dict[str, List[str]] = {
    "transmission": ["tt", "transmissionType", "transmission_type", "transmission_type_new"],
    "fuel_type": ["ft", "fuel_type", "fuel_type_new"],
    "body_type": ["bt", "car_segment", "body_type_new"],
    "brand": ["oem", "oem_name", "brand_name", "brand_new"],
    "model": ["model", "model_name", "model_new"],
    "model_numeric_id": ["modelId", "model_id_new", "centralVariantId",
                          "dynx_itemid2_x", "dynx_itemid2_y"],
    "variant": ["variantName", "variant_name", "variant_new"],
    "variant_text_combo": ["dvn", "vid"],  # redundant with model + variant combined
    "city": ["city_x", "city_y", "city_name_new"],
    "city_numeric_id": ["city_id_new"],
    "owner_type": ["owner_type_new", "owner_type"],
    "seating_capacity": ["Seating Capacity", "seating_capacity_new"],
    "engine_cc_numeric": ["Displacement", "max_engine_capacity_new", "min_engine_capacity_new"],
    "engine_cc_bucket": ["engine_cc", "engine_capacity_new"],
    "color": ["Color", "exterior_color"],
    "seller_type": ["utype", "seller_type_new"],
    "model_year": ["myear", "model_year_new", "model_year"],
    "km_driven": ["km", "km_driven"],
    "price_segment_derived": ["price_range_segment", "price_segment", "price_segment_new"],
}
# Canonical column kept from each duplicate group (the rest are dropped).
KEEP_CANONICAL: Dict[str, str] = {
    "transmission": "transmission_type_new",
    "fuel_type": "fuel_type_new",
    "body_type": "body_type_new",
    "brand": "oem",
    "model": "model",
    "model_numeric_id": None,   # entire group dropped, no canonical numeric id kept
    "variant": "variantName",
    "variant_text_combo": None,  # entire group dropped
    "city": "city_x",
    "city_numeric_id": None,
    "owner_type": "owner_type_new",
    "seating_capacity": "seating_capacity_new",
    "engine_cc_numeric": "Displacement",
    "engine_cc_bucket": None,   # redundant bucketed version of Displacement, drop entirely
    "color": "Color",
    "seller_type": "seller_type_new",
    "model_year": "myear",
    "km_driven": "km_driven",   # already clean numeric, drop the comma-formatted 'km' text
    "price_segment_derived": None,  # leakage - derived directly from price, drop entirely
}

# Target itself and columns that are direct numeric/text duplicates of the target
# (i.e. would leak the answer straight into the model).
LEAKAGE_COLS = {
    "price",               # formatted display text version of the target ("₹ 3.70 Lakh")
    "pu",                  # raw numeric target used to *build* the clean target, then dropped
    "dynx_totalvalue_x",   # remarketing pixel value == exact target price
    "dynx_totalvalue_y",   # duplicate of dynx_totalvalue_x
}

# Row/listing identifiers: unique (or near-unique) per row, carry no generalizable signal.
IDENTIFIER_COLS = {
    "usedCarId", "usedCarSkuId", "ucid", "sid", "used_carid",
    "dynx_itemid_x", "dynx_itemid_y", "vlink", "position",
}

# Fields describing the *website listing itself*, not the vehicle -> not causal price drivers.
WEBSITE_METADATA_COLS = {
    "pi", "images", "imgCount", "threesixty", "page_title", "brandingIcon",
    "pageNo", "pageType", "carType_pageflag", "emiwidget", "dynx_event",
    "dynx_pagetype", "leadForm", "leadFormCta", "offers", "compare",
    "compare_car_details", "originalLocation", "model_type_new", "car_type_new",
    "vehicle_type_new", "page_type", "template_name_new", "page_template",
    "template_Type_new", "experiment", "tmGaadiStore", "views", "priceSaving",
    "corporateId", "ip", "loc",
}

# Explicitly known constant / near-constant columns (kept separate from the
# statistical fallback because a couple of them have >1 unique value but are
# so overwhelmingly dominated by one class that they carry no signal, e.g.
# Super Charger is "No" ~99.7% of the time).
LOW_INFO_OVERRIDE = {"msp", "discountValue", "dealer_id", "dealer_id_new", "Super Charger"}

# High-missing engineering/spec fields that exceed the missing-value threshold.
HIGH_MISSING_OVERRIDE = {
    "BoreX Stroke", "Front Tread", "Rear Tread", "Gross Weight",
    "Compression Ratio", "Ground Clearance Unladen",
}

# Free-text list columns (stringified Python lists of feature names). Kept as
# "useful" but flagged Transform: they get converted into feature *counts*
# during feature engineering rather than used as raw text.
FEATURE_LIST_COLS = {
    "top_features", "comfort_features", "interior_features",
    "exterior_features", "safety_features",
}

# High-cardinality free text that duplicates lower-cardinality info already kept
# (Engine Type name strings largely restate Displacement / No of Cylinder / Max Power).
LOW_INFO_HIGH_CARDINALITY_TEXT = {"Engine Type"}


def _flatten_duplicate_columns() -> Tuple[set, set]:
    """Return (all_columns_in_groups, columns_to_drop_as_duplicates)."""
    all_cols, drop_cols = set(), set()
    for group_name, cols in DUPLICATE_GROUPS.items():
        canonical = KEEP_CANONICAL[group_name]
        for c in cols:
            all_cols.add(c)
            if c != canonical:
                drop_cols.add(c)
    return all_cols, drop_cols


DUPLICATE_ALL_COLS, DUPLICATE_DROP_COLS = _flatten_duplicate_columns()


def classify_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Classify every column into one of:
      Target | Useful predictive feature | Duplicate feature | Identifier |
      Website/metadata field | High-missing-value feature | Low-information
      feature | Potential data leakage feature

    Returns a DataFrame matching the required feature-analysis-report schema.
    """
    n = len(df)
    rows = []

    for col in df.columns:
        dtype = str(df[col].dtype)
        missing_pct = round(df[col].isna().sum() / n * 100, 2)
        nunique = df[col].nunique(dropna=True)

        classification, action, reason = _classify_single_column(
            df, col, dtype, missing_pct, nunique, n
        )

        rows.append(
            {
                "Column Name": col,
                "Data Type": dtype,
                "Missing %": missing_pct,
                "Unique Values": nunique,
                "Classification": classification,
                "Recommended Action": action,
                "Reason": reason,
            }
        )

    report = pd.DataFrame(rows)
    return report


def _classify_single_column(
    df: pd.DataFrame, col: str, dtype: str, missing_pct: float, nunique: int, n: int
) -> Tuple[str, str, str]:
    """Apply curated rules first, then fall back to statistical heuristics."""

    # --- target -------------------------------------------------------------------
    if col == TARGET_COL:
        return ("Target", "Keep",
                "This is the prediction target (display-formatted; cleaned separately).")

    # --- direct leakage of the target ----------------------------------------------
    if col in LEAKAGE_COLS:
        return ("Potential data leakage feature", "Drop",
                "Numerically identical to (or directly derived from) the target price.")

    if col in DUPLICATE_GROUPS["price_segment_derived"]:
        return ("Potential data leakage feature", "Drop",
                "Price bucket computed directly from the target; using it would leak the answer.")

    # --- identifiers -----------------------------------------------------------------
    if col in IDENTIFIER_COLS:
        return ("Identifier", "Drop",
                "Unique per-listing identifier / URL with no generalizable predictive signal.")

    # --- website/listing metadata -----------------------------------------------------
    if col in WEBSITE_METADATA_COLS:
        return ("Website/metadata field", "Drop",
                "Describes the listing/website session, not an attribute of the vehicle itself.")

    # --- duplicate features -----------------------------------------------------------
    if col in DUPLICATE_DROP_COLS:
        group = next(g for g, cols in DUPLICATE_GROUPS.items() if col in cols)
        canonical = KEEP_CANONICAL[group]
        if canonical is None:
            return ("Duplicate feature", "Drop",
                    f"Redundant member of the '{group}' duplicate group; whole group dropped.")
        return ("Duplicate feature", "Drop",
                f"Duplicate encoding of '{canonical}' (group: {group}); keeping only the canonical column.")

    # --- explicit low-information overrides --------------------------------------------
    if col in LOW_INFO_OVERRIDE:
        return ("Low-information feature", "Drop",
                "Column is dominated (>99%) by a single value; carries negligible predictive signal.")

    if col in LOW_INFO_HIGH_CARDINALITY_TEXT:
        return ("Low-information feature", "Drop",
                "Free-text field whose signal is already captured by structured spec columns "
                "(Displacement, No of Cylinder, Max Power); too high-cardinality to one-hot usefully.")

    # --- explicit high-missing overrides -------------------------------------------------
    if col in HIGH_MISSING_OVERRIDE:
        return ("High-missing-value feature", "Drop",
                f"{missing_pct}% missing, above the {HIGH_MISSING_THRESHOLD_PCT}% threshold.")

    # --- feature-list columns (engineered into counts) -----------------------------------
    if col in FEATURE_LIST_COLS:
        return ("Useful predictive feature", "Transform",
                "Stringified list of equipment; converted into a feature-count during engineering.")

    # ======================= statistical fallback (covers everything else) =======================
    if missing_pct >= HIGH_MISSING_THRESHOLD_PCT:
        return ("High-missing-value feature", "Drop",
                f"{missing_pct}% missing, above the {HIGH_MISSING_THRESHOLD_PCT}% threshold.")

    if nunique <= 1:
        return ("Low-information feature", "Drop", "Constant column (0 or 1 unique value).")

    if n > 0:
        dominant_ratio = df[col].value_counts(normalize=True, dropna=True).iloc[0] if nunique else 1.0
        if dominant_ratio >= DOMINANT_CLASS_RATIO_THRESHOLD:
            return ("Low-information feature", "Drop",
                    f"One value accounts for {dominant_ratio:.1%} of non-null rows.")

    if dtype == "object" and nunique / max(n, 1) >= NEAR_UNIQUE_RATIO_THRESHOLD:
        return ("Identifier", "Drop",
                "Nearly as many unique values as rows; behaves like a row identifier.")

    return ("Useful predictive feature", "Keep",
            "Passed all exclusion rules: sufficiently populated, non-constant, non-identifier.")


def save_feature_report(report: pd.DataFrame, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report.to_csv(output_path, index=False)
    logger.info("Feature analysis report saved to %s (%d columns classified)",
                output_path, len(report))
    logger.info("Classification breakdown:\n%s",
                report["Classification"].value_counts().to_string())


# ======================================================================================
# 5/6. Feature engineering + final feature-set selection
# ======================================================================================

def _extract_leading_number(series: pd.Series) -> pd.Series:
    """
    Pull the first numeric token out of messy spec strings, e.g.
    '3599mm' -> 3599, '58.16bhp@6200rpm' -> 58.16, '180-liters' -> 180,
    '4.6 metres' -> 4.6, '5 Speed' -> 5. Returns NaN where no number is found
    (handled later by the imputer).
    """
    extracted = series.astype(str).str.extract(r"(-?\d+\.?\d*)")[0]
    return pd.to_numeric(extracted, errors="coerce")


def _standardize_yes_no(series: pd.Series) -> pd.Series:
    """Collapse inconsistent Yes/No/YES/no/Twin style values into 'Yes' / 'No'."""
    cleaned = series.astype(str).str.strip().str.lower()
    mapping = {"yes": "Yes", "no": "No", "twin": "Yes", "y": "Yes", "n": "No"}
    return cleaned.map(mapping)


OWNER_MAP = {
    "first": 1, "1st": 1,
    "second": 2, "2nd": 2,
    "third": 3, "3rd": 3,
    "fourth": 4, "4th": 4,
    "fifth": 5, "5th": 5,
    "unregistered car": 0, "unregistered": 0,
}

DRIVE_TYPE_MAP = {
    "two wheel drive": "2WD", "2wd": "2WD",
    "front wheel drive": "FWD", "fwd": "FWD",
    "rear wheel drive": "RWD", "rwd": "RWD",
    "four wheel drive": "4WD", "4wd": "4WD",
    "all wheel drive": "AWD", "awd": "AWD",
}


def _standardize_drive_type(series: pd.Series) -> pd.Series:
    cleaned = series.astype(str).str.strip().str.lower()
    mapped = cleaned.map(DRIVE_TYPE_MAP)
    fallback = series.astype(str).str.strip().str.upper().replace({"NAN": np.nan})
    return mapped.fillna(fallback)


def _count_feature_list(series: pd.Series) -> pd.Series:
    """Safely count items in a stringified Python list column, e.g. "['A', 'B']" -> 2."""

    def _count(value) -> float:
        if pd.isna(value):
            return np.nan
        try:
            parsed = ast.literal_eval(value)
            if isinstance(parsed, (list, tuple, set)):
                return float(len(parsed))
        except (ValueError, SyntaxError):
            pass
        return np.nan

    return series.apply(_count)


def clean_target(df: pd.DataFrame) -> pd.Series:
    """
    Rebuild a clean numeric price target.

    'pu' (raw purchase-value string, e.g. "3,70,000") is used as the primary
    source because it is exact, whereas the display column 'price'
    (e.g. "₹ 3.70 Lakh") is rounded to two decimal Lakhs and loses precision.
    A regex-based fallback parser is included in case 'pu' is unavailable in
    a future data feed.
    """
    if "pu" in df.columns:
        target = pd.to_numeric(
            df["pu"].astype(str).str.replace(",", "", regex=False), errors="coerce"
        )
        logger.info("Target reconstructed from 'pu' (precise raw price).")
        return target

    logger.warning("'pu' column not found — falling back to parsing formatted 'price' text.")

    def _parse(text: str) -> float:
        if pd.isna(text):
            return np.nan
        text = str(text).replace("₹", "").strip()
        match = re.match(r"([\d.]+)\s*(Lakh|Crore)?", text, flags=re.IGNORECASE)
        if not match:
            return np.nan
        value = float(match.group(1))
        unit = (match.group(2) or "").lower()
        if unit == "lakh":
            value *= 100_000
        elif unit == "crore":
            value *= 10_000_000
        return value

    return df[TARGET_COL].apply(_parse)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build the final model-ready dataframe: clean target, engineer numeric
    features out of messy spec strings, standardize categorical values, and
    derive car_age / equipment-count features.

    Returns a NEW dataframe containing only the engineered/cleaned columns
    that make up the final feature set (plus the target).
    """
    work = pd.DataFrame(index=df.index)

    # ---- target -------------------------------------------------------------------
    work[TARGET_COL] = clean_target(df)

    # ---- car age (from manufacturing year) ----------------------------------------
    work["car_age"] = CURRENT_YEAR - df["myear"]

    # ---- kilometers driven (already numeric & clean) -------------------------------
    work["km_driven"] = pd.to_numeric(df["km_driven"], errors="coerce")

    # ---- engine / performance specs (numeric extraction from text) -----------------
    work["engine_cc"] = pd.to_numeric(df["Displacement"], errors="coerce")
    work["cylinders"] = pd.to_numeric(df["No of Cylinder"], errors="coerce")
    work["valves_per_cylinder"] = pd.to_numeric(df["Values per Cylinder"], errors="coerce")
    work["power_bhp"] = _extract_leading_number(df["Max Power"])
    work["torque_nm"] = _extract_leading_number(df["Max Torque"])
    work["mileage_kmpl"] = _extract_leading_number(df["mileage_new"])

    # ---- dimensions -------------------------------------------------------------
    work["length_mm"] = _extract_leading_number(df["Length"])
    work["width_mm"] = _extract_leading_number(df["Width"])
    work["height_mm"] = _extract_leading_number(df["Height"])
    work["wheelbase_mm"] = _extract_leading_number(df["Wheel Base"])
    work["kerb_weight_kg"] = _extract_leading_number(df["Kerb Weight"])
    work["seating_capacity"] = pd.to_numeric(df["seating_capacity_new"], errors="coerce")
    work["doors"] = pd.to_numeric(df["No Door Numbers"], errors="coerce")

    # ---- moderately-missing spec columns (kept, below the drop threshold) ----------
    work["gear_count"] = _extract_leading_number(df["Gear Box"])
    work["turning_radius_m"] = _extract_leading_number(df["Turning Radius"])
    work["top_speed_kmph"] = _extract_leading_number(df["Top Speed"])
    work["acceleration_sec"] = _extract_leading_number(df["Acceleration"])
    work["cargo_volume_liters"] = _extract_leading_number(df["Cargo Volumn"])
    work["alloy_wheel_size_in"] = _extract_leading_number(df["Alloy Wheel Size"])

    # ---- ownership history (ordinal-ish -> numeric) ---------------------------------
    work["owner_count"] = df["owner_type_new"].astype(str).str.strip().str.lower().map(OWNER_MAP)

    # ---- equipment richness (stringified list columns -> counts) -------------------
    for col in FEATURE_LIST_COLS:
        work[f"n_{col}"] = _count_feature_list(df[col])
    work["total_feature_count"] = work[[f"n_{c}" for c in FEATURE_LIST_COLS]].sum(
        axis=1, skipna=True
    )

    # ---- standardized categoricals --------------------------------------------------
    work["brand"] = df["oem"].astype(str).str.strip().str.title()
    work["model"] = df["model"].astype(str).str.strip().str.title()
    work["variant"] = df["variantName"].astype(str).str.strip().str.title()
    work["city"] = df["city_x"].astype(str).str.strip().str.title()
    work["state"] = df["state"].astype(str).str.strip().str.title()
    work["fuel_type"] = df["fuel_type_new"].astype(str).str.strip().str.title()
    work["transmission_type"] = df["transmission_type_new"].astype(str).str.strip().str.title()
    work["body_type"] = df["body_type_new"].astype(str).str.strip().str.title()
    work["seller_type"] = df["seller_type_new"].astype(str).str.strip().str.title()
    work["listing_type"] = df["carType"].astype(str).str.strip().str.title()
    work["color"] = df["Color"].astype(str).str.strip().str.title()
    work["drive_type"] = _standardize_drive_type(df["Drive Type"])
    work["steering_type"] = df["Steering Type"].astype(str).str.strip().str.title()
    work["front_brake_type"] = df["Front Brake Type"].astype(str).str.strip().str.title()
    work["rear_brake_type"] = df["Rear Brake Type"].astype(str).str.strip().str.title()
    work["tyre_type"] = df["Tyre Type"].astype(str).str.strip().str.title()
    work["fuel_supply_system"] = df["Fuel Suppy System"].astype(str).str.strip().str.title()
    work["value_configuration"] = df["Value Configuration"].astype(str).str.strip().str.upper()
    work["has_turbo"] = _standardize_yes_no(df["Turbo Charger"]).map({"Yes": 1, "No": 0})

    # "nan"/"None" text leftovers from the .astype(str) calls above must become real NaN
    # so the imputers treat them as missing instead of a bogus category.
    text_cols = work.select_dtypes(include=["object"]).columns
    work[text_cols] = work[text_cols].replace(
        {"Nan": np.nan, "None": np.nan, "nan": np.nan, "<Na>": np.nan}
    )

    return work


def remove_price_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """
    Trim extreme target outliers (e.g. scraping errors like a 55-crore hatchback)
    using a wide 1st-99th percentile band. Only the TARGET is used to decide
    which rows to drop — no feature is used for outlier logic, so this cannot
    leak information from features into the split.
    """
    before = len(df)
    lower = df[TARGET_COL].quantile(PRICE_LOWER_QUANTILE)
    upper = df[TARGET_COL].quantile(PRICE_UPPER_QUANTILE)
    trimmed = df[(df[TARGET_COL] >= lower) & (df[TARGET_COL] <= upper)].copy()
    logger.info(
        "Outlier trimming on target (%.1f%%-%.1f%% quantiles = [%.0f, %.0f]): "
        "removed %d / %d rows",
        PRICE_LOWER_QUANTILE * 100, PRICE_UPPER_QUANTILE * 100, lower, upper,
        before - len(trimmed), before,
    )
    return trimmed


def build_final_feature_set(work: pd.DataFrame) -> Tuple[List[str], List[str]]:
    """Split the engineered dataframe's columns into numeric vs categorical feature lists."""
    numeric_features = [
        "car_age", "km_driven", "engine_cc", "cylinders", "valves_per_cylinder",
        "power_bhp", "torque_nm", "mileage_kmpl", "length_mm", "width_mm",
        "height_mm", "wheelbase_mm", "kerb_weight_kg", "seating_capacity", "doors",
        "gear_count", "turning_radius_m", "top_speed_kmph", "acceleration_sec",
        "cargo_volume_liters", "alloy_wheel_size_in", "owner_count",
        "n_top_features", "n_comfort_features", "n_interior_features",
        "n_exterior_features", "n_safety_features", "total_feature_count", "has_turbo",
    ]
    categorical_features = [
        "brand", "model", "variant", "city", "state", "fuel_type", "transmission_type",
        "body_type", "seller_type", "listing_type", "color", "drive_type",
        "steering_type", "front_brake_type", "rear_brake_type", "tyre_type",
        "fuel_supply_system", "value_configuration",
    ]
    return numeric_features, categorical_features


# ======================================================================================
# 7/8. Train/test split + preprocessing pipeline
# ======================================================================================

def build_preprocessor(numeric_features: List[str], categorical_features: List[str]) -> ColumnTransformer:
    """
    Single shared preprocessing pipeline reused by every model (and by the
    inference API): median-impute + scale numeric columns, most-frequent-impute
    + one-hot encode categorical columns. High-cardinality categoricals
    (brand/model/variant/city) are capped via max_categories so the encoded
    matrix stays a manageable, fixed size in production.
    """
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "onehot",
                OneHotEncoder(
                    handle_unknown="infrequent_if_exist",
                    max_categories=HIGH_CARDINALITY_ONEHOT_CAP,
                    sparse_output=False,
                ),
            ),
        ]
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_features),
            ("cat", categorical_pipeline, categorical_features),
        ],
        remainder="drop",
    )
    return preprocessor


# ======================================================================================
# 9/10/11. Train, evaluate, compare models
# ======================================================================================

def get_candidate_models() -> Dict[str, object]:
    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(
            n_estimators=300, max_depth=None, n_jobs=-1,
            random_state=RANDOM_STATE,
        ),
    }
    if CATBOOST_AVAILABLE:
        models["CatBoost"] = CatBoostRegressor(
            iterations=800, learning_rate=0.05, depth=8,
            random_state=RANDOM_STATE, verbose=False, loss_function="RMSE",
        )
    else:
        logger.warning("catboost is not installed — skipping the CatBoost model. "
                        "Install with: pip install catboost")
    return models


def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = r2_score(y_true, y_pred)
    return {"MAE": mae, "RMSE": rmse, "R2": r2}


def train_and_evaluate_models(
    X_train: pd.DataFrame, X_test: pd.DataFrame,
    y_train: pd.Series, y_test: pd.Series,
    preprocessor: ColumnTransformer,
) -> Dict[str, dict]:
    """Fit every candidate model through the shared preprocessing Pipeline."""
    results: Dict[str, dict] = {}

    for name, estimator in get_candidate_models().items():
        logger.info("Training %s ...", name)
        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", estimator)])
        pipeline.fit(X_train, y_train)

        preds = pipeline.predict(X_test)
        metrics = evaluate_predictions(y_test.to_numpy(), preds)

        logger.info("%s -> MAE=%.2f | RMSE=%.2f | R2=%.4f",
                     name, metrics["MAE"], metrics["RMSE"], metrics["R2"])

        results[name] = {"pipeline": pipeline, "metrics": metrics}

    return results


def compare_models(results: Dict[str, dict]) -> pd.DataFrame:
    comparison = pd.DataFrame(
        {name: r["metrics"] for name, r in results.items()}
    ).T
    comparison = comparison[["MAE", "RMSE", "R2"]].sort_values("RMSE")
    logger.info("\nModel comparison (sorted by RMSE, ascending):\n%s", comparison.to_string())
    return comparison


def select_best_model(results: Dict[str, dict], comparison: pd.DataFrame) -> Tuple[str, Pipeline]:
    best_name = comparison.index[0]  # lowest RMSE
    logger.info("Selected best model: %s (RMSE=%.2f, R2=%.4f)",
                best_name, comparison.loc[best_name, "RMSE"], comparison.loc[best_name, "R2"])
    return best_name, results[best_name]["pipeline"]


# ======================================================================================
# 12/13. Persist artifacts
# ======================================================================================

def get_encoded_feature_names(preprocessor: ColumnTransformer) -> List[str]:
    """Recover human-readable feature names after the ColumnTransformer (for importances)."""
    try:
        return list(preprocessor.get_feature_names_out())
    except Exception:  # pragma: no cover - defensive fallback for older sklearn
        return [f"feature_{i}" for i in range(preprocessor.transform(preprocessor).shape[1])]


def save_feature_importance(
    best_name: str, best_pipeline: Pipeline, output_path: Path, top_n: int = 20
) -> None:
    """Save a horizontal bar chart of the top-N feature importances, if supported."""
    model = best_pipeline.named_steps["model"]
    if not hasattr(model, "feature_importances_"):
        logger.info("%s has no feature_importances_ attribute — skipping importance plot.",
                    best_name)
        return

    preprocessor = best_pipeline.named_steps["preprocessor"]
    feature_names = get_encoded_feature_names(preprocessor)
    importances = model.feature_importances_

    importance_df = (
        pd.DataFrame({"feature": feature_names, "importance": importances})
        .sort_values("importance", ascending=False)
        .head(top_n)
        .iloc[::-1]  # smallest-to-largest for a nicer horizontal bar chart
    )

    plt.figure(figsize=(9, 8))
    plt.barh(importance_df["feature"], importance_df["importance"], color="#2E6F95")
    plt.xlabel("Importance")
    plt.title(f"Top {top_n} Feature Importances — {best_name}")
    plt.tight_layout()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=150)
    plt.close()
    logger.info("Feature importance plot saved to %s", output_path)


def save_model_artifacts(
    best_pipeline: Pipeline, feature_columns: List[str], output_dir: Path
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "price_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(best_pipeline, f)
    logger.info("Trained pipeline (preprocessing + model) saved to %s", model_path)

    columns_path = output_dir / "feature_columns.pkl"
    with open(columns_path, "wb") as f:
        pickle.dump(feature_columns, f)
    logger.info("Exact ordered input-feature list saved to %s "
                "(inference API must supply columns in this order).", columns_path)


# ======================================================================================
# main
# ======================================================================================




def main() -> None:

    # ---- 1. Load ---------------------------------------------------------------
    df_raw = pd.read_csv("datasets/cars_details_merges.csv")

    # ---- 2. EDA -----------------------------------------------------------------
    run_eda(df_raw, OUTPUT_DIR_REPORTS / "eda_summary.txt")
    n_duplicates = df_raw.duplicated().sum()
    if n_duplicates:
        logger.info("Dropping %d exact duplicate rows.", n_duplicates)
        df_raw = df_raw.drop_duplicates().reset_index(drop=True)

    # ---- 3/4. Classify every column + save the report ---------------------------
    feature_report = classify_columns(df_raw)
    save_feature_report(feature_report, OUTPUT_DIR_REPORTS / "feature_analysis.csv")

    # ---- 5/6. Feature engineering (also rebuilds the clean numeric target) -------
    work_df = engineer_features(df_raw)
    work_df = work_df.dropna(subset=[TARGET_COL])
    work_df = remove_price_outliers(work_df)

    numeric_features, categorical_features = build_final_feature_set(work_df)
    feature_columns = numeric_features + categorical_features
    logger.info("Final feature set: %d numeric + %d categorical = %d total features",
                len(numeric_features), len(categorical_features), len(feature_columns))

    X = work_df[feature_columns]
    y = work_df[TARGET_COL]

    # ---- 7. Train/test split -----------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    logger.info("Train/test split -> train=%d rows, test=%d rows", len(X_train), len(X_test))

    # ---- 8. Shared preprocessing pipeline -----------------------------------------
    preprocessor = build_preprocessor(numeric_features, categorical_features)

    # ---- 9/10. Train + evaluate every model ----------------------------------------
    results = train_and_evaluate_models(X_train, X_test, y_train, y_test, preprocessor)

    # ---- 11. Compare & select the best model ---------------------------------------
    comparison = compare_models(results)
    OUTPUT_DIR_REPORTS.mkdir(parents=True, exist_ok=True)
    comparison.to_csv(OUTPUT_DIR_REPORTS / "model_comparison.csv")
    best_name, best_pipeline = select_best_model(results, comparison)

    # ---- 12/13. Persist model + feature importance ---------------------------------
    save_model_artifacts(best_pipeline, feature_columns, OUTPUT_DIR_MODELS)
    save_feature_importance(
        best_name, best_pipeline, OUTPUT_DIR_MODELS / "feature_importance.png"
    )

    logger.info("Training pipeline complete. Best model: %s", best_name)


if __name__ == "__main__":
    main()
