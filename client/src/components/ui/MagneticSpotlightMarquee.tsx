import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface MarqueeItem {
  id: string;
  name: string;
  category: 'Company' | 'Domain' | 'Core';
  badge: string;
}

const MARQUEE_ITEMS: MarqueeItem[] = [
  { id: 'google', name: 'Google', category: 'Company', badge: 'Tier-1' },
  { id: 'dsa', name: 'DSA & Graph Algorithms', category: 'Core', badge: '3,555 Qs' },
  { id: 'amazon', name: 'Amazon Bar Raiser', category: 'Company', badge: 'STAR' },
  { id: 'java', name: 'Java 21 Virtual Threads', category: 'Domain', badge: 'JVM' },
  { id: 'microsoft', name: 'Microsoft', category: 'Company', badge: 'Systems' },
  { id: 'spring', name: 'Spring Boot 3.3 & JPA', category: 'Domain', badge: 'REST' },
  { id: 'uber', name: 'Uber Distributed Systems', category: 'Company', badge: 'Fintech' },
  { id: 'dbms', name: 'PostgreSQL ACID & MVCC', category: 'Core', badge: 'Storage' },
  { id: 'meta', name: 'Meta Core Infra', category: 'Company', badge: 'Scale' },
  { id: 'os', name: 'Linux Kernel & TLB', category: 'Core', badge: 'Memory' },
  { id: 'redis', name: 'Redis Caching & PubSub', category: 'Domain', badge: 'NoSQL' },
  { id: 'cn', name: 'TCP/IP & HTTP/3 Quic', category: 'Core', badge: 'Protocols' }
];

export function MagneticSpotlightMarquee() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -500, y: -500 });
    setIsHovered(false);
  };

  // Double the items array for infinite loop
  const duplicatedItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden py-6 border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-sm"
    >
      {/* Dynamic Magnetic Cursor Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-70 transition-opacity duration-200 hidden md:block z-20"
        style={{
          background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.18), transparent 80%)`
        }}
      />

      {/* Fade Gradients on Edges */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10" />

      {/* Continuous Marquee Track */}
      <motion.div
        className="flex items-center gap-4 whitespace-nowrap will-change-transform"
        animate={
          shouldReduceMotion || isHovered
            ? {}
            : { x: [0, -1800] }
        }
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 38,
            ease: 'linear'
          }
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 hover:bg-[var(--bg-card-hover)] transition-all duration-200 shadow-sm shrink-0 group cursor-default select-none"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
            <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] font-heading">
              {item.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
              {item.badge}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
