import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';

const ComingSoon = () => {
  const location = useLocation();
  const pathName = location.pathname.substring(1);
  const formattedTitle = pathName 
    ? pathName.charAt(0).toUpperCase() + pathName.slice(1).replace('-', ' ') 
    : 'Page';

  return (
    <div className="max-w-md mx-auto py-20 px-6 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
        {formattedTitle} Coming Soon
      </h2>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        We are building the {formattedTitle.toLowerCase()} feature to connect seamlessly with Valora's trust and valuation engine. Check back soon!
      </p>
      <Link to="/" className="no-underline">
        <Button variant="primary" className="py-2.5 px-6 font-bold bg-primary rounded-xl shadow-md text-white border-none">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};

export default ComingSoon;
