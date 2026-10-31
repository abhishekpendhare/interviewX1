import React from 'react';

const COMPANIES = [
  'GOOGLE',
  'AMAZON',
  'MICROSOFT',
  'UBER',
  'ATLASSIAN',
  'RAZORPAY',
  'PHONEPE',
  'SWIGGY',
  'ZOMATO',
  'FLIPKART',
  'CRED',
  'TOWER RESEARCH',
  'GRAVITON',
  'TCS PRIME',
  'INFOSYS SPECIALIST',
  'DE SHAW',
  'BLOOMBERG'
];

export const CompaniesMarquee: React.FC = () => {
  return (
    <section id="section-companies" className="py-12 bg-[#0E1418] text-white border-b border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">
          COMPANIES OUR CANDIDATES TARGET & DOMINATE
        </span>
      </div>

      {/* Infinite Scrolling Marquee Track */}
      <div className="relative flex overflow-x-hidden group">
        {/* Left and right gradient fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0E1418] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0E1418] to-transparent z-10 pointer-events-none" />

        <div className="flex shrink-0 animate-marquee items-center gap-12 sm:gap-16 group-hover:[animation-play-state:paused] py-4">
          {COMPANIES.map((company, index) => (
            <div
              key={`c1-${index}`}
              className="flex items-center gap-12 sm:gap-16"
            >
              <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-white/40 hover:text-white transition-colors duration-200 cursor-default select-none whitespace-nowrap">
                {company}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          ))}
        </div>

        {/* Duplicate track for seamless infinite loop */}
        <div className="flex shrink-0 animate-marquee items-center gap-12 sm:gap-16 group-hover:[animation-play-state:paused] py-4" aria-hidden="true">
          {COMPANIES.map((company, index) => (
            <div
              key={`c2-${index}`}
              className="flex items-center gap-12 sm:gap-16"
            >
              <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-white/40 hover:text-white transition-colors duration-200 cursor-default select-none whitespace-nowrap">
                {company}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
