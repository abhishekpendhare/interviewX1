import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowUp } from 'lucide-react';
import { BrandNeonX } from '@/components/ui/BrandNeonX';
import { useAuth } from '@/lib/authContext';

export const AISaasFooter: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const getLink = (path: string) => user ? path : `/login?next=${encodeURIComponent(path)}`;
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1020] text-white border-t border-white/10 relative overflow-hidden pt-20 pb-12">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#6D5CFF]/15 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center space-y-10">
        
        {/* Large Centered Neon X with Floor Reflection and Sparkles (Matching ref-07) */}
        <div className="relative flex flex-col items-center">
          
          {/* Neon X */}
          <div className="relative z-10">
            <BrandNeonX size="footer" withGlow={true} />
            
            {/* Sparkles around X */}
            <div className="absolute -top-2 -right-3 text-[#2DD4D0] animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute top-8 -left-4 text-[#8B7BFF] animate-pulse [animation-delay:0.5s]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Floor Reflection (Flipped inverted X with gradient mask) */}
          <div className="relative -mt-4 opacity-25 scale-y-[-0.6] blur-[2px] pointer-events-none [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1),transparent)]">
            <BrandNeonX size="footer" withGlow={false} />
          </div>
        </div>

        {/* Thin Horizontal Divider Line */}
        <div className="w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Centered Navigation Links Row (Matching ref-07) */}
        <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm font-medium text-white/75">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <a 
            href={location.pathname === '/' ? '#section-hero' : '/#section-hero'} 
            className="hover:text-white transition-colors"
          >
            About Us
          </a>
          <Link to={getLink('/compiler')} className="hover:text-white transition-colors">
            Performance
          </Link>
          <Link to={getLink('/simulator')} className="hover:text-white transition-colors">
            Ratings
          </Link>
          <a 
            href={location.pathname === '/' ? '#section-contact' : '/#section-contact'} 
            className="hover:text-white transition-colors"
          >
            Contact Us
          </a>
          {!user ? (
            <Link to="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
          ) : (
            <Link to="/foundations" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Bottom Legal & Copyright Row */}
        <div className="pt-6 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 border-t border-white/10">
          <div>
            © 2026 InterviewX Inc. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to={getLink('/articles')} className="hover:text-white transition-colors">
              Articles & Rubrics
            </Link>
            <Link to={getLink('/dossier')} className="hover:text-white transition-colors">
              Candidate Telemetry
            </Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-white transition-colors text-white/60"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
