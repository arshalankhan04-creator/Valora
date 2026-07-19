import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import CarCard from '../components/CarCard';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States initialized from URL Search Params
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minYear, setMinYear] = useState(searchParams.get('minYear') || '');
  const [maxYear, setMaxYear] = useState(searchParams.get('maxYear') || '');
  const [selectedFuels, setSelectedFuels] = useState(
    searchParams.get('fuelType') ? searchParams.get('fuelType').split(',') : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 6;

  // Years options list (2015 to 2026)
  const yearsList = [];
  for (let y = 2015; y <= 2026; y++) {
    yearsList.push(y);
  }

  // Sync URL search parameters on filter changes
  useEffect(() => {
    const params = {};
    if (selectedBrand) params.brand = selectedBrand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minYear) params.minYear = minYear;
    if (maxYear) params.maxYear = maxYear;
    if (selectedFuels.length > 0) params.fuelType = selectedFuels.join(',');
    if (sortBy) params.sort = sortBy;
    if (selectedModel) params.model = selectedModel;
    if (selectedLocation) params.location = selectedLocation;
    
    setSearchParams(params, { replace: true });
  }, [selectedBrand, minPrice, maxPrice, minYear, maxYear, selectedFuels, sortBy, selectedModel, selectedLocation]);

  // Fetch unique brands on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await api.get('/listings');
        const brands = [...new Set(res.data.map(item => item.brand))].sort();
        setAvailableBrands(brands);
      } catch (err) {
        console.error('Error fetching initial brands:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch filtered listings from API
  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedBrand) params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minYear) params.minYear = minYear;
      if (maxYear) params.maxYear = maxYear;
      if (selectedFuels.length > 0) params.fuelType = selectedFuels.join(',');
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/listings', { params });
      let filtered = res.data;

      // Client-side fallback filter for Model and Location
      if (selectedModel) {
        filtered = filtered.filter(item => 
          item.model.toLowerCase().includes(selectedModel.toLowerCase()) || 
          (item.description && item.description.toLowerCase().includes(selectedModel.toLowerCase()))
        );
      }

      if (selectedLocation) {
        filtered = filtered.filter(item => 
          item.description && item.description.toLowerCase().includes(selectedLocation.toLowerCase())
        );
      }

      setListings(filtered);
      setCurrentPage(1); // Reset to first page when query changes
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced API fetch on filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedBrand, minPrice, maxPrice, minYear, maxYear, selectedFuels, sortBy, selectedModel, selectedLocation]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setSelectedFuels([]);
    setSortBy('-createdAt');
    setSelectedModel('');
    setSelectedLocation('');
  };

  // Fuel Checkbox Change
  const handleFuelCheckboxChange = (fuel) => {
    if (selectedFuels.includes(fuel)) {
      setSelectedFuels(selectedFuels.filter(f => f !== fuel));
    } else {
      setSelectedFuels([...selectedFuels, fuel]);
    }
  };

  // Pagination Math
  const totalPages = Math.ceil(listings.length / listingsPerPage);
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(indexOfFirstListing, indexOfLastListing);

  const displayTotalPages = Math.max(totalPages, 15);

  const getPageNumbers = () => {
    const limit = displayTotalPages;
    if (limit <= 5) {
      return Array.from({ length: limit }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', limit];
    }
    if (currentPage >= limit - 2) {
      return [1, '...', limit - 2, limit - 1, limit];
    }
    return [1, '...', currentPage, '...', limit];
  };

  return (
    <div className="w-full bg-bgLight min-h-screen py-12 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Filters Column (3 cols) */}
          <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-extrabold text-black m-0">
                Filters
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-primary hover:text-primaryDark bg-transparent border-none cursor-pointer hover:underline transition-colors"
              >
                Reset All
              </button>
            </div>
            <p className="text-xs text-gray-400 m-0 mb-6 leading-none">
              Narrow your search
            </p>

            <div className="space-y-5">
              {/* Brand (Make) Selector */}
              <div>
                <label className="block text-[10px] font-extrabold tracking-wider text-gray-400 mb-2 uppercase">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">All Brands</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-[1px] bg-gray-100 w-full" />

              {/* Trust Score Slider (Placeholder - Disabled) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
                    Trust Score
                  </label>
                  <span className="text-[10px] font-extrabold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    N/A
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled
                  className="w-full accent-gray-300 cursor-not-allowed opacity-60"
                />
                <span className="text-[9px] text-gray-400 italic mt-1 block">
                  Trust score filtering currently N/A (requires ML verification model)
                </span>
              </div>

              <div className="h-[1px] bg-gray-100 w-full" />

              {/* Price Range */}
              <div>
                <label className="block text-[10px] font-extrabold tracking-wider text-gray-400 mb-2 uppercase">
                  Price Range
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-gray-400 text-xs font-bold">to</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="h-[1px] bg-gray-100 w-full" />

              {/* Year Selector */}
              <div>
                <label className="block text-[10px] font-extrabold tracking-wider text-gray-400 mb-2 uppercase">
                  Year
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Min</option>
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400 text-xs font-bold">to</span>
                  <select
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Max</option>
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-[1px] bg-gray-100 w-full" />

              {/* Fuel Type Checkboxes */}
              <div>
                <label className="block text-[10px] font-extrabold tracking-wider text-gray-400 mb-3 uppercase">
                  Fuel Type
                </label>
                <div className="space-y-2.5">
                  {['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].map((fuel) => (
                    <label key={fuel} className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900 select-none">
                      <input
                        type="checkbox"
                        checked={selectedFuels.includes(fuel)}
                        onChange={() => handleFuelCheckboxChange(fuel)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span>{fuel}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Active Custom Filters */}
              {(selectedModel || selectedLocation) && (
                <>
                  <div className="h-[1px] bg-gray-100 w-full" />
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-wider text-gray-400 mb-2.5 uppercase">
                      Active Search Filters
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedModel && (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-full select-none">
                          Model: {selectedModel}
                          <button 
                            onClick={() => setSelectedModel('')}
                            type="button" 
                            className="hover:text-red-500 font-extrabold text-[10px] cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                          >
                            ✕
                          </button>
                        </span>
                      )}
                      {selectedLocation && (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-full select-none">
                          Loc: {selectedLocation}
                          <button 
                            onClick={() => setSelectedLocation('')}
                            type="button" 
                            className="hover:text-red-500 font-extrabold text-[10px] cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                          >
                            ✕
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Reset Action Block */}
            <button
              onClick={handleResetFilters}
              className="w-full py-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-extrabold text-primary transition-colors cursor-pointer mt-6"
            >
              Clear Filters
            </button>
          </div>

          {/* Right Side: Search Results & Grid (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Results Header Control Bar in a Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-row items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-black m-0">
                  Search Results
                </h2>
                <span className="text-[10px] font-bold bg-indigo-50 text-primary border border-indigo-100 px-2.5 py-1 rounded-full select-none">
                  {listings.length} Matches
                </span>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 mr-1 select-none">
                  Sort by:
                </span>
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-extrabold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm appearance-none"
                  >
                    <option value="-createdAt">Newest</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-gray-400 flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0-4v12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            {loading ? (
              <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-[#4F46E5] rounded-full animate-spin" />
                <p className="text-gray-400 text-xs font-bold m-0">Loading matching vehicles...</p>
              </div>
            ) : error ? (
              <div className="w-full py-16 text-center bg-red-50 border border-red-100 rounded-2xl p-6">
                <p className="text-red-700 text-sm font-bold m-0">{error}</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="w-full py-20 text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-1 m-0">No matches found</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-[280px] mx-auto m-0 mb-4">
                  Try widening your price range, checking other brands, or clearing some filters.
                </p>
                <Button onClick={handleResetFilters} variant="primary" className="py-2 px-5 text-xs font-bold bg-primary">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Car Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentListings.map((listing) => (
                    <CarCard key={listing._id} car={listing} />
                  ))}
                </div>

                {/* Pagination Controls (Always show below cards when results exist) */}
                {listings.length > 0 && (
                  <div className="border-t border-gray-100 pt-8 mt-10 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">
                      Showing {indexOfFirstListing + 1}–{Math.min(indexOfLastListing, listings.length)} of {listings.length} listings
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`dots-${idx}`} className="w-9 h-9 text-gray-400 flex items-center justify-center font-bold text-sm select-none">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 rounded-xl text-sm font-extrabold flex items-center justify-center cursor-pointer transition-colors border-none focus:outline-none ${
                              currentPage === pageNum
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-transparent text-gray-600 hover:text-primary'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, displayTotalPages))}
                        disabled={currentPage === displayTotalPages}
                        className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Browse;
