import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mic, Compass, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface QuickTile {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  href: string;
}

const QUICK_TILES: QuickTile[] = [
  {
    id: 'practice',
    icon: Code2,
    iconBg: 'bg-[#38BDF8]/15 border-[#38BDF8]/30',
    iconColor: 'text-[#38BDF8]',
    title: 'Practice Arena',
    subtitle: '3,555+ Verified Problems & Runtimes',
    href: '/compiler'
  },
  {
    id: 'mock',
    icon: Mic,
    iconBg: 'bg-[#6D5CFF]/20 border-[#6D5CFF]/40',
    iconColor: 'text-[#8B7BFF]',
    title: 'Mock Simulator',
    subtitle: 'Autonomous Voice Bar-Raiser Rubrics',
    href: '/simulator'
  },
  {
    id: 'tracks',
    icon: Compass,
    iconBg: 'bg-[#2DD4D0]/15 border-[#2DD4D0]/30',
    iconColor: 'text-[#2DD4D0]',
    title: 'Tracks & Sprints',
    subtitle: '60-Day Curriculum for SDE-1 Offers',
    href: '/foundations'
  },
  {
    id: 'companies',
    icon: Building2,
    iconBg: 'bg-amber-500/15 border-amber-500/30',
    iconColor: 'text-amber-400',
    title: 'Company Archives',
    subtitle: 'Amazon, Google, TCS Prime Rubrics',
    href: '/articles'
  }
];

export const AISaasQuickTiles: React.FC = () => {
  const { user } = useAuth();
  const [activeTile, setActiveTile] = useState<string>('mock');

  return (
    <section className="relative z-20 pb-16 bg-[#0B1020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {QUICK_TILES.map((tile) => {
            const isActive = activeTile === tile.id;
            const Icon = tile.icon;

            return (
              <Link
                key={tile.id}
                to={user ? tile.href : `/login?next=${encodeURIComponent(tile.href)}`}
                onMouseEnter={() => setActiveTile(tile.id)}
                className={`relative rounded-2xl p-5 transition-all duration-300 flex items-start gap-4 border group backdrop-blur-xl overflow-hidden ${
                  isActive
                    ? 'bg-[#141C36]/90 border-[#6D5CFF]/50 shadow-[0_10px_30px_rgba(109,92,255,0.25)] -translate-y-1'
                    : 'bg-[#10172D]/60 hover:bg-[#141C36]/75 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Active Tile Bottom Glowing Accent Underline (matching ref-01) */}
                {isActive && (
                  <motion.div
                    layoutId="activeTileUnderline"
                    className="absolute bottom-0 left-4 right-4 h-[3px] bg-gradient-to-r from-[#2DD4D0] via-[#6D5CFF] to-[#8B7BFF] rounded-full shadow-[0_0_12px_#6D5CFF]"
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                )}

                {/* Left Icon */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${tile.iconBg}`}>
                  <Icon className={`w-5 h-5 ${tile.iconColor}`} />
                </div>

                {/* Text Block */}
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-white group-hover:text-[#2DD4D0] transition-colors truncate">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {tile.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
