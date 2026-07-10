import React from 'react';

const Button = ({ children, type = 'button', onClick, className = '', disabled = false, variant = 'primary', pill = false }) => {
  const baseStyle = 'px-6 py-3 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white bg-[#4F46E5] hover:bg-[#3730A3]',
    outline: 'bg-transparent border border-gray-300 text-[#0F0F17] hover:bg-gray-50',
    secondary: 'bg-transparent border border-white text-white hover:bg-white/10',
    flat: 'text-[#4F46E5] hover:bg-[#4F46E5]/10',
    dark: 'bg-[#0F0F17] hover:bg-gray-800 text-white'
  };

  const shape = pill ? 'rounded-full' : 'rounded-lg';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${shape} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
