import React, { useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import { FiSearch } from 'react-icons/fi';
import { BiBuildingHouse } from "react-icons/bi";

const TOP_COMPANIES = [
  { name: "TCS", domain: "tcs.com", industry: "IT Services", count: 1200, easy: 40, medium: 40, hard: 20 },
  { name: "Infosys", domain: "infosys.com", industry: "IT Services", count: 1150, easy: 45, medium: 40, hard: 15 },
  { name: "Wipro", domain: "wipro.com", industry: "IT Services", count: 980, easy: 40, medium: 45, hard: 15 },
  { name: "HCLTech", domain: "hcltech.com", industry: "IT Services", count: 950, easy: 35, medium: 50, hard: 15 },
  { name: "Tech Mahindra", domain: "techmahindra.com", industry: "IT Services", count: 890, easy: 40, medium: 45, hard: 15 },
  { name: "Cognizant", domain: "cognizant.com", industry: "IT Services", count: 1050, easy: 30, medium: 50, hard: 20 },
  { name: "Reliance Jio", domain: "jio.com", industry: "Telecom & Tech", count: 850, easy: 25, medium: 50, hard: 25 },
  { name: "Flipkart", domain: "flipkart.com", industry: "E-commerce", count: 680, easy: 15, medium: 45, hard: 40 },
  { name: "Zomato", domain: "zomato.com", industry: "Food Tech", count: 540, easy: 20, medium: 40, hard: 40 },
  { name: "Swiggy", domain: "swiggy.com", industry: "Food Tech", count: 520, easy: 20, medium: 45, hard: 35 },
  { name: "Paytm", domain: "paytm.com", industry: "Fintech", count: 610, easy: 25, medium: 45, hard: 30 },
  { name: "Zoho", domain: "zoho.com", industry: "SaaS", count: 480, easy: 10, medium: 50, hard: 40 },
  { name: "Ola", domain: "olacabs.com", industry: "Mobility", count: 450, easy: 20, medium: 45, hard: 35 },
  { name: "L&T", domain: "larsentoubro.com", industry: "Engineering", count: 720, easy: 30, medium: 50, hard: 20 },
  { name: "MakeMyTrip", domain: "makemytrip.com", industry: "Travel Tech", count: 320, easy: 25, medium: 50, hard: 25 },
  { name: "PhonePe", domain: "phonepe.com", industry: "Fintech", count: 390, easy: 15, medium: 45, hard: 40 },
  { name: "Cred", domain: "cred.club", industry: "Fintech", count: 280, easy: 10, medium: 40, hard: 50 },
  { name: "Zerodha", domain: "zerodha.com", industry: "Fintech", count: 210, easy: 5, medium: 45, hard: 50 },
  { name: "Postman", domain: "postman.com", industry: "Dev Tools", count: 310, easy: 15, medium: 45, hard: 40 },
  { name: "Razorpay", domain: "razorpay.com", industry: "Fintech", count: 380, easy: 15, medium: 50, hard: 35 },
  { name: "Meesho", domain: "meesho.com", industry: "E-commerce", count: 420, easy: 20, medium: 45, hard: 35 },
  { name: "Udaan", domain: "udaan.com", industry: "B2B E-commerce", count: 290, easy: 25, medium: 45, hard: 30 },
  { name: "ShareChat", domain: "sharechat.com", industry: "Social Media", count: 240, easy: 25, medium: 50, hard: 25 },
  { name: "Dream11", domain: "dream11.com", industry: "Gaming", count: 310, easy: 20, medium: 45, hard: 35 },
  { name: "Freshworks", domain: "freshworks.com", industry: "SaaS", count: 480, easy: 20, medium: 50, hard: 30 },
  { name: "BrowserStack", domain: "browserstack.com", industry: "Testing", count: 260, easy: 15, medium: 45, hard: 40 },
  { name: "Delhivery", domain: "delhivery.com", industry: "Logistics", count: 350, easy: 30, medium: 50, hard: 20 },
  { name: "Nykaa", domain: "nykaa.com", industry: "E-commerce", count: 320, easy: 30, medium: 45, hard: 25 },
  { name: "Byju's", domain: "byjus.com", industry: "EdTech", count: 540, easy: 35, medium: 45, hard: 20 },
  { name: "Unacademy", domain: "unacademy.com", industry: "EdTech", count: 420, easy: 30, medium: 45, hard: 25 },
  { name: "Pine Labs", domain: "pinelabs.com", industry: "Fintech", count: 290, easy: 25, medium: 50, hard: 25 },
  { name: "CARS24", domain: "cars24.com", industry: "Auto Tech", count: 210, easy: 30, medium: 45, hard: 25 },
  { name: "Oyo", domain: "oyorooms.com", industry: "Hospitality Tech", count: 380, easy: 30, medium: 45, hard: 25 },
  { name: "Groww", domain: "groww.in", industry: "Fintech", count: 270, easy: 20, medium: 50, hard: 30 },
  { name: "Upstox", domain: "upstox.com", industry: "Fintech", count: 250, easy: 20, medium: 50, hard: 30 },
  { name: "Coforge", domain: "coforge.com", industry: "IT Services", count: 410, easy: 35, medium: 45, hard: 20 },
  { name: "Mindtree", domain: "mindtree.com", industry: "IT Services", count: 380, easy: 35, medium: 45, hard: 20 },
  { name: "Mphasis", domain: "mphasis.com", industry: "IT Services", count: 340, easy: 35, medium: 50, hard: 15 },
  { name: "Tata Elxsi", domain: "tataelxsi.com", industry: "Design & Tech", count: 290, easy: 25, medium: 45, hard: 30 },
  { name: "Persistent", domain: "persistent.com", industry: "IT Services", count: 320, easy: 30, medium: 45, hard: 25 }
];

const CompanyPrepList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = useMemo(() => {
    return TOP_COMPANIES.filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Company Preparation
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            AI-powered interview roadmaps and most asked questions for top tech companies.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FiSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm border"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCompanies.map((company) => {
            const easy = company.easy;
            const medium = company.medium;
            const hard = company.hard;

            return (
              <Link
                key={company.name}
                to={`/company-prep/${company.name}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                    <img 
                      src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${company.domain}&size=128`} 
                      alt={`${company.name} logo`} 
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://ui-avatars.com/api/?name=${company.name}&background=e0e7ff&color=4f46e5&rounded=true`;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-500">{company.industry}</p>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">Questions Base</span>
                    <span className="text-slate-900">{company.count}+</span>
                  </div>
                  
                  {/* Difficulty Distribution Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 flex">
                    <div style={{ width: `${easy}%` }} className="bg-emerald" title={`Easy: ${easy}%`}></div>
                    <div style={{ width: `${medium}%` }} className="bg-amber" title={`Medium: ${medium}%`}></div>
                    <div style={{ width: `${hard}%` }} className="bg-coral" title={`Hard: ${hard}%`}></div>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <span className="text-emerald">Easy</span>
                    <span className="text-amber">Med</span>
                    <span className="text-coral">Hard</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <FiSearch size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No companies found</h3>
          <p className="mt-1 text-sm text-slate-500">
            We couldn't find a match for "{searchTerm}".
          </p>
          <button 
            onClick={() => setSearchTerm("")}
            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyPrepList;
