import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScrollRevealLeftProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up';
  delay?: number; // In seconds
  staggerIndex?: number; // Stagger index for groups
  offset?: number; // In px, default 40
  duration?: number; // In seconds, default 0.7
  className?: string;
}

export const ScrollRevealLeft: React.FC<ScrollRevealLeftProps> = ({
  children,
  direction = 'left',
  delay = 0,
  staggerIndex,
  offset = 40,
  duration = 0.7,
  className = ''
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Compute stagger delay capped at 600ms (0.6s) as specified in prompt
  const calculatedDelay = staggerIndex !== undefined 
    ? Math.min((staggerIndex * 0.075), 0.6) + delay
    : delay;

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -offset, y: 0, opacity: 0 };
      case 'right':
        return { x: offset, y: 0, opacity: 0 };
      case 'up':
        return { x: 0, y: offset, opacity: 0 };
      default:
        return { x: -offset, y: 0, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration,
        delay: calculatedDelay,
        ease: [0.16, 1, 0.3, 1] // Porsche cinematic ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
