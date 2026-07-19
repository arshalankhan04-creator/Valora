import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import CarCard from '../components/CarCard';
import ClientFeedback from '../components/ui/testimonial';
import api from '../api/axios';

// Static Featured Cars Dummy Data
const FEATURED_CARS = [
  {
    id: '1',
    brand: 'Audi',
    model: 'A6 Premium Plus',
    year: 2021,
    price: 4500000,
    priceMinText: '₹45.0L',
    priceMaxText: '₹48.0L',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '24,500 km',
    location: 'Bangalore',
    trustScore: 92,
    postedDate: 'Posted 2 days ago',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: '2',
    brand: 'BMW',
    model: '5 Series 530d',
    year: 2022,
    price: 5200000,
    priceMinText: '₹52.0L',
    priceMaxText: '₹55.5L',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: '8,200 km',
    location: 'Mumbai',
    trustScore: 95,
    postedDate: 'Posted 1 day ago',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-blue-700 to-blue-900',
  },
  {
    id: '3',
    brand: 'Mercedes-Benz',
    model: 'C-Class C200',
    year: 2020,
    price: 3800000,
    priceMinText: '₹38.0L',
    priceMaxText: '₹41.0L',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '24,000 km',
    location: 'Delhi NCR',
    trustScore: 88,
    postedDate: 'Posted 4 days ago',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-zinc-700 to-zinc-900',
  },
  {
    id: '4',
    brand: 'Porsche',
    model: 'Macan GTS',
    year: 2021,
    price: 7800000,
    priceMinText: '₹78.0L',
    priceMaxText: '₹82.0L',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '14,800 km',
    location: 'Pune',
    trustScore: 97,
    postedDate: 'Posted 3 hours ago',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-amber-700 to-amber-900',
  },
  {
    id: '5',
    brand: 'Jaguar',
    model: 'XF Portfolio',
    year: 2022,
    price: 4800000,
    priceMinText: '₹48.0L',
    priceMaxText: '₹51.5L',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: '6,400 km',
    location: 'Chennai',
    trustScore: 91,
    postedDate: 'Posted 3 days ago',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-red-800 to-red-950',
  },
  {
    id: '6',
    brand: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2023,
    price: 6000000,
    priceMinText: '₹60.0L',
    priceMaxText: '₹63.5L',
    fuelType: 'Electric',
    transmission: 'Automatic',
    mileage: '4,100 km',
    location: 'Hyderabad',
    trustScore: 94,
    postedDate: 'Posted Yesterday',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-emerald-700 to-emerald-950',
  }
];

