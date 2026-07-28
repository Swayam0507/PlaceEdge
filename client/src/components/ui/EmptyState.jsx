import React from 'react';

const EmptyState = ({ icon, title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-paper-raised border border-dashed border-line rounded-lg">
      <div className="h-16 w-16 mb-4 text-muted bg-paper rounded-full flex items-center justify-center">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-display font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm font-body text-text-secondary max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-ink text-white font-body font-medium rounded-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
