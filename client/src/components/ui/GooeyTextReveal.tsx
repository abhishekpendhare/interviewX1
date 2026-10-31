import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface GooeyTextRevealProps {
  text: string;
  badge?: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function GooeyTextReveal({
  text,
  badge,
  subtitle,
  className = "",
  align = 'center'
}: GooeyTextRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  const alignmentClass = 
    align === 'left' ? 'text-left items-start' :
    align === 'right' ? 'text-right items-end' :
    'text-center items-center';

  return (
    <div className={`flex flex-col ${alignmentClass} ${className} relative`}>
      {/* Optional SVG Gooey Filter definition */}
      <svg className="hidden">
        <defs>
          <filter id="gooey-text-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Optional Badge */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          {badge}
        </motion.div>
      )}

      {/* Main Gooey Headline */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-heading flex flex-wrap justify-center gap-x-2.5 gap-y-1">
        {words.map((word, wordIndex) => (
          <motion.span
            key={wordIndex}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 15, filter: 'blur(10px)' }
            }
            whileInView={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: 'blur(0px)' }
            }
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: wordIndex * 0.08,
              ease: [0.2, 0.65, 0.3, 0.9]
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl font-normal leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
