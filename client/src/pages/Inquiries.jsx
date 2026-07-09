import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Inquiries = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch if user is loaded and authenticated
    if (authLoading || !user) return;

    const fetchThreads = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/inquiries/mine');
        setThreads(res.data);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        setError(err.response?.data?.message || 'Failed to fetch inquiries.');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [user, authLoading]);

  // Auth check
  if (authLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!user) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p style={{ color: 'red' }}>Please log in to view your inquiries.</p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return <div>Loading inquiries...</div>;
  }

  const currentUserId = user._id || user.id || '';

  return (
    <div>
      <h2>My Inquiries / Inbox</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {threads.length === 0 ? (
        <p>No inquiries yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {threads.map((thread) => {
            // Determine other party
            const isBuyer = thread.buyer && thread.buyer._id?.toString() === currentUserId.toString();
            const otherParty = isBuyer ? thread.seller : thread.buyer;
            const otherPartyName = otherParty ? otherParty.name : 'Unknown';
            const otherPartyRole = isBuyer ? 'Seller' : 'Buyer';

            // Get last message snippet
            const messages = thread.messages || [];
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            const snippet = lastMessage ? lastMessage.text : 'No messages in thread';
            const timestamp = thread.updatedAt ? new Date(thread.updatedAt).toLocaleString() : '';

            const vehicleName = thread.listing 
              ? `${thread.listing.brand} ${thread.listing.model}` 
              : 'Deleted Listing';

            return (
              <div 
                key={thread._id} 
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '15px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  background: '#fafafa'
                }}
                onClick={() => navigate(`/inquiries/${thread._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong>{vehicleName}</strong>
                  <span style={{ fontSize: '0.85em', color: '#666' }}>{timestamp}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.9em', color: '#555' }}>
                    With {otherPartyName} ({otherPartyRole})
                  </span>
                </div>
                <div style={{ marginTop: '8px', color: '#333', fontStyle: 'italic' }}>
                  "{snippet.length > 60 ? snippet.substring(0, 60) + '...' : snippet}"
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inquiries;
