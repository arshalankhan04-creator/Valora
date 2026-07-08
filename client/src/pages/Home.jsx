import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [brand, setBrand] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      // Build query params
      const params = {};
      if (brand.trim()) params.brand = brand.trim();
      if (fuelType) params.fuelType = fuelType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get('/listings', { params });
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch listings on mount and when filters change
  useEffect(() => {
    // Debounce brand input to avoid excessive requests
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(timer);
  }, [brand, fuelType, minPrice, maxPrice]);

  return (
    <div>
      <h1>Browse Listings</h1>

      {/* Filter Section */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Filter Vehicles</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="filter-brand">Brand:</label>
            <br />
            <input
              id="filter-brand"
              type="text"
              placeholder="e.g. Audi"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filter-fuel">Fuel Type:</label>
            <br />
            <select
              id="filter-fuel"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            >
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="CNG">CNG</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-min-price">Min Price (₹):</label>
            <br />
            <input
              id="filter-min-price"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filter-max-price">Max Price (₹):</label>
            <br />
            <input
              id="filter-max-price"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setBrand('');
                setFuelType('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div>Loading listings...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : listings.length === 0 ? (
        <div>No listings found. Try adjusting your filters.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {listings.map((listing) => {
            const hasImage = listing.images && listing.images.length > 0;
            const thumbnailUrl = hasImage
              ? `http://localhost:5000/${listing.images[0]}`
              : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="150" viewBox="0 0 250 150"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23666">No Image Available</text></svg>`;

            return (
              <div
                key={listing._id}
                style={{
                  border: '1px solid #ddd',
                  padding: '10px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                <Link to={`/listings/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img
                    src={thumbnailUrl}
                    alt={`${listing.brand} ${listing.model}`}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }}
                  />
                  <h4 style={{ margin: '5px 0' }}>
                    {listing.brand} {listing.model}
                  </h4>
                  <p style={{ margin: '5px 0', color: '#555' }}>Year: {listing.year}</p>
                  <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Price: ₹{listing.price.toLocaleString('en-IN')}</p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
