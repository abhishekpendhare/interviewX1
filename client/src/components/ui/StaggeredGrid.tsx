import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface StaggeredGridProps {
  children: ReactNode;
  className?: string;
  columns?: number;
  staggerDelay?: number;
}

export function StaggeredGrid({
  children,
  className = "",
  columns = 3,
  staggerDelay = 0.07
}: StaggeredGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: 0.05
      }
    }
  };

  const getColClass = () => {
    switch (columns) {
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={`grid ${getColClass()} gap-5 sm:gap-6 ${className}`}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 25, scale: 0.97 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { 
                  type: 'spring', 
                  stiffness: 350, 
                  damping: 26 
                } 
              }
            }}
            whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
            className="h-full"
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
