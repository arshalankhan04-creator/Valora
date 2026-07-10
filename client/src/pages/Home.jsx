import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

// Static Featured Cars Dummy Data
const FEATURED_CARS = [
  {
    id: '1',
    brand: 'Audi',
    model: 'A6 Sedan',
    year: 2021,
    price: 4500000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '12,500 km',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: '2',
    brand: 'BMW',
    model: '5 Series',
    year: 2022,
    price: 5200000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: '8,200 km',
    gradient: 'from-blue-700 to-blue-900',
  },
  {
    id: '3',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2020,
    price: 3800000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '24,000 km',
    gradient: 'from-zinc-700 to-zinc-900',
  },
  {
    id: '4',
    brand: 'Porsche',
    model: 'Macan SUV',
    year: 2021,
    price: 7800000,
    fuelType: 'Petrol',
    transmission: 'PDK Automatic',
    mileage: '14,800 km',
    gradient: 'from-amber-700 to-amber-900',
  },
  {
    id: '5',
    brand: 'Jaguar',
    model: 'XF Luxury',
    year: 2022,
    price: 4800000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: '6,400 km',
    gradient: 'from-red-800 to-red-950',
  },
  {
    id: '6',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 6000000,
    fuelType: 'Electric',
    transmission: 'Single Speed',
    mileage: '4,100 km',
    gradient: 'from-emerald-700 to-emerald-950',
  }
];

