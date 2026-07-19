import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyListings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/listings/mine');
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching my listings:', err);
      setError(err.response?.data?.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || user.role !== 'seller') return;
    fetchMyListings();
  }, [user, authLoading]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(listing => listing._id !== id));
      alert('Listing deleted successfully.');
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Auth Protection Guard
  if (authLoading) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-16 flex flex-col items-center justify-center font-sans text-gray-900">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-tealPrimary rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-xs font-bold m-0">Verifying authorization status...</p>
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return (
      <div className="w-full bg-bgLight min-h-screen py-16 flex flex-col items-center justify-center font-sans text-gray-900">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-950 mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
            You are not authorized to view this page. Only sellers have access to their listings dashboard.
          </p>
          <Link to="/">
            <Button variant="primary" className="py-2.5 px-6 text-xs font-bold bg-tealPrimary hover:bg-tealDark border-none text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-16 flex flex-col items-center justify-center font-sans text-gray-900">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-tealPrimary rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-xs font-bold m-0">Loading your listings...</p>
      </div>
    );
  }

  // Calculate Stat Counts
  const activeCount = listings.filter(l => l.status === 'active').length;
  const pendingCount = listings.filter(l => l.status === 'pending_review').length;
  const rejectedCount = listings.filter(l => l.status === 'rejected').length;

  // Image path resolver helper
  const getImageUrl = (listingItem) => {
    if (listingItem.image) return listingItem.image;
    if (listingItem.images && listingItem.images.length > 0) {
      const rawImage = listingItem.images[0];
      if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
        return rawImage;
      }
      return `http://localhost:5000/${rawImage}`;
    }
    return null;
  };

  const formatPrice = (p) => {
    return `₹${p.toLocaleString()}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'pending_review':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'sold':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  };

  const formatStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending_review':
        return 'Pending review';
      case 'rejected':
        return 'Rejected';
      case 'sold':
        return 'Sold';
      default:
        return status;
    }
  };

  return (
    <div className="w-full bg-bgLight min-h-screen py-12 flex flex-col font-sans text-gray-900">
      <div className="max-w-6xl mx-auto px-6 w-full text-left space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 m-0">
              My listings
            </h1>
            <p className="text-sm text-gray-500 m-0 mt-1 select-none leading-relaxed">
              Manage your listings and track their review status.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 select-none">
            {listings.length} vehicle{listings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div className="w-full py-4 px-6 bg-red-50 border border-red-100 rounded-2xl text-red-750 text-xs font-bold">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="w-full py-24 text-center bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-950 mb-2 m-0 tracking-tight">No listings found</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[340px] mx-auto m-0 mb-6">
              You haven't created any vehicle listings yet. Start selling today!
            </p>
            <Link to="/create-listing">
              <button className="px-6 py-3 bg-tealPrimary hover:bg-tealDark text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer border-none">
                List My Car
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stat Cards Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-2.5 shadow-sm">
                <span className="block text-[11px] font-extrabold tracking-wider text-gray-400 uppercase select-none">
                  Active
                </span>
                <span className="block text-4xl font-extrabold text-gray-955">
                  {activeCount}
                </span>
              </div>
              {/* Pending */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-2.5 shadow-sm">
                <span className="block text-[11px] font-extrabold tracking-wider text-gray-400 uppercase select-none">
                  Pending review
                </span>
                <span className="block text-4xl font-extrabold text-gray-955">
                  {pendingCount}
                </span>
              </div>
              {/* Rejected */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-2.5 shadow-sm">
                <span className="block text-[11px] font-extrabold tracking-wider text-gray-400 uppercase select-none">
                  Rejected
                </span>
                <span className="block text-4xl font-extrabold text-gray-955">
                  {rejectedCount}
                </span>
              </div>
            </div>

            {/* Listings Table Card */}
            <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 select-none text-left">
                      <th className="py-4 px-6 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Vehicle</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Brand</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Model</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Year</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Price</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Status / Insights</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {listings.map((listingItem) => {
                      const image = getImageUrl(listingItem);
                      
                      return (
                        <tr key={listingItem._id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Vehicle Thumbnail & Name */}
                          <td className="py-4 px-6 flex items-center gap-4 min-w-[240px]">
                            <div className="w-12 h-9 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center">
                              {image ? (
                                <img
                                  src={image}
                                  alt={`${listingItem.brand} ${listingItem.model}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                                </svg>
                              )}
                            </div>
                            <div className="text-left leading-normal">
                              <span className="font-bold text-gray-950 block text-sm">
                                {listingItem.brand} {listingItem.model} {listingItem.year}
                              </span>
                              {listingItem.status === 'rejected' && listingItem.rejectionReason && (
                                <span className="text-[10px] font-bold text-red-500 block mt-0.5">
                                  Reason: {listingItem.rejectionReason}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Brand */}
                          <td className="py-4 px-6 text-sm font-semibold text-gray-600">
                            {listingItem.brand}
                          </td>

                          {/* Model */}
                          <td className="py-4 px-6 text-sm font-semibold text-gray-600">
                            {listingItem.model}
                          </td>

                          {/* Year */}
                          <td className="py-4 px-6 text-sm font-semibold text-gray-600">
                            {listingItem.year}
                          </td>

                          {/* Price */}
                          <td className="py-4 px-6 text-sm font-bold text-gray-900">
                            {formatPrice(listingItem.price)}
                          </td>

                          {/* Status / Insights */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase select-none tracking-wider ${getStatusBadgeClass(listingItem.status)}`}>
                              {formatStatusText(listingItem.status)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right space-x-3 whitespace-nowrap">
                            <Link
                              to={`/listings/${listingItem._id}`}
                              className="text-sky-600 hover:text-sky-700 font-extrabold text-xs no-underline hover:underline transition-colors"
                            >
                              View
                            </Link>
                            <Link
                              to={`/edit-listing/${listingItem._id}`}
                              className="text-emerald-600 hover:text-emerald-700 font-extrabold text-xs no-underline hover:underline transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(listingItem._id)}
                              className="text-red-650 hover:text-red-750 font-extrabold text-xs no-underline hover:underline transition-colors bg-transparent border-none cursor-pointer p-0"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex justify-end pt-4 select-none">
              <Link to="/create-listing">
                <button className="px-6 py-3 bg-tealPrimary hover:bg-tealDark text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer border-none">
                  List a new car
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;
