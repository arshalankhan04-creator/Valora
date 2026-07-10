import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Navbar = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-100 py-4 px-6 md:px-8 z-30 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link to="/" className="text-2xl font-extrabold text-[#0F0F17] tracking-tight no-underline">
          Valora
        </Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/browse" className="text-gray-600 hover:text-[#4F46E5] font-semibold no-underline transition-colors text-sm">
            Buy
          </Link>
          <Link to="/" className="text-gray-600 hover:text-[#4F46E5] font-semibold no-underline transition-colors text-sm">
            Sell
          </Link>
          <Link to="/" className="text-gray-600 hover:text-[#4F46E5] font-semibold no-underline transition-colors text-sm">
            Finance
          </Link>
          <Link to="/" className="text-gray-600 hover:text-[#4F46E5] font-semibold no-underline transition-colors text-sm">
            About
          </Link>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="no-underline">
            <Button variant="flat" className="px-4 py-2 text-sm font-bold">
              Login
            </Button>
          </Link>
          <Link to="/register" className="no-underline">
            <Button variant="primary" pill className="px-5 py-2 text-sm font-bold bg-[#4F46E5]">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
