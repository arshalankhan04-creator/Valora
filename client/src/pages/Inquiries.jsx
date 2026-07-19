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

  if (authLoading) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-[#4F46E5] rounded-full animate-spin" />
        <p className="text-gray-400 text-xs font-bold m-0">Loading authentication status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-20 text-center flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2 m-0">Access Denied</h2>
        <p className="text-gray-400 text-xs max-w-[320px] mx-auto m-0 mb-6">
          Please log in to view your inquiries.
        </p>
        <Link to="/login" className="text-xs font-bold text-primary hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-[#4F46E5] rounded-full animate-spin" />
        <p className="text-gray-400 text-xs font-bold m-0">Loading inquiries...</p>
      </div>
    );
  }

  const currentUserId = user._id || user.id || '';

  return (
    <div className="w-full bg-bgLight min-h-[calc(100vh-80px)] py-10 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left flex-1 flex flex-col">
        
        {/* Title bar */}
        <div className="flex items-center justify-between mb-6 select-none">
          <h1 className="text-2xl font-black text-gray-900 m-0">
            Messages
          </h1>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl p-4 mb-6 shadow-sm select-none">
            {error}
          </div>
        )}

        {/* Two-Pane Inbox Card Layout */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[calc(100vh-240px)] flex-1">
          
          {/* Left Side: Inbox List Column (4 cols) */}
          <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between select-none">
              <h2 className="text-sm font-black text-gray-900 m-0">Inbox</h2>
              <span className="text-[10px] font-extrabold bg-indigo-50 text-primary border border-indigo-100 px-2.5 py-0.5 rounded-full">
                {threads.length} {threads.length === 1 ? 'Thread' : 'Threads'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
              {threads.length === 0 ? (
                <div className="py-20 text-center p-6 text-gray-400 font-semibold text-xs leading-relaxed select-none">
                  No inquiries yet. When you message a seller, the thread will appear here.
                </div>
              ) : (
                threads.map((thread) => {
                  const isBuyer = thread.buyer && thread.buyer._id?.toString() === currentUserId.toString();
                  const otherParty = isBuyer ? thread.seller : thread.buyer;
                  const otherPartyName = otherParty ? otherParty.name : 'Unknown User';
                  
                  const messages = thread.messages || [];
                  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                  const snippet = lastMessage ? lastMessage.text : 'No messages';
                  
                  const vehicleName = thread.listing 
                    ? `${thread.listing.brand} ${thread.listing.model}` 
                    : 'Deleted Vehicle';
                  
                  const dbImg = thread.listing?.images?.[0];
                  const listingImg = dbImg ? (dbImg.startsWith('http') ? dbImg : `http://localhost:5000/${dbImg}`) : null;

                  return (
                    <div 
                      key={thread._id}
                      onClick={() => navigate(`/inquiries/${thread._id}`)}
                      className="p-4 hover:bg-slate-50/70 cursor-pointer transition-colors relative flex items-start gap-3 text-left"
                    >
                      {/* Avatar initials */}
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-primary flex items-center justify-center font-extrabold text-xs uppercase flex-shrink-0 select-none shadow-sm">
                        {otherPartyName.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      
                      {/* Snippet Block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-xs text-gray-900 truncate">
                            {otherPartyName}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold select-none whitespace-nowrap">
                            {thread.updatedAt ? new Date(thread.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-0.5 truncate">
                          {vehicleName}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold truncate block mt-1">
                          {snippet}
                        </span>
                      </div>

                      {/* Small Vehicle Preview Card */}
                      {listingImg && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 select-none border border-gray-100 shadow-sm">
                          <img src={listingImg} className="w-full h-full object-cover" alt="vehicle" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side: Conversation Placeholder Column (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-center items-center p-8 bg-bgLight/40 text-center select-none h-full">
            <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 text-gray-300 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xs font-black text-gray-700 m-0 mb-1">Select a Conversation</h3>
            <p className="text-[10px] text-gray-400 max-w-[280px] mx-auto m-0 leading-normal font-semibold">
              Select a message thread from your inbox to read, write, and negotiate terms.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Inquiries;
