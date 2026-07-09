import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showContactForm, setShowContactForm] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    if (!messageText.trim()) {
      setContactError('Please enter a message.');
      return;
    }

    setContactLoading(true);
    try {
      const res = await api.post('/inquiries', {
        listingId: id,
        text: messageText.trim()
      });
      const threadId = res.data._id;
      navigate(`/inquiries/${threadId}`);
    } catch (err) {
      console.error('Contact seller error:', err);
      setContactError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError('Listing not found');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return <div>Loading vehicle details...</div>;
  }

  if (error || !listing) {
    return (
      <div>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error || 'Listing not found'}</p>
        <Link to="/">Back to Browse Listings</Link>
      </div>
    );
  }

  // Safe string comparisons for seller ID vs logged-in user ID
  const getSellerId = (seller) => {
    if (!seller) return '';
    if (typeof seller === 'object') return seller._id || '';
    return seller;
  };

  const sellerId = getSellerId(listing.seller);
  const userId = user ? (user._id || user.id || '') : '';
  const isOwnListing = userId && sellerId && sellerId.toString() === userId.toString();

  // ML fields conditional display check
  const hasMLData = 
    (listing.trustScore !== null && listing.trustScore !== undefined) ||
    (listing.riskFlag !== null && listing.riskFlag !== undefined) ||
    (listing.conditionScore !== null && listing.conditionScore !== undefined) ||
    (listing.predictedPriceMin !== null && listing.predictedPriceMin !== undefined) ||
    (listing.predictedPriceMax !== null && listing.predictedPriceMax !== undefined);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      alert('Listing deleted successfully.');
      navigate('/');
    } catch (err) {
      console.error('Delete listing error:', err);
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  return (
    <div>
      <h2>{listing.brand} {listing.model} ({listing.year})</h2>
      <Link to="/" style={{ display: 'block', marginBottom: '15px' }}>&larr; Back to Browse</Link>

      {/* Image Gallery */}
      <div style={{ marginBottom: '20px' }}>
        {listing.images && listing.images.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {listing.images.map((img, index) => (
              <img
                key={index}
                src={`http://localhost:5000/${img}`}
                alt={`${listing.brand} ${listing.model} - ${index + 1}`}
                style={{ width: '300px', height: '200px', objectFit: 'cover', border: '1px solid #ccc' }}
              />
            ))}
          </div>
        ) : (
          <img
            src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23666">No Image Available</text></svg>`}
            alt="Placeholder"
            style={{ width: '400px', height: '250px', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Vehicle Info */}
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Price:</strong> ₹{listing.price.toLocaleString('en-IN')}</p>
        <p><strong>Kilometers Driven:</strong> {listing.kmDriven.toLocaleString()} km</p>
        <p><strong>Fuel Type:</strong> {listing.fuelType}</p>
        <p><strong>Transmission:</strong> {listing.transmission}</p>
        <p><strong>Seller:</strong> {listing.seller?.name || 'Unknown Seller'}</p>
        <p><strong>Description:</strong> {listing.description || 'No description provided.'}</p>
      </div>

      {/* Machine Learning / Django Analysis (Only show if non-null/present) */}
      {hasMLData && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', background: '#f9f9f9' }}>
          <h3>Valora Trust & Risk Analysis</h3>
          {listing.trustScore !== null && listing.trustScore !== undefined && (
            <p><strong>Trust Score:</strong> {listing.trustScore} / 100</p>
          )}
          {listing.riskFlag !== null && listing.riskFlag !== undefined && (
            <p><strong>Risk Level:</strong> {listing.riskFlag}</p>
          )}
          {listing.conditionScore !== null && listing.conditionScore !== undefined && (
            <p><strong>Condition Score:</strong> {listing.conditionScore} / 10</p>
          )}
          {((listing.predictedPriceMin !== null && listing.predictedPriceMin !== undefined) ||
            (listing.predictedPriceMax !== null && listing.predictedPriceMax !== undefined)) && (
            <p>
              <strong>Predicted Market Price Range:</strong> ₹{listing.predictedPriceMin?.toLocaleString('en-IN')} - ₹{listing.predictedPriceMax?.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        {!user ? (
          <div>
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              <Link to="/login">Log in</Link> to contact the seller.
            </p>
          </div>
        ) : user.role === 'admin' ? null : isOwnListing ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate(`/edit-listing/${id}`)}>Edit Listing</button>
            <button onClick={handleDelete}>Delete Listing</button>
          </div>
        ) : (
          <div>
            {!showContactForm ? (
              <button onClick={() => setShowContactForm(true)}>Contact Seller</button>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ maxWidth: '400px', marginTop: '10px' }}>
                <h4>Send Inquiry to Seller</h4>
                {contactError && <p style={{ color: 'red' }}>{contactError}</p>}
                <textarea
                  rows="4"
                  style={{ width: '100%', marginBottom: '10px' }}
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={contactLoading}
                  required
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={contactLoading}>
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowContactForm(false); setContactError(''); setMessageText(''); }} 
                    disabled={contactLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
