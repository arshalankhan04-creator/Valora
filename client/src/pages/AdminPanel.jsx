import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('flagged'); // 'flagged' or 'all'
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const LIMIT = 10;

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'flagged' ? '/admin/flagged' : '/admin/listings';
      const res = await api.get(`${endpoint}?page=${page}&limit=${LIMIT}`);
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching listings for admin:', err);
      setError(err.response?.data?.message || 'Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || user.role !== 'admin') return;
    fetchListings();
  }, [user, authLoading, activeTab, page]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Reset page count when switching tabs
  };

  const handleApprove = async (id) => {
    setError('');
    try {
      await api.put(`/admin/listings/${id}/approve`);
      alert('Listing approved successfully.');
      
      // On success, if we are in flagged queue, we remove it. If in all listings, we can update status to active.
      if (activeTab === 'flagged') {
        setListings(prev => prev.filter(item => item._id !== id));
      } else {
        setListings(prev => prev.map(item => item._id === id ? { ...item, status: 'active', rejectionReason: null } : item));
      }
    } catch (err) {
      console.error('Approve listing error:', err);
      setError(err.response?.data?.message || 'Failed to approve listing.');
    }
  };

  const handleReject = async (id) => {
    setError('');
    const reason = window.prompt('Enter reason for rejection:');
    if (reason === null) return; // Cancelled - abort action entirely
    if (!reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    try {
      await api.put(`/admin/listings/${id}/reject`, { reason: reason.trim() });
      alert('Listing rejected successfully.');

      // On success, if in flagged queue, remove it. If in all listings, update status to rejected.
      if (activeTab === 'flagged') {
        setListings(prev => prev.filter(item => item._id !== id));
      } else {
        setListings(prev => prev.map(item => item._id === id ? { ...item, status: 'rejected', rejectionReason: reason.trim() } : item));
      }
    } catch (err) {
      console.error('Reject listing error:', err);
      setError(err.response?.data?.message || 'Failed to reject listing.');
    }
  };

  // Auth Guard check
  if (authLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div>
        <h2>Access Denied</h2>
        <p style={{ color: 'red' }}>You are not authorized to view this page. Admin privileges required.</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Moderation Panel</h2>

      {/* Tabs Toggles */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <button 
          onClick={() => handleTabChange('flagged')}
          style={{ fontWeight: activeTab === 'flagged' ? 'bold' : 'normal' }}
        >
          Flagged Queue
        </button>
        <button 
          onClick={() => handleTabChange('all')}
          style={{ fontWeight: activeTab === 'all' ? 'bold' : 'normal' }}
        >
          All Listings
        </button>
      </div>

      {error && <div style={{ color: 'darkred', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}

      {loading ? (
        <div>Loading listings...</div>
      ) : listings.length === 0 ? (
        <p>{activeTab === 'flagged' ? 'No listings need review.' : 'No listings found.'}</p>
      ) : (
        <div>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              {activeTab === 'flagged' ? (
                <tr>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Risk Flag</th>
                  <th>Seller Info</th>
                  <th>Actions</th>
                </tr>
              ) : (
                <tr>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Status / Moderation</th>
                  <th>Seller Info</th>
                  <th>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>{listing.brand}</td>
                  <td>{listing.model}</td>
                  <td>{listing.year}</td>
                  <td>₹{listing.price?.toLocaleString('en-IN')}</td>
                  <td>
                    <strong>Status: {listing.status}</strong>
                    {listing.status === 'rejected' && listing.rejectionReason && (
                      <div style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>
                        Reason: {listing.rejectionReason}
                      </div>
                    )}
                  </td>
                  
                  {activeTab === 'flagged' && (
                    <td>{listing.riskFlag || 'N/A'}</td>
                  )}

                  <td>
                    {listing.seller ? (
                      <div>
                        {listing.seller.name} <br />
                        <span style={{ fontSize: '0.85em', color: '#666' }}>{listing.seller.email}</span>
                      </div>
                    ) : (
                      'Unknown Seller'
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/listings/${listing._id}`}>View Details</Link>
                      {listing.status !== 'active' && (
                        <button type="button" onClick={() => handleApprove(listing._id)}>Approve</button>
                      )}
                      {listing.status !== 'rejected' && (
                        <button type="button" onClick={() => handleReject(listing._id)}>Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            >
              Previous Page
            </button>
            <span>Page {page}</span>
            <button 
              disabled={listings.length < LIMIT} 
              onClick={() => setPage(prev => prev + 1)}
            >
              Next Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
