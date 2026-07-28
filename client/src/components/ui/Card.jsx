import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-paper-raised border border-line rounded-md shadow-card p-5 transition-all hover:-translate-y-1 hover:shadow-lift ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
