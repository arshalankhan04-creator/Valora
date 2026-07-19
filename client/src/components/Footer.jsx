import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 w-full">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 pb-12 border-b border-gray-50">
          
          {/* Links Columns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16 text-left">
            {/* Quick Links */}
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                Quick Links
              </span>
              <ul className="list-none p-0 m-0 space-y-3">
                <li>
                  <Link to="/browse" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors duration-200 no-underline">
                    Browse Cars
                  </Link>
                </li>
                <li>
                  <Link to="/create-listing" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors duration-200 no-underline">
                    Sell Your Car
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors duration-200 no-underline">
                    About Valora
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                Support
              </span>
              <ul className="list-none p-0 m-0 space-y-3">
                <li>
                  <Link to="/faq" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors duration-200 no-underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors duration-200 no-underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors duration-200 no-underline">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Say Hello! */}
            <div className="flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                Say Hello!
              </span>
              <div className="flex items-center gap-3">
                {/* Globe Icon */}
                <Link to="/about" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-200">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </Link>
                {/* Email Icon */}
                <Link to="/contact" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-200">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </Link>
                {/* Phone Icon */}
                <Link to="/contact" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-200">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Outlined Contact Button */}
          <div className="flex md:justify-end">
            <Link to="/contact">
              <Button 
                variant="outline" 
                pill={true} 
                className="px-6 py-2.5 text-sm font-bold text-gray-800 border border-gray-300 hover:bg-gray-50 shadow-sm"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Giant Branding Wordmark */}
        <div className="w-full pt-10 select-none overflow-hidden flex items-center justify-center">
          <div 
            className="text-[6.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem] uppercase m-0 leading-none text-center"
            style={{ fontFamily: 'Anoxic, sans-serif', color: 'var(--color-textCharcoal)', fontWeight: 500, letterSpacing: '0.05em' }}
          >
            Valora
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
