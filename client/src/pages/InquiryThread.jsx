import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const InquiryThread = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchThread = async () => {
    try {
      const res = await api.get(`/inquiries/${id}`);
      setThread(res.data);
    } catch (err) {
      console.error('Error fetching thread:', err);
      setError(err.response?.data?.message || 'Failed to load message thread.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchThread();
  }, [id, user, authLoading]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    setReplyError('');
    if (!replyText.trim()) return;

    setReplyLoading(true);
    try {
      await api.post(`/inquiries/${id}/messages`, { text: replyText.trim() });
      setReplyText('');
      // Refetch thread to get fully populated sender names for the new messages
      await fetchThread();
    } catch (err) {
      console.error('Error sending reply:', err);
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  // Auth Guard
  if (authLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!user) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p style={{ color: 'red' }}>Please log in to view this message thread.</p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return <div>Loading thread messages...</div>;
  }

  if (error || !thread) {
    return (
      <div>
        <h2>Thread Error</h2>
        <p style={{ color: 'red' }}>{error || 'Thread not found'}</p>
        <Link to="/inquiries">&larr; Back to Inbox</Link>
      </div>
    );
  }

  const currentUserId = user._id || user.id || '';

  // Determine other participant name
  const isBuyer = thread.buyer && thread.buyer._id?.toString() === currentUserId.toString();
  const otherParty = isBuyer ? thread.seller : thread.buyer;
  const otherPartyName = otherParty ? otherParty.name : 'Unknown User';

  return (
    <div>
      <h2>Chat with {otherPartyName}</h2>
      
      {/* Top Navigation / Metadata */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <Link to="/inquiries">&larr; Back to Inbox</Link>
        {thread.listing ? (
          <Link to={`/listings/${thread.listing._id}`}>
            Vehicle: {thread.listing.brand} {thread.listing.model}
          </Link>
        ) : (
          <span>Vehicle details unavailable</span>
        )}
      </div>

      {/* Message History */}
      <div 
        style={{ 
          border: '1px solid #ccc', 
          padding: '15px', 
          height: '350px', 
          overflowY: 'auto', 
          marginBottom: '20px',
          background: '#f9f9f9',
          borderRadius: '4px'
        }}
      >
        {thread.messages && thread.messages.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No messages in this thread yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {thread.messages.map((msg, index) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMe = senderId && senderId.toString() === currentUserId.toString();
              
              let displayName = 'Unknown';
              if (isMe) {
                displayName = 'You';
              } else if (typeof msg.sender === 'object' && msg.sender.name) {
                displayName = msg.sender.name;
              } else {
                displayName = otherPartyName;
              }

              const msgTime = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '';

              return (
                <div 
                  key={msg._id || index}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    background: isMe ? '#d1e7dd' : '#e2e3e5',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isMe ? '#badbcc' : '#d3d3d4'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '0.85em', marginBottom: '3px' }}>
                    {displayName}
                  </div>
                  <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.7em', color: '#666', marginTop: '5px', textAlign: 'right' }}>
                    {msgTime}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Input Form */}
      <form onSubmit={handleSendReply} style={{ maxWidth: '600px' }}>
        {replyError && <div style={{ color: 'red', marginBottom: '10px' }}>{replyError}</div>}
        <textarea
          rows="3"
          style={{ width: '100%', marginBottom: '10px' }}
          placeholder="Type your reply here..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          disabled={replyLoading}
          required
        />
        <button type="submit" disabled={replyLoading || !replyText.trim()}>
          {replyLoading ? 'Sending...' : 'Send Reply'}
        </button>
      </form>
    </div>
  );
};

export default InquiryThread;
