import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body";
  
  const variants = {
    emerald: "bg-emerald-soft text-emerald",
    amber: "bg-amber-100 text-amber-deep", // using tailwind default amber-100 for soft background
    coral: "bg-red-100 text-coral",
    ink: "bg-ink text-white",
    neutral: "bg-gray-100 text-muted"
  };

  return (
    <span className={`${baseClasses} ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
