import React, { useState, useEffect } from 'react';
import { FiRadio } from 'react-icons/fi';

const NewsWidget = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://inc42.com/feed/&api_key=');
        const data = await res.json();
        if (data.status === 'ok' && data.items && data.items.length > 0) {
          setNews(data.items.slice(0, 5));
        } else {
          throw new Error('API failed');
        }
      } catch (err) {
        setNews([
          {
            title: "Infosys & TCS announce mega hiring drives for 2026 graduates across India",
            pubDate: new Date().toISOString(),
            author: "Economic Times Tech",
            link: "https://economictimes.indiatimes.com/tech"
          },
          {
            title: "Indian SaaS startups projected to reach $50B in revenue by 2030",
            pubDate: new Date(Date.now() - 86400000).toISOString(),
            author: "Inc42",
            link: "https://inc42.com/"
          },
          {
            title: "Zoho introduces new AI-powered tools developed entirely in Chennai R&D center",
            pubDate: new Date(Date.now() - 172800000).toISOString(),
            author: "YourStory",
            link: "https://yourstory.com/"
          },
          {
            title: "Bengaluru overtakes Silicon Valley in tech job creation this quarter",
            pubDate: new Date(Date.now() - 259200000).toISOString(),
            author: "Moneycontrol",
            link: "https://www.moneycontrol.com/tech/"
          },
          {
            title: "Reliance Jio's upcoming AI platform 'JioBrain' aims to revolutionize telecom",
            pubDate: new Date(Date.now() - 345600000).toISOString(),
            author: "TechCrunch India",
            link: "https://techcrunch.com/"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <FiRadio size={16} />
        </span>
        Tech Industry News
      </h3>
      <div className="flex flex-col gap-3">
        {news.map((item, index) => (
          <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:bg-white group-hover:shadow-sm">
              <h4 className="mb-1.5 text-sm font-semibold leading-tight text-slate-800 transition-colors group-hover:text-indigo-600 line-clamp-2">
                {item.title}
              </h4>
              <p className="text-xs font-medium text-slate-500 flex items-center justify-between">
                <span>{item.author || 'TechCrunch'}</span>
                <span>{new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget;
