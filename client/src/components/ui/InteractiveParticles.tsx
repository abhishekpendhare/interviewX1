import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface InteractiveParticlesProps {
  className?: string;
  particleCount?: number;
  maxDistance?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

export function InteractiveParticles({
  className = "",
  particleCount = 45,
  maxDistance = 110
}: InteractiveParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let mouse = { x: -1000, y: -1000, radius: 120 };

    // Set canvas dimensions based on container or window
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Responsive particle count (fewer on small screens)
    const effectiveCount = canvas.width < 768 ? Math.min(20, particleCount) : particleCount;

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < effectiveCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 1,
        baseAlpha: Math.random() * 0.35 + 0.25
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // IntersectionObserver to freeze canvas animation when off-screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !shouldReduceMotion) {
        loop();
      }
    }, { threshold: 0.05 });
    observer.observe(canvas);

    // Main 60fps render loop
    const loop = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDarkMode = document.documentElement.classList.contains('dark');
      const pointColor = isDarkMode ? '99, 102, 241' : '79, 70, 229'; // Indigo
      const lineColor = isDarkMode ? '129, 140, 248' : '99, 102, 241';

      // 1. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!shouldReduceMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off bounds
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          // Mouse interaction (soft repulsion)
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * force * 1.5;
            p.y -= Math.sin(angle) * force * 1.5;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pointColor}, ${p.baseAlpha})`;
        ctx.fill();

        // 2. Draw proximity constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < maxDistance) {
            const alpha = (1 - dist2 / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      if (!shouldReduceMotion) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    // Initial render
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount, maxDistance, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
      tabIndex={-1}
      style={{ opacity: 0.85 }}
    />
  );
}
