import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CarCard from '../components/CarCard';
import Button from '../components/Button';

const Wishlist = () => {
  const { user, loading: authLoading, wishlist } = useAuth();
  const navigate = useNavigate();

  const [savedCars, setSavedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // Option values: newest, price-asc, price-desc

  // Fetch populated wishlist from API
  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/wishlist');
      setSavedCars(res.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load your wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        fetchWishlist();
      }
    }
  }, [user, authLoading, navigate]);

  // Filter listings based on what is globally in user's wishlist
  const filteredCars = savedCars.filter(car => wishlist.includes(car._id || car.id));

  // Sort listings
  const sortedCars = [...filteredCars];
  if (sortBy === 'newest') {
    // Reverse to show newest added (last appended) first
    sortedCars.reverse();
  } else if (sortBy === 'price-asc') {
    sortedCars.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    sortedCars.sort((a, b) => b.price - a.price);
  }

  if (authLoading || (loading && savedCars.length === 0)) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-16 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-tealPrimary rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-xs font-bold m-0">Loading your saved cars...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-bgLight min-h-screen py-12 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 m-0 tracking-tight">
              Wishlist
            </h1>
            <p className="text-xs text-gray-500 font-semibold m-0 mt-1 select-none">
              {filteredCars.length === 0 
                ? 'No saved cars' 
                : `${filteredCars.length} saved vehicle${filteredCars.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {filteredCars.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 select-none">
                Sort by:
              </span>
              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-extrabold text-gray-700 focus:outline-none focus:ring-2 focus:ring-tealPrimary cursor-pointer shadow-sm appearance-none"
                >
                  <option value="newest">Newest Saved</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="absolute right-2.5 pointer-events-none text-gray-400 flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0-4v12" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="w-full py-6 text-center bg-red-50 border border-red-100 rounded-2xl p-6 mb-8">
            <p className="text-red-700 text-sm font-bold m-0">{error}</p>
          </div>
        )}

        {filteredCars.length === 0 ? (
          <div className="w-full py-24 text-center bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center">
            {/* Empty State Heart Illustration */}
            <div className="w-16 h-16 rounded-full bg-red-50/50 flex items-center justify-center mb-6 border border-red-100/50">
              <svg className="w-8 h-8 text-red-500 fill-none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-950 mb-2 m-0 tracking-tight">No saved cars yet</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[340px] mx-auto m-0 mb-6">
              Browse listings and save the cars you're interested in.
            </p>
            <Link to="/browse">
              <Button variant="primary" className="py-3 px-6 text-xs font-bold bg-tealPrimary border-none text-white hover:bg-tealDark">
                Browse Cars
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