const Home = () => {
  return (
    <div className="w-full bg-[#FAFAFC] min-h-screen flex flex-col font-sans">
      
      {/* Hero Section Container */}
      <div className="relative w-full min-h-[500px] bg-white overflow-hidden flex items-center">
        
        {/* Diagonal Slanted Indigo Background Split (Clipped Div) */}
        <div 
          className="absolute inset-y-0 right-0 w-[50%] bg-[#4F46E5] z-0 hidden md:block" 
          style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />

        {/* Content Layer */}
        <div className="max-w-6xl mx-auto px-6 w-full relative z-10 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Zone: Headline & Actions (On White background) */}
          <div className="flex-1 text-left space-y-8 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F0F17] tracking-tight leading-tight m-0 uppercase">
                FAIR BUYING. <br />
                <span className="text-[#4F46E5]">FAIR SELLING.</span>
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
            {/* Make */}
            <div className="w-full text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Make
              </label>
              <select className="w-full bg-[#F4F4F6] border-none rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-gray-700 appearance-none">
                <option value="">Select Make</option>
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
            className="relative z-10 font-extrabold text-5xl md:text-7xl tracking-widest uppercase m-0 text-center select-none pt-4"
            style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.5)', color: 'transparent', fontFamily: 'Inter, sans-serif' }}
          >
            Valora
          </h2>
        </div>
      </div>

      {/* Featured Cars Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mt-20 mb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-[#0F0F17] tracking-tight m-0">
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
          {FEATURED_CARS.map((car) => {
            return (
              <div 
                key={car.id} 
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col group cursor-pointer"
              >
                {/* Styled placeholder image using a dynamic color gradient */}
                <div className={`w-full h-48 bg-gradient-to-br ${car.gradient} relative overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10 mix-blend-multiply transition-opacity group-hover:opacity-0" />
                  <span className="text-white/20 font-black text-6xl select-none tracking-widest uppercase">
                    {car.brand.substring(0, 3)}
                  </span>
                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-white/95 text-gray-900 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                    {car.year}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-1 text-left">
                  <h4 className="text-xl font-bold text-gray-900 m-0 truncate">
                    {car.brand} {car.model}
                  </h4>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 font-semibold">
                    <span>{car.fuelType}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{car.transmission}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{car.mileage}</span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Price
                    </span>
                    <span className="text-lg font-extrabold text-[#4F46E5]">
                      ₹{car.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Browse by Category Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-24 text-left">
        <h2 className="text-3xl font-extrabold text-[#0F0F17] tracking-tight mb-8">
          Browse by Category
        </h2>
        
        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {[
            { 
              name: 'SUV', 
              icon: (
                <svg className="w-10 h-10 text-gray-700 transition-colors group-hover:text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h7.5m3 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5m-9-3h-3.75a1.125 1.125 0 0 1-1.125-1.125V11.25m14.25 4.5h1.125a1.125 1.125 0 0 0 1.125-1.125V12.75a3.375 3.375 0 0 0-3.375-3.375H13.5M5.25 15h13.5m-13.5 0V9.75h1.125c.621 0 1.125-.504 1.125-1.125v-1.5a1.125 1.125 0 0 1 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h1.5V15" />
                </svg>
              ) 
            },
            { 
              name: 'Sedan', 
              icon: (
                <svg className="w-10 h-10 text-gray-700 transition-colors group-hover:text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h7.5m3 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5m-9-3h-3.75a1.125 1.125 0 0 1-1.125-1.125V12h14.25v2.625a1.125 1.125 0 0 1-1.125 1.125H12.75m-6.75-3h12m-12 0V9h1.125A1.125 1.125 0 0 1 8.25 10.125V12M15.75 9h1.125A1.125 1.125 0 0 1 18 10.125V12M8.25 9h7.5v1.5H8.25V9z" />
                </svg>
              ) 
            },
            { 
              name: 'Hatchback', 
              icon: (
                <svg className="w-10 h-10 text-gray-700 transition-colors group-hover:text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h7.5m3 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5m-9-3H4.5a1.125 1.125 0 0 1-1.125-1.125V13.5m14.25 2.25h1.125a1.125 1.125 0 0 0 1.125-1.125V12a3 3 0 0 0-3-3H12V7.5A1.5 1.5 0 0 0 10.5 6h-3A1.5 1.5 0 0 0 6 7.5V11.25m9.75 4.5h-10.5" />
                </svg>
              ) 
            },
            { 
              name: 'Coupe', 
              icon: (
                <svg className="w-10 h-10 text-gray-700 transition-colors group-hover:text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h7.5m3 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5m-9-3h-3.75a1.125 1.125 0 0 1-1.125-1.125V12.75A1.125 1.125 0 0 1 4.5 11.625h12.375a3 3 0 0 1 3 3v1.125a1.125 1.125 0 0 1-1.125 1.125H12.75m-6.75-3h12" />
                </svg>
              ) 
            },
            { 
              name: 'Truck', 
              icon: (
                <svg className="w-10 h-10 text-gray-700 transition-colors group-hover:text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h7.5m3 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5m-9-3h-3.75a1.125 1.125 0 0 1-1.125-1.125V9.75a1.125 1.125 0 0 1 1.125-1.125h3c.621 0 1.125.504 1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h3.75a1.125 1.125 0 0 0 1.125-1.125v-3c0-.621.504-1.125 1.125-1.125h3a1.125 1.125 0 0 1 1.125 1.125v6.75h1.5" />
                </svg>
              ) 
            },
            { 
              name: 'Luxury', 
              icon: (
                <svg className="w-10 h-10 text-gray-700 transition-colors group-hover:text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 0 1 8.716 6.747M12 3a9.003 9.003 0 0 0-8.716 6.747M12 9.75h.008v.008H12V9.75zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008z" />
                </svg>
              ) 
            }
          ].map((cat, idx) => (
            <Link 
              key={idx} 
              to="/browse" 
              className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 no-underline"
            >
              <div className="w-16 h-16 rounded-full bg-[#F4F4F6] flex items-center justify-center group-hover:bg-indigo-50 transition-colors duration-300">
                {cat.icon}
              </div>
              <span className="text-sm font-bold text-gray-800 group-hover:text-[#4F46E5] transition-colors duration-200">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-28 text-left">
        <h2 className="text-3xl font-extrabold text-[#0F0F17] tracking-tight mb-8">
          Why Choose Valora
        </h2>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              title: 'Verified Listings',
              description: 'Every listing is reviewed before it goes live',
              icon: (
                <svg className="w-6 h-6 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )
            },
            {
              title: 'AI Trust Score',
              description: 'Every car gets a transparent trust score before you even message the seller',
              icon: (
                <svg className="w-6 h-6 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )
            },
            {
              title: 'Secure & Direct',
              description: 'Message sellers directly, no middlemen, no hidden fees',
              icon: (
                <svg className="w-6 h-6 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )
            },
            {
              title: 'Fair Price Insights',
              description: 'AI-backed price guidance so you know if a deal is fair',
              icon: (
                <svg className="w-6 h-6 text-[#4F46E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              )
            }
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col text-left shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 m-0">
                {feature.title}
              </h4>
              <p className="text-sm text-gray-500 m-0 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-28 text-left">
        <h2 className="text-3xl font-extrabold text-[#0F0F17] tracking-tight mb-2">
          Loved by Drivers & Sellers
        </h2>
        <p className="text-gray-500 mb-8 m-0 text-sm">
          Hear from our community who bought and sold their cars with full transparency.
        </p>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Rahul S.',
              city: 'Mumbai',
              initials: 'RS',
              bgColor: 'bg-indigo-100 text-[#4F46E5]',
              quote: 'Selling my 3 Series was incredibly painless. The AI Trust Score gave buyers immediate confidence, and I had serious offers within 48 hours without dealer lowballs.'
            },
            {
              name: 'Priya K.',
              city: 'Bangalore',
              initials: 'PK',
              bgColor: 'bg-emerald-100 text-emerald-700',
              quote: 'I was nervous about buying a used Audi, but the Fair Price Insights showed me the deal was solid. Messaging the owner directly made the whole process transparent.'
            },
            {
              name: 'Aman M.',
              city: 'Delhi',
              initials: 'AM',
              bgColor: 'bg-purple-100 text-purple-700',
              quote: 'Valora removes all the guesswork from car shopping. The verified listings meant I didn\'t waste time on fake ads, and the trust metrics are spot on.'
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div>
                {/* 5-star rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm italic text-gray-600 m-0 leading-relaxed">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm ${item.bgColor}`}>
                  {item.initials}
                </div>
                <div className="text-left">
                  <h5 className="text-sm font-bold text-gray-900 m-0">
                    {item.name}
                  </h5>
                  <span className="text-xs text-gray-400 font-semibold">
                    {item.city}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sell Your Car CTA Banner Section */}
      <div className="max-w-5xl mx-auto px-6 w-full mb-28">
        <div className="bg-[#F4F4F6] rounded-[24px] md:rounded-[32px] border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-visible shadow-sm">
          {/* Left Text */}
          <div className="w-full md:w-[48%] md:max-w-[340px] text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F0F17] tracking-tight m-0 mb-3">
              Sell your car in minutes
            </h2>
            <p className="text-sm text-gray-500 m-0 leading-relaxed">
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
