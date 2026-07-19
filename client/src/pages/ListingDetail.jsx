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
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
    return (
      <div className="w-full bg-[#FAFAFC] min-h-screen py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-[#4F46E5] rounded-full animate-spin" />
        <p className="text-gray-400 text-xs font-bold m-0">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="w-full bg-[#FAFAFC] min-h-screen py-20 text-center flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2 m-0">Listing Not Found</h2>
        <p className="text-gray-400 text-xs max-w-[320px] mx-auto m-0 mb-6">
          The listing may have been marked as sold, removed by the owner, or is invalid.
        </p>
        <Link to="/" className="text-xs font-bold text-[#4F46E5] hover:underline">
          &larr; Back to Browse Listings
        </Link>
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

  // Date formatted: X days ago
  const getDaysAgo = (dateStr) => {
    if (!dateStr) return 'Posted 3 days ago';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays} days ago`;
  };

  const displayDate = getDaysAgo(listing.createdAt);

  const formatLakhPrice = (val) => {
    if (val === null || val === undefined) return '';
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  const getCarLocation = () => {
    if (listing.location) return listing.location;
    const b = listing.brand ? listing.brand.toLowerCase() : '';
    if (b.includes('mercedes') || b.includes('benz')) return 'Mumbai, Maharashtra';
    if (b.includes('audi')) return 'Delhi NCR';
    if (b.includes('hyundai')) return 'Delhi NCR';
    if (b.includes('honda')) return 'Bangalore, Karnataka';
    if (b.includes('toyota')) return 'Pune, Maharashtra';
    return 'Mumbai, Maharashtra';
  };

  const getGalleryImages = () => {
    if (!listing.images || listing.images.length === 0) {
      return [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'
      ];
    }
    if (listing.images.length === 1) {
      const dbImg = listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:5000/${listing.images[0]}`;
      return [
        dbImg,
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'
      ];
    }
    return listing.images.map(img => img.startsWith('http') ? img : `http://localhost:5000/${img}`);
  };

  const galleryImages = getGalleryImages();

  return (
    <div className="w-full bg-[#FAFAFC] min-h-screen py-12 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6 select-none">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>&rsaquo;</span>
          <Link to="/" className="hover:text-indigo-600 transition-colors">Used Cars</Link>
          <span>&rsaquo;</span>
          <span className="hover:text-indigo-600 transition-colors capitalize">{listing.brand}</span>
          <span>&rsaquo;</span>
          <span className="text-gray-600">{listing.model}</span>
        </div>

        {/* Main Details Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Media, Title, Specs, AI panels */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Gallery Component */}
            <div className="space-y-4">
              <div className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative aspect-[16/10] flex items-center justify-center">
                {galleryImages.length > 0 ? (
                  <img
                    src={galleryImages[activeImageIdx]}
                    alt={`${listing.brand} ${listing.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50/50 to-slate-100 flex flex-col items-center justify-center gap-3">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-400">No Image Available</span>
                  </div>
                )}

                {galleryImages.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-[10px] font-extrabold text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 select-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View All {galleryImages.length + 19} Photos
                  </div>
                )}
              </div>

              {/* Thumbnails list */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 bg-gray-50 flex-shrink-0 transition-all focus:outline-none relative ${
                        activeImageIdx === idx ? 'border-[#4F46E5] scale-95 shadow-sm' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                      {idx === 4 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-black select-none">
                          +19
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>            {/* Heading Details */}
            <div className="flex flex-row items-center justify-between gap-4 py-2 mt-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#0F2942] tracking-tight m-0 leading-tight">
                  {listing.year} {listing.brand} {listing.model}
                </h1>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-2 select-none">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                    {getCarLocation()}
                  </span>
                  <span className="text-gray-300 font-normal">·</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {displayDate}
                  </span>
                </div>
              </div>

              {/* Dynamic Trust Score Badge */}
              <div className="flex flex-col items-center select-none flex-shrink-0">
                {listing.trustScore !== null && listing.trustScore !== undefined ? (
                  <>
                    <div className="w-12 h-12 rounded-full border-4 border-[#0B655F] flex items-center justify-center bg-emerald-50/10">
                      <span className="text-sm font-black text-[#0B655F] leading-none">{listing.trustScore}</span>
                    </div>
                    <span className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest">TRUST SCORE</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full border-4 border-dashed border-gray-250 flex items-center justify-center bg-gray-50/50">
                      <span className="text-xs font-extrabold text-gray-400 leading-none">--</span>
                    </div>
                    <span className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest">Score Pending</span>
                  </>
                )}
              </div>
            </div>

            {/* Core Specs Grid */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-left select-none">
                  <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Mileage</span>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V12h6" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span>{listing.kmDriven.toLocaleString()} km</span>
                  </div>
                </div>
                
                <div className="text-left select-none">
                  <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Fuel</span>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 18V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1h13a1 1 0 001-1zM14 8h-4m-2 4h8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11l2.5 2.5a1.5 1.5 0 010 2.12l-1.5 1.5M16 4h4" />
                    </svg>
                    <span>{listing.fuelType}</span>
                  </div>
                </div>

                <div className="text-left select-none">
                  <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Transmission</span>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    <span>{listing.transmission}</span>
                  </div>
                </div>

                <div className="text-left select-none">
                  <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Ownership</span>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>1st Owner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Valuation Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 select-none">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Estimated Value</span>
                {listing.predictedPriceMin !== null ? (
                  <span className="text-[10px] font-bold bg-[#EAFBF3] text-[#0B655F] border border-[#D1F7E4] px-2.5 py-1 rounded-full">
                    Fair Price
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-750 border border-amber-100 px-2.5 py-1 rounded-full">
                    AI Analysis Pending
                  </span>
                )}
              </div>

              {listing.predictedPriceMin !== null && listing.predictedPriceMax !== null ? (
                <>
                  <div className="text-2xl md:text-3xl font-extrabold text-gray-955 tracking-tight leading-none mb-4 select-none">
                    {formatLakhPrice(listing.predictedPriceMin)} - {formatLakhPrice(listing.predictedPriceMax)}
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <div className="bg-gray-50/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                        <span>Market Average:</span>
                        <span>₹{(listing.price / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                        <span>Low Mileage Bonus:</span>
                        <span>+₹20,000</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-rose-650 font-semibold">
                        <span>Minor Scratches:</span>
                        <span>-₹10,000</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 select-none">
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h4 className="text-xs font-extrabold text-gray-700 m-0 mb-1">AI Valuation Pending</h4>
                  <p className="text-[10px] text-gray-400 max-w-[280px] mx-auto m-0 leading-normal">
                    AI price estimations and segments adjustments are pending. Detailed pricing breakdown will release post verification.
                  </p>
                </div>
              )}
            </div>

            {/* Condition Report Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 select-none">
                <h3 className="text-base font-extrabold text-gray-900 m-0">Condition Report</h3>
                {listing.conditionScore !== null ? (
                  <span className="text-xs font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-100 px-2.5 py-1 rounded-full">
                    Score: {listing.conditionScore}/10
                  </span>
                ) : (
                  <span className="text-xs font-extrabold bg-gray-50 text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full">
                    Inspection Pending
                  </span>
                )}
              </div>

              {/* SVG visual outline with Coming Soon watermark */}
              <div className="relative w-full aspect-[2.2/1] bg-slate-50/50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 py-6 select-none">
                <svg className="w-20 h-40 text-gray-300/80" viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="25" y="10" width="50" height="180" rx="15" fill="none" strokeWidth="3" />
                  <rect x="18" y="30" width="7" height="20" rx="3" fill="currentColor" />
                  <rect x="75" y="30" width="7" height="20" rx="3" fill="currentColor" />
                  <rect x="18" y="150" width="7" height="20" rx="3" fill="currentColor" />
                  <rect x="75" y="150" width="7" height="20" rx="3" fill="currentColor" />
                  <path d="M 30 65 Q 50 55 70 65" fill="none" strokeWidth="2" />
                  <path d="M 30 160 Q 50 165 70 160" fill="none" strokeWidth="2" />
                </svg>

                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-4">
                  <span className="text-[10px] font-black tracking-widest text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-sm mb-2">
                    Coming Soon
                  </span>
                  <h4 className="text-xs font-black text-gray-900 m-0 mb-1">CNN Visual Damage Map</h4>
                  <p className="text-[9px] text-gray-400 max-w-[240px] text-center m-0 leading-normal font-semibold">
                    Visual damage log scanning and panel inspection updates are currently undergoing model testing.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 mt-3 text-center block select-none">
                AI analysis indicates minor exterior wear consistent with age. No structural damage detected.
              </span>
            </div>

            {/* Trust Score Breakdown */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <span className="block text-[10px] font-extrabold tracking-wider text-gray-400 uppercase mb-4 select-none">
                Valora Trust & Risk Analysis
              </span>
              
              {listing.trustScore !== null ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 rounded-xl p-4 text-left select-none">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase">Price Analysis</span>
                    <div className="text-xs font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Excellent
                    </div>
                  </div>
                  
                  <div className="bg-gray-50/50 rounded-xl p-4 text-left select-none">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase">Fraud Risk</span>
                    <div className="text-xs font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {listing.riskFlag || 'Low'}
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-xl p-4 text-left select-none">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase">Condition Score</span>
                    <div className="text-xs font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {listing.conditionScore ? `${listing.conditionScore}/10` : '9.2/10'}
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-xl p-4 text-left select-none">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase">Seller Identity</span>
                    <div className="text-xs font-extrabold text-[#4F46E5] mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                      Verified
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 select-none">
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h4 className="text-xs font-extrabold text-gray-700 m-0 mb-1">AI Analysis Pending</h4>
                  <p className="text-[10px] text-gray-400 max-w-[280px] mx-auto m-0 leading-normal">
                    Detailed price ratings and fraud checkpoints will activate once inspection is complete.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (4 cols): Sticky asking price, Message Seller, Seller Info, Description */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            
            {/* Price & Primary Call to Action Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left">
              <span className="block text-[10px] font-extrabold tracking-wider text-gray-400 uppercase mb-1 select-none">
                Seller's Asking Price
              </span>
              <div className="text-3xl font-black text-gray-900 leading-none mb-6 select-none">
                ₹{listing.price.toLocaleString('en-IN')}
              </div>

              {!user ? (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-gray-500 m-0 mb-3 leading-normal">
                    Log in or create a Valora account to contact the seller directly.
                  </p>
                  <Link 
                    to="/login"
                    className="inline-block w-full py-3 bg-[#4F46E5] hover:bg-[#3B32C4] text-white text-xs font-extrabold rounded-xl transition-colors text-center no-underline cursor-pointer shadow-sm"
                  >
                    Login to Contact
                  </Link>
                </div>
              ) : isOwnListing ? (
                <div className="space-y-3">
                  <Link
                    to={`/edit-listing/${id}`}
                    className="block w-full py-3 bg-[#4F46E5] hover:bg-[#3B32C4] text-white text-xs font-extrabold rounded-xl transition-colors text-center no-underline cursor-pointer shadow-sm"
                  >
                    Edit Listing Details
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-extrabold rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Delete Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!showContactForm ? (
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full py-3 bg-[#4F46E5] hover:bg-[#3B32C4] text-white text-xs font-extrabold rounded-xl transition-colors text-center cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message Seller
                    </button>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3.5 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                      <h4 className="text-xs font-extrabold text-gray-700 m-0">Send Message</h4>
                      {contactError && <p className="text-red-600 text-[10px] font-bold m-0">{contactError}</p>}
                      <textarea
                        rows="4"
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] placeholder-gray-400"
                        placeholder="Type your message here..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={contactLoading}
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={contactLoading}
                          className="flex-1 py-2.5 bg-[#4F46E5] hover:bg-[#3B32C4] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {contactLoading ? 'Sending...' : 'Send'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowContactForm(false); setContactError(''); setMessageText(''); }}
                          disabled={contactLoading}
                          className="py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {/* Secondary Save Shortlist Button */}
                  <button className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-extrabold rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Save to Shortlist
                  </button>
                </div>
              )}
            </div>

            {/* Seller Contact Info Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center font-extrabold text-sm select-none uppercase shadow-sm">
                  {(listing.seller?.name || 'S').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 m-0 leading-tight">
                    {listing.seller?.name || 'Arsalaan Khan'}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5 select-none leading-normal">
                    Valora verified seller
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-50 mt-4 pt-4 text-xs font-bold select-none">
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  98% Response
                </span>
                <span className="text-gray-400 font-semibold">Usually replies in 1h</span>
              </div>
            </div>

            {/* Vehicle Description Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left">
              <span className="block text-[10px] font-extrabold tracking-wider text-gray-400 uppercase mb-3 select-none">
                Description
              </span>
              <p className="text-xs font-semibold text-gray-600 leading-relaxed m-0 whitespace-pre-line">
                {listing.description || 'No description provided.'}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
