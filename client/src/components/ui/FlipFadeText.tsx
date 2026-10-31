import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface FlipFadeTextProps {
  phrases?: string[];
  intervalMs?: number;
  className?: string;
}

const DEFAULT_PHRASES = [
  "Master Concurrency & Systems.",
  "Conquer 3,500+ Live DSA Problems.",
  "Pass Autonomous Staff SDE Bar Raisers.",
  "Nail Enterprise Spring Boot & Microservices.",
  "Land Tier-1 Product Engineering Roles."
];

export function FlipFadeText({
  phrases = DEFAULT_PHRASES,
  intervalMs = 3200,
  className = ""
}: FlipFadeTextProps) {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % phrases.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [phrases.length, intervalMs]);

  const currentPhrase = phrases[index];

  return (
    <div className={`relative inline-block h-[1.3em] overflow-hidden align-top ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentPhrase}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 35, rotateX: -65, filter: 'blur(6px)' }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -35, rotateX: 65, filter: 'blur(6px)' }
          }
          transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="inline-block whitespace-nowrap bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent font-extrabold"
          style={{ transformOrigin: '50% 50% -20px' }}
        >
          {currentPhrase}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
