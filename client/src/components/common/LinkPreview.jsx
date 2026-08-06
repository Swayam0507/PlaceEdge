import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setPreview(data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch link preview:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div className="w-full max-w-xl h-24 mt-3 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
    );
  }

  if (error || !preview || (!preview.title && !preview.image)) {
    return null; // Fail gracefully, just show nothing if preview fails
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full max-w-xl mt-3 group"
    >
      <div className="flex flex-col sm:flex-row bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-300">
        {/* Image Section */}
        {preview.image?.url && (
          <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
            <img 
              src={preview.image.url} 
              alt={preview.title || 'Link preview'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-4 flex flex-col justify-center flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
            {preview.title || url}
          </h4>
          
          {preview.description && (
            <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 mb-2">
              {preview.description}
            </p>
          )}
          
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-auto truncate">
            {preview.logo?.url && (
              <img src={preview.logo.url} alt="Favicon" className="w-3 h-3 rounded-sm" />
            )}
            <span className="truncate">{preview.publisher || new URL(url).hostname}</span>
            <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;
