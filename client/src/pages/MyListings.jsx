import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
    return <div>Loading authentication status...</div>;
  }

  if (!user || user.role !== 'seller') {
    return (
      <div>
        <h2>Access Denied</h2>
        <p style={{ color: 'red' }}>You are not authorized to view this page. Only sellers have access to their listings dashboard.</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  if (loading) {
    return <div>Loading your listings...</div>;
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'active':
        return 'Status: Active';
      case 'pending_review':
        return 'Status: Pending Review';
      case 'rejected':
        return 'Status: Rejected';
      case 'sold':
        return 'Status: Sold';
      default:
        return `Status: ${status}`;
    }
  };

  return (
    <div>
      <h2>My Vehicle Listings</h2>
      <Link to="/create-listing" style={{ display: 'inline-block', marginBottom: '20px' }}>
        + Add New Listing
      </Link>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {listings.length === 0 ? (
        <div>
          <p>You haven't listed any vehicles yet.</p>
          <Link to="/create-listing">Create Listing</Link>
        </div>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Model</th>
              <th>Year</th>
              <th>Price</th>
              <th>Status / Insights</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing._id}>
                <td>{listing.brand}</td>
                <td>{listing.model}</td>
                <td>{listing.year}</td>
                <td>₹{listing.price?.toLocaleString('en-IN')}</td>
                <td>
                  <div>
                    <strong>{formatStatus(listing.status)}</strong>
                  </div>
                  {listing.status === 'rejected' && listing.rejectionReason && (
                    <div style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>
                      Rejection Reason: {listing.rejectionReason}
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/listings/${listing._id}`}>View</Link>
                    <Link to={`/edit-listing/${listing._id}`}>Edit</Link>
                    <button type="button" onClick={() => handleDelete(listing._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyListings;
