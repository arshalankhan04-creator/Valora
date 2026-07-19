import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const InquiryThread = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchThreadsAndThread = async () => {
    try {
      const [threadsRes, threadRes] = await Promise.all([
        api.get('/inquiries/mine'),
        api.get(`/inquiries/${id}`)
      ]);
      setThreads(threadsRes.data);
      setThread(threadRes.data);
    } catch (err) {
      console.error('Error fetching thread details:', err);
      setError(err.response?.data?.message || 'Failed to load message thread.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchThreadsAndThread();
  }, [id, user, authLoading]);

  // Clean fetch helper for sending new messages (prevents full re-load spinner)
  const refetchMessagesOnly = async () => {
    try {
      const res = await api.get(`/inquiries/${id}`);
      setThread(res.data);
    } catch (err) {
      console.error('Error refetching messages:', err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    setReplyError('');

    setReplyLoading(true);
    try {
      await api.post(`/inquiries/${id}/messages`, { text: replyText });
      setReplyText('');
      await refetchMessagesOnly();
    } catch (err) {
      console.error('Error sending reply:', err);
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

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
          Please log in to view this message thread.
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
        <p className="text-gray-400 text-xs font-bold m-0">Loading message thread...</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-20 text-center flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2 m-0">Access Denied</h2>
        <p className="text-red-655 text-xs max-w-[320px] mx-auto m-0 mb-6 font-bold">
          {error || 'You are not authorized to view this conversation.'}
        </p>
        <Link to="/inquiries" className="text-xs font-bold text-primary hover:underline">
          &larr; Back to Inbox
        </Link>
      </div>
    );
  }

  const currentUserId = user._id || user.id || '';

  // Determine other participant name
  const isBuyer = thread.buyer && thread.buyer._id?.toString() === currentUserId.toString();
  const otherParty = isBuyer ? thread.seller : thread.buyer;
  const otherPartyName = otherParty ? otherParty.name : 'Unknown User';

  const getDividerLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isSameDay(date, today)) {
      return `Today, ${timeStr}`;
    }
    if (isSameDay(date, yesterday)) {
      return `Yesterday, ${timeStr}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  let lastDateStr = null;

  return (
    <div className="w-full bg-bgLight min-h-[calc(100vh-80px)] py-10 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left flex-1 flex flex-col">

        {/* Title bar */}
        <div className="flex items-center justify-between mb-6 select-none">
          <h1 className="text-2xl font-black text-gray-900 m-0">
            Messages
          </h1>
        </div>

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
              {threads.map((item) => {
                const itemIsBuyer = item.buyer && item.buyer._id?.toString() === currentUserId.toString();
                const itemOtherParty = itemIsBuyer ? item.seller : item.buyer;
                const itemOtherPartyName = itemOtherParty ? itemOtherParty.name : 'Unknown User';

                const itemMessages = item.messages || [];
                const itemLastMessage = itemMessages.length > 0 ? itemMessages[itemMessages.length - 1] : null;
                const itemSnippet = itemLastMessage ? itemLastMessage.text : 'No messages';

                const itemVehicleName = item.listing
                  ? `${item.listing.brand} ${item.listing.model}`
                  : 'Deleted Vehicle';

                const isActive = item._id.toString() === id.toString();
                const dbImg = item.listing?.images?.[0];
                const listingImg = dbImg ? (dbImg.startsWith('http') ? dbImg : `http://localhost:5000/${dbImg}`) : null;

                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/inquiries/${item._id}`)}
                    className={`p-4 hover:bg-slate-50/70 cursor-pointer transition-colors relative flex items-start gap-3 text-left ${isActive ? 'bg-indigo-50/30 border-l-[3px] border-primary' : ''
                      }`}
                  >
                    {/* Avatar initials */}
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-primary flex items-center justify-center font-extrabold text-xs uppercase flex-shrink-0 select-none shadow-sm">
                      {itemOtherPartyName.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </div>

                    {/* Snippet Block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-xs text-gray-900 truncate">
                          {itemOtherPartyName}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold select-none whitespace-nowrap">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold block mt-0.5 truncate">
                        {itemVehicleName}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold truncate block mt-1">
                        {itemSnippet}
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
              })}
            </div>
          </div>

          {/* Right Side: Conversation Chat Pane (8 cols) */}
          <div className="md:col-span-8 flex flex-col h-full bg-white">

            {/* Header: User & Vehicle Details bar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                {thread.listing ? (
                  <>
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 select-none border border-gray-100 shadow-sm">
                      <img
                        src={thread.listing.images?.[0] ? (thread.listing.images[0].startsWith('http') ? thread.listing.images[0] : `http://localhost:5000/${thread.listing.images[0]}`) : 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80'}
                        className="w-full h-full object-cover"
                        alt="vehicle detail"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-xs text-gray-900 leading-tight">
                        {thread.listing.brand} {thread.listing.model} ({thread.listing.year})
                      </div>
                      <div className="flex items-center mt-0.5 leading-none">
                        <span className="text-[10px] font-extrabold text-tealPrimary">
                          ₹{(thread.listing.price / 100000).toFixed(1)}L
                        </span>
                        <span className="text-gray-300 mx-1.5 select-none">·</span>
                        <Link
                          to={`/listings/${thread.listing._id}`}
                          className="text-[9px] font-extrabold text-primary hover:underline transition-all"
                        >
                          View Listing
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 select-none">Vehicle listing deleted</span>
                )}
              </div>

              <div className="flex items-center gap-2 select-none flex-shrink-0 opacity-60">
                <div className="flex flex-col items-end text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Trust Score</span>
                  <span className="text-[8px] text-gray-400 italic mt-0.5 leading-none">N/A</span>
                </div>
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50">
                  <span className="text-[9px] font-extrabold text-gray-400">N/A</span>
                </div>
              </div>
            </div>

            {/* Message Bubble History viewport */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30 flex flex-col scrollbar-thin">
                {thread.messages && thread.messages.length === 0 ? (
                  <div className="my-auto text-center p-6 text-gray-400 font-semibold text-xs leading-relaxed select-none">
                    No messages yet. Send a note to start the conversation!
                  </div>
                ) : (
                  thread.messages.map((msg, index) => {
                    const senderId = msg.sender?._id || msg.sender;
                    const isMe = senderId && senderId.toString() === currentUserId.toString();
                    const senderName = isMe ? 'You' : otherPartyName;

                    const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
                    const dateKey = msgDate.toDateString();
                    const showDivider = dateKey !== lastDateStr;
                    lastDateStr = dateKey;

                    const formattedTime = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <React.Fragment key={msg._id || index}>
                        {showDivider && (
                          <div className="w-full flex justify-center my-4 select-none">
                            <span className="bg-slate-100/85 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200/50 shadow-sm">
                              {getDividerLabel(msgDate)}
                            </span>
                          </div>
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end ml-auto' : 'items-start mr-auto'} max-w-[75%] mb-2`}>
                          {!isMe && (
                            <span className="text-[9px] font-extrabold text-slate-400 mb-1 px-1 select-none">
                              {senderName}
                            </span>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-sm leading-relaxed whitespace-pre-wrap select-text text-left relative pb-7 pr-14 min-w-[100px] ${isMe
                              ? 'bg-tealPrimary text-white rounded-tr-none'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                              }`}
                          >
                            <span>{msg.text}</span>
                            <span className={`absolute bottom-1.5 right-3 text-[9px] font-bold select-none ${isMe ? 'text-white/70' : 'text-slate-400'
                              }`}>
                              {formattedTime}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Sticky reply action textform footer */}
              <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2 flex-shrink-0">
                {replyError && (
                  <span className="text-[10px] font-extrabold text-red-650 px-2 block select-none text-left">
                    {replyError}
                  </span>
                )}
                <form
                  onSubmit={handleSendReply}
                  className="flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-2xl px-4 py-2"
                >
                  {/* Visual Attachment Icon */}
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 cursor-not-allowed select-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.485 8.485L17 13" />
                  </svg>

                  <textarea
                    rows="1"
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      if (replyError && e.target.value.trim() !== '') {
                        setReplyError('');
                      }
                    }}
                    disabled={replyLoading}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-xs font-semibold text-gray-850 placeholder-gray-400 focus:outline-none resize-none py-1 h-6 max-h-12"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply(e);
                      }
                    }}
                  />

                  <button
                    type="submit"
                    disabled={replyLoading}
                    className="w-8 h-8 rounded-full bg-tealPrimary hover:bg-tealDark text-white flex items-center justify-center cursor-pointer transition-colors border-none disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none shadow-sm"
                  >
                    <svg className="w-4 h-4 transform rotate-45 -translate-x-[1px] translate-y-[0.5px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      </div>
      );
};
      export default InquiryThread;
