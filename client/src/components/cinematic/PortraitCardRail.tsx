import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Award, Target, Flame } from 'lucide-react';
import { ScrollRevealLeft } from '@/components/ui/ScrollRevealLeft';

interface PortraitTrack {

  id: string;
  series: string;
  title: string;
  tier: string;
  focus: string;
  companies: string[];
  image: string;
  href: string;
  tag: string;
}

const PORTRAIT_TRACKS: PortraitTrack[] = [
  {
    id: 'track-01',
    series: 'SERIES 01 // FAANG & TIER-1',
    title: 'Product SDE-1 Elite',
    tier: '₹18 - 45+ LPA',
    focus: 'Dynamic Programming, Graph Algorithmic Invariants, Java 21 Concurrency, Sharded LLD',
    companies: ['Google', 'Amazon', 'Microsoft', 'Uber', 'Atlassian'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    href: '/compiler',
    tag: 'MAXIMUM RIGOR'
  },
  {
    id: 'track-02',
    series: 'SERIES 02 // FINTECH & UNICORNS',
    title: 'High-Velocity Backend',
    tier: '₹14 - 28 LPA',
    focus: 'PostgreSQL Indexing & B-Trees, Kafka Streaming, Spring Boot, Microservice Resilience',
    companies: ['Razorpay', 'PhonePe', 'Cred', 'Swiggy', 'Groww'],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    href: '/foundations',
    tag: 'HIGH VELOCITY'
  },
  {
    id: 'track-03',
    series: 'SERIES 03 // QUANT & SYSTEMS',
    title: 'Low-Latency C++ Engine',
    tier: '₹35 - 70+ LPA',
    focus: 'C++20 Memory Models, Cache Invariants, Lock-Free Queues, Bit Manipulation',
    companies: ['Tower Research', 'Graviton', 'WorldQuant', 'DE Shaw'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    href: '/compiler',
    tag: 'SUB-MICROSECOND'
  },
  {
    id: 'track-04',
    series: 'SERIES 04 // ENTERPRISE PRIME',
    title: 'TCS Prime & Infosys DSE',
    tier: '₹9 - 14 LPA',
    focus: 'Advanced Quantitative Aptitude, Core OOP Invariants, SQL Tuning, Java 17 Basics',
    companies: ['TCS Prime', 'Infosys Specialist', 'Cognizant Elevate', 'Wipro Turbo'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    href: '/foundations',
    tag: 'SPEED & ACCURACY'
  },
  {
    id: 'track-05',
    series: 'SERIES 05 // SYSTEM DESIGN',
    title: 'Staff Architect & LLD',
    tier: '₹25 - 60+ LPA',
    focus: 'Distributed Caching, Raft Consensus, Clean Architecture, Database Sharding',
    companies: ['Stripe', 'Airbnb', 'Zomato', 'Flipkart'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    href: '/simulator',
    tag: 'ARCHITECTURAL RIGOR'
  }
];

export const PortraitCardRail: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="section-portrait" className="py-20 lg:py-28 bg-[#0E1418] text-white border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        
        <ScrollRevealLeft className="space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E02B20]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#E02B20] font-bold">
              PORTFOLIO CALIBRATION
            </span>
          </div>
          <h2 className="headline-section text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
            SELECT YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
              RACING CLASS.
            </span>
          </h2>
        </ScrollRevealLeft>

        {/* Scroll Nav Buttons */}
        <ScrollRevealLeft delay={0.1} className="flex items-center gap-3">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="w-12 h-12 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="w-12 h-12 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </ScrollRevealLeft>

      </div>


      {/* 3:4 Portrait Cards Rail Container */}
      <div 
        ref={scrollRef}
        className="rail-container flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-6 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {PORTRAIT_TRACKS.map((track) => (
          <div
            key={track.id}
            className="portrait-card shrink-0 w-[280px] sm:w-[320px] md:w-[360px] aspect-[3/4] snap-start relative overflow-hidden group border border-white/15 hover:border-white/40 bg-black transition-all duration-300 flex flex-col justify-between p-6 sm:p-8"
          >
            {/* Background Image with Cinematic Gradient */}
            <div className="absolute inset-0 z-0">
              <img
                src={track.image}
                alt={track.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 group-hover:opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1418] via-[#0E1418]/70 to-black/40" />
            </div>

            {/* Top Pill / Series */}
            <div className="relative z-10 flex items-start justify-between gap-2">
              <span className="tag-caps bg-black/80 backdrop-blur-md px-3 py-1 font-mono text-[10px] sm:text-xs text-white/90 border border-white/20 uppercase tracking-widest font-bold">
                {track.tag}
              </span>
              <span className="font-mono text-xs text-[#00E5FF] font-bold">
                {track.tier}
              </span>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
                  {track.series}
                </div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight group-hover:text-[#00E5FF] transition-colors leading-tight">
                  {track.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed">
                {track.focus}
              </p>

              {/* Companies pill strip */}
              <div className="flex flex-wrap gap-1 pt-2">
                {track.companies.slice(0, 3).map(comp => (
                  <span key={comp} className="text-[10px] font-mono bg-white/10 px-2 py-0.5 text-white/80">
                    {comp}
                  </span>
                ))}
                {track.companies.length > 3 && (
                  <span className="text-[10px] font-mono text-white/40 self-center">
                    +{track.companies.length - 3} more
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/15">
                <Link
                  to={track.href}
                  className="inline-flex items-center justify-between w-full text-xs font-mono font-bold uppercase tracking-widest text-white group-hover:text-[#E02B20] transition-colors"
                >
                  <span>CALIBRATE TRACK</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>

            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