const Home = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings');
        if (res.data && res.data.length > 0) {
          setFeaturedListings(res.data.slice(0, 6));
        } else {
          setFeaturedListings(FEATURED_CARS);
        }
      } catch (err) {
        console.error('Error fetching live listings, falling back to static:', err);
        setFeaturedListings(FEATURED_CARS);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="w-full bg-[#FAFAFC] min-h-screen flex flex-col font-sans">

      {/* Hero Section Container */}
      <div className="relative w-full min-h-[500px] bg-white overflow-hidden flex items-center">

        {/* Diagonal Slanted Indigo Background Split (Clipped Div) */}
        <div
          className="absolute inset-y-0 right-0 w-[50%] bg-[#4F46E5] z-0 hidden md:block"
          style={{ clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 10% 100%)' }}
        />

        {/* Content Layer */}
        <div className="max-w-6xl mx-auto px-6 w-full relative z-10 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left Zone: Headline & Actions (On White background) */}
          <div className="flex-1 text-left space-y-8 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight m-0 uppercase" style={{ color: '#0F0F17' }}>
                FAIR BUYING. <br />
                <span style={{ color: '#4F46E5' }}>FAIR SELLING.</span>
              </h1>
              <p className="text-gray-500 text-lg m-0 leading-relaxed max-w-lg">
                Valora is the premium automotive marketplace designed to bring total transparency, trust, and ease to buying or selling your next vehicle.
              </p>
            </div>

            <div className="flex flex-row items-center gap-4">
              <Button variant="primary" pill className="px-8 py-3.5 shadow-lg shadow-indigo-600/20 text-sm font-bold bg-[#4F46E5]">
                Buy a Car
              </Button>
              <Button variant="outline" pill className="px-8 py-3.5 text-sm font-bold border-gray-300 text-[#0F0F17]">
                Sell Yours
              </Button>
            </div>
          </div>

          {/* Right Zone: Car Image (On Blue slanted background) */}
          <div className="flex-1 w-full flex justify-center md:justify-end z-10">
            <img
              src="/hero-car.png"
              alt="Valora Premium Sports Car"
              className="w-full max-w-md md:max-w-2xl object-contain drop-shadow-[0_20px_50px_rgba(15,15,23,0.15)] md:-mr-12 select-none"
            />
          </div>
        </div>
      </div>

      {/* Floating White Search Card */}
      <div className="relative -mt-10 max-w-4xl mx-auto px-6 w-full z-20">
        <div className="bg-white text-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            {/* Brand */}
            <div className="w-full text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Brand
              </label>
              <select className="w-full bg-[#F4F4F6] border-none rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-gray-700 appearance-none">
                <option value="">Select Brand</option>
                <option value="audi">Audi</option>
                <option value="bmw">BMW</option>
                <option value="mercedes">Mercedes-Benz</option>
                <option value="porsche">Porsche</option>
              </select>
            </div>

            {/* Model */}
            <div className="w-full text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Model
              </label>
              <select className="w-full bg-[#F4F4F6] border-none rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-gray-700 appearance-none">
                <option value="">Select Model</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="coupe">Coupe</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="w-full text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Price Range
              </label>
              <select className="w-full bg-[#F4F4F6] border-none rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-gray-700 appearance-none">
                <option value="">Select Price Range</option>
                <option value="0-20">Under ₹20 Lakhs</option>
                <option value="20-50">₹20 - ₹50 Lakhs</option>
                <option value="50-100">₹50 Lakhs - ₹1 Crore</option>
                <option value="100+">Above ₹1 Crore</option>
              </select>
            </div>

            {/* Location */}
            <div className="w-full text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Location
              </label>
              <select className="w-full bg-[#F4F4F6] border-none rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-gray-700 appearance-none">
                <option value="">Select Location</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="bangalore">Bangalore</option>
                <option value="pune">Pune</option>
              </select>
            </div>

            {/* Search Button (Inline!) */}
            <div className="w-full">
              <Button variant="primary" className="w-full py-3.5 bg-[#4F46E5] shadow-lg shadow-indigo-600/10 font-bold">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner Strip Container */}
      <div className="max-w-6xl mx-auto px-6 w-full z-10 relative -mt-12 md:-mt-14">
        <div
          className="w-full h-[180px] md:h-[240px] bg-cover bg-center rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center relative shadow-lg"
          style={{ backgroundImage: "url('/promo-strip-bg.png')" }}
        >
          <div className="absolute inset-0 bg-black/35" />
          <h2
            className="relative z-10 uppercase m-0 text-center select-none pt-4"
            style={{
              fontFamily: 'Anoxic, sans-serif',
              fontSize: 'clamp(2rem, 4.5vw, 4.5rem)',
              fontWeight: '400',
              letterSpacing: '8px',
              color: 'transparent',
              WebkitTextStroke: '2px #d0d0d0ff'
            }}
          >
            Valora
          </h2>
        </div>
      </div>

      {/* Browse by Category Section */}
      <div className="max-w-5xl mx-auto px-6 w-full mb-28 text-center mt-28">
        <h2 className="text-3xl font-extrabold tracking-tight mb-10" style={{ color: '#0F0F17' }}>
          Browse by Category
        </h2>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {[
            {
              name: 'SUV',
              image: '/categories/suv.png'
            },
            {
              name: 'Sedan',
              image: '/categories/sedan.png'
            },
            {
              name: 'Hatchback',
              image: '/categories/hatchback.png'
            },
            {
              name: 'Electric',
              image: '/categories/electric.png'
            },
            {
              name: 'Luxury',
              image: '/categories/luxury.png'
            }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to="/browse"
              className="group bg-white border border-gray-100 rounded-2xl py-7 px-4 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 no-underline"
            >
              <div className="h-14 flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="max-h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-xs font-bold text-gray-800 group-hover:text-[#4F46E5] transition-colors duration-200 uppercase tracking-wide">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Cars Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-28">
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold tracking-tight m-0" style={{ color: '#0F0F17' }}>
              Featured Premium Listings
            </h2>
            <p className="text-gray-500 mt-2 m-0 text-sm">
              Explore our handpicked curation of highly-inspected luxury performance cars.
            </p>
          </div>
          <Link to="/browse" className="text-sm font-bold text-[#4F46E5] hover:underline">
            View All Listings &rarr;
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {featuredListings.map((car) => (
            <CarCard key={car.id || car._id} car={car} />
          ))}
        </div>
      </div>

      {/* The Valora Promise Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-28">
        <div className="bg-[#F4F4F6] rounded-[32px] p-8 md:p-16 text-left relative overflow-hidden border border-gray-200/60 shadow-sm">
          {/* Subtle dotted background grid pattern in brand color */}
          <div className="absolute inset-0 bg-[radial-gradient(#4F46E506_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />
          
          <div className="relative z-10">
            <span className="text-[#4F46E5] text-xs font-bold uppercase tracking-[0.2em]">
              The Valora Promise
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-4 mb-12 leading-tight max-w-2xl" style={{ color: '#0F0F17' }}>
              Four checks. <span className="text-[#4F46E5]">Every car.</span> Before you call.
            </h2>

            {/* Promises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200/60 rounded-2xl bg-white divide-y md:divide-y-0 md:divide-x divide-gray-200/60 overflow-hidden shadow-sm">
              {[
                {
                  num: '01',
                  title: 'Fair Price',
                  desc: 'Regression models trained on year, mileage, and brand to predict a fair price range and explain key value drivers.'
                },
                {
                  num: '02',
                  title: 'Trust Score',
                  desc: 'A unified 0–100 score combining price fairness, fraud risk, condition match, and seller history.'
                },
                {
                  num: '03',
                  title: 'Condition AI',
                  desc: 'CNN transfer learning scans uploaded photos for visible dents, scratches, and damage to assess visual wear.'
                },
                {
                  num: '04',
                  title: 'Fraud Check',
                  desc: 'Classification models train on anomaly signals to flag suspicious listings and duplicate ads before they go live.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-8 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <span className="text-[#4F46E5] text-xs font-mono font-bold block mb-4">
                      {item.num}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed m-0">
                      {item.desc}
                    </p>
                  </div>
                  <div className="w-8 h-[2px] bg-[#4F46E5]/40 mt-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-28 text-left">
        <span className="text-[#4F46E5] text-xs font-bold uppercase tracking-[0.2em] block mb-3">
          How It Works
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-0 mb-4 leading-tight" style={{ color: '#0F0F17' }}>
          From search to signature, in <span className="text-[#4F46E5]">three quiet steps.</span>
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed mt-0 mb-12">
          No cold calls, no dealer bidding wars. Just a straight line to the right car.
        </p>

        {/* Cards container with connecting line */}
        <div className="relative w-full py-4">
          {/* Connecting line behind cards (desktop only) */}
          <div className="absolute top-[48px] left-[15%] right-[15%] h-[1px] bg-gray-200 hidden lg:block z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-gray-200/70 p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-500 bg-gray-50/80">
                    1
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E6F4F2] text-[#0B655F] flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 mt-4">
                  Search Verified Listings
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed m-0">
                  Filter by brand, budget, year, or location. Every listing is pre-evaluated by Valora's pricing, condition, and fraud verification models.
                </p>
              </div>
              <Link to="/browse" className="text-sm font-bold text-[#0B655F] hover:underline inline-flex items-center gap-1 mt-6">
                Start searching &rarr;
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-gray-200/70 p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-500 bg-gray-50/80">
                    2
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E6F4F2] text-[#0B655F] flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 mt-4">
                  Analyze Trust Metrics
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed m-0">
                  Deep-dive into any car's 0–100 Trust Score. Compare the predicted fair price range against the seller's price, and view CNN visual condition logs.
                </p>
              </div>
              <Link to="/browse" className="text-sm font-bold text-[#0B655F] hover:underline inline-flex items-center gap-1 mt-6">
                Try Compare &rarr;
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-gray-200/70 p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-500 bg-gray-50/80">
                    3
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E6F4F2] text-[#0B655F] flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 mt-4">
                  Direct Chat & Connect
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed m-0">
                  Message verified sellers directly through our secure chat system. Agree on a price, ask questions, or book an inspection with zero middleman markup.
                </p>
              </div>
              <Link to="/browse" className="text-sm font-bold text-[#0B655F] hover:underline inline-flex items-center gap-1 mt-6">
                Contact sellers &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>



      {/* Why Choose Us Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-28 text-left">
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Zone: Headline & Paragraph */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                {/* Horizontal line decorator above label */}
                <div className="w-10 h-[3px] bg-[#4F46E5]" />
                <span className="text-[#4F46E5] text-[11px] font-extrabold uppercase tracking-[0.2em] block">
                  Features
                </span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight m-0 text-gray-900">
                Why People <span className="text-[#4F46E5]">Choose Us?</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed m-0">
                Valora removes the guess-work and hidden fees of pre-owned vehicle buying by running every listing through our advanced machine learning and visual verification models.
              </p>
              <div className="pt-2">
                <Link to="/browse">
                  <Button variant="primary" className="py-2.5 px-6 font-bold bg-[#4F46E5] hover:bg-[#3B32C4] text-white border-none rounded-xl shadow-sm text-xs">
                    Explore Listings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Zone: Staggered Columns with Dividers */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
              {/* Vertical Divider (Only on md and larger) */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-100/80 -translate-x-1/2" />

              {/* Column 1 (Pushed down slightly for staggered hierarchy) */}
              <div className="space-y-8 md:space-y-10 md:pt-10">
                {/* Feature 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-indigo-100 text-[#4F46E5] bg-indigo-50/50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 m-0">
                      Verified Listings
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed m-0">
                      Every vehicle is verified against national registry databases and regional logs before it ever goes public.
                    </p>
                  </div>
                </div>

                {/* Horizontal Divider 1 */}
                <div className="h-[1px] bg-gray-100/80 w-full" />

                {/* Feature 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-indigo-100 text-[#4F46E5] bg-indigo-50/50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 m-0">
                      Secure & Direct
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed m-0">
                      Communicate with sellers directly using our integrated real-time chat with no dealer commission or pushy markups.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-8 md:space-y-10">
                {/* Feature 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-indigo-100 text-[#4F46E5] bg-indigo-50/50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 m-0">
                      AI Trust Score
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed m-0">
                      A mathematical trust score between 0 and 100 generated from response times, inspection history, and fraud probability.
                    </p>
                  </div>
                </div>

                {/* Horizontal Divider 2 */}
                <div className="h-[1px] bg-gray-100/80 w-full" />

                {/* Feature 4 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-indigo-100 text-[#4F46E5] bg-indigo-50/50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-900 m-0">
                      Fair Price Insights
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed m-0">
                      Real-time valuation based on local market metrics, mileage, condition, and brand algorithms so you pay exactly what is fair.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <ClientFeedback />

      {/* Sell Your Car CTA Banner Section */}
      <div className="max-w-5xl mx-auto px-6 w-full mb-28 mt-12">
        <div className="bg-[#F4F4F6] rounded-[24px] md:rounded-[32px] border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-visible shadow-sm">
          {/* Left Text */}
          <div className="w-full md:w-[48%] md:max-w-[340px] text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight m-0 mb-3" style={{ color: '#0F0F17' }}>
              Sell your car in minutes
            </h2>
            <p className="text-sm m-0 leading-relaxed" style={{ color: '#6B7280' }}>
              Reach over 2M buyers instantly. Get the best price for your vehicle.
            </p>
          </div>

          {/* Overlapping Car Image (Center-Right on Desktop) */}
          <div className="absolute left-[40%] lg:left-[43%] top-1/2 -translate-y-1/2 w-[300px] lg:w-[350px] hidden md:flex items-center justify-center pointer-events-none z-10 overflow-visible">
            <img
              src="/cta-car.png"
              alt="Porsche CTA Car"
              className="w-full h-auto object-contain transform scale-110 drop-shadow-xl"
            />
          </div>

          {/* Right Button */}
          <div className="w-full md:w-auto z-20 flex md:justify-end">
            <Link to="/create-listing" className="w-full md:w-auto">
              <Button
                variant="dark"
                className="w-full md:w-auto py-3.5 px-8 font-bold rounded-xl shadow-lg m-0"
              >
                List Your Car
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
