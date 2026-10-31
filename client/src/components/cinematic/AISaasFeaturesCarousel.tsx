import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, PhoneOff, Mic, Camera, MessageSquare, User } from 'lucide-react';

interface FeatureCard {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  type: 'call-controls' | 'chat-preview' | 'dialog-bubbles';
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'coding-sandbox',
    icon: Video,
    iconBg: 'bg-[#2DD4D0]/20 border-[#2DD4D0]/40',
    iconColor: 'text-[#2DD4D0]',
    title: 'Algorithmic Code Sandbox',
    description: 'Real-time multi-language compiler with automated edge-case fuzzing and memory layout inspection.',
    type: 'chat-preview'
  },
  {
    id: 'voice-mock',
    icon: Video,
    iconBg: 'bg-gradient-to-tr from-[#2DD4D0] to-[#6D5CFF] border-white/20',
    iconColor: 'text-white',
    title: 'Autonomous Voice Bar-Raiser',
    description: 'Bidirectional audio simulation emulating Tier-1 Staff Engineers with real-time 4-dimensional rubric scoring.',
    type: 'call-controls'
  },
  {
    id: 'star-behavioral',
    icon: User,
    iconBg: 'bg-[#8B7BFF]/20 border-[#8B7BFF]/40',
    iconColor: 'text-[#8B7BFF]',
    title: 'STAR Method Leadership Auditor',
    description: 'Deep structural analysis of Situation, Task, Action, and Result with quantifiable metric checks.',
    type: 'dialog-bubbles'
  }
];

export const AISaasFeaturesCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % FEATURE_CARDS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section 
      className="py-24 bg-[#0B1020] text-white relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
            Features
          </h2>
          <p className="text-sm sm:text-base text-white/60">
            Engineered with deep telemetry to simulate the world's most rigorous engineering rounds.
          </p>
        </div>

        {/* 3-Card Carousel Grid — cards are decorative illustrations, not interactive controls */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center max-w-6xl mx-auto"
          role="region"
          aria-label="Feature highlights carousel"
          aria-live="polite"
          aria-atomic="false"
        >
          {FEATURE_CARDS.map((card, idx) => {
            const isCenter = activeIndex === idx;
            const Icon = card.icon;

            return (
              <motion.div
                key={card.id}
                aria-hidden={!isCenter}
                animate={{
                  scale: isCenter ? 1.05 : 0.95,
                  opacity: isCenter ? 1 : 0.75
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between aspect-[4/5] backdrop-blur-2xl ${
                  isCenter
                    ? 'bg-[#141C36]/90 border-2 border-transparent [background-clip:padding-box] shadow-[0_20px_50px_rgba(109,92,255,0.35)] before:absolute before:inset-0 before:rounded-3xl before:p-[1.5px] before:bg-gradient-to-tr before:from-[#2DD4D0] before:via-[#6D5CFF] before:to-[#8B7BFF] before:-z-10'
                    : 'bg-[#10172D]/60 border border-white/10'
                }`}
              >
                {/* Top: Icon + Titles */}
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg ${card.iconBg}`} aria-hidden="true">
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-heading font-bold text-lg text-white">
                      {card.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Bottom: Decorative Mini UI Preview — not interactive, aria-hidden */}
                <div className="pt-6" aria-hidden="true">
                  {card.type === 'call-controls' && (
                    <div className="bg-[#0E1528]/90 border border-white/15 rounded-2xl p-3 flex items-center justify-center gap-3 shadow-xl">
                      {/* Decorative icon buttons — pointer-events-none so they are not clickable or focusable */}
                      <span className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center pointer-events-none">
                        <Phone className="w-4 h-4" />
                      </span>
                      <span className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white/80 flex items-center justify-center pointer-events-none">
                        <Camera className="w-4 h-4" />
                      </span>
                      <span className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white/80 flex items-center justify-center pointer-events-none">
                        <Mic className="w-4 h-4" />
                      </span>
                      <span className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.5)] pointer-events-none">
                        <PhoneOff className="w-4 h-4" />
                      </span>
                    </div>
                  )}

                  {card.type === 'chat-preview' && (
                    <div className="bg-[#0E1528]/80 border border-white/10 rounded-2xl p-3 space-y-2">
                      <div className="bg-[#2DD4D0]/10 border border-[#2DD4D0]/20 rounded-xl p-2 text-[11px] text-[#2DD4D0]">
                        ✓ Sample: All Test Cases Passed (Isolated Sandbox)
                      </div>
                      <div className="flex justify-end gap-1.5 text-right">
                        <div className="w-6 h-6 rounded-lg bg-[#2DD4D0]/20 flex items-center justify-center text-[#2DD4D0] pointer-events-none">
                          <MessageSquare className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  )}

                  {card.type === 'dialog-bubbles' && (
                    <div className="bg-[#0E1528]/80 border border-white/10 rounded-2xl p-3 space-y-2">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-[11px] text-white/70">
                        "Led migration of sharded PostgreSQL order book..."
                      </div>
                      <div className="bg-[#8B7BFF]/15 border border-[#8B7BFF]/30 rounded-xl p-2 text-[11px] text-[#8B7BFF]">
                        ★ Sample STAR Score: 94/100 (Ownership &amp; Frugality)
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pager Dots — keyboard accessible, labelled */}
        <div className="mt-12 flex items-center justify-center gap-2" role="tablist" aria-label="Feature slides">
          {FEATURE_CARDS.map((card, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Show feature: ${card.title}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                activeIndex === index
                  ? 'w-8 bg-white shadow-[0_0_8px_white]'
                  : 'w-4 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
