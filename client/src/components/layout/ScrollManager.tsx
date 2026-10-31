import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Global Scroll Restoration & Position Manager for InterviewX
 * 
 * Central router-level controller addressing:
 * 1. Instant top scroll on forward / push / replace navigation (window & all shell containers)
 * 2. Keyed history restoration on browser Back / Forward (POP) navigation
 * 3. Sticky header offset handling for in-page #section links with reduced-motion support
 * 4. Late-rendering content stability (prevents jump down when React Query data arrives)
 * 5. Stuck scroll-lock release on route change
 * 6. Accessible focus management (preventScroll) and screen reader announcement
 */
export function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [announcement, setAnnouncement] = useState<string>('');

  const isRestoring = useRef<boolean>(false);

  // 1. Enforce manual scroll restoration so native browser auto-scroll doesn't fight the SPA
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Continuous scroll position tracking keyed by history entry
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoring.current) return;
      const pos = {
        x: window.scrollX || window.pageXOffset || 0,
        y: window.scrollY || window.pageYOffset || 0
      };
      const key = location.key || 'default';
      scrollPositions.current.set(key, pos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (!isRestoring.current) {
        const pos = {
          x: window.scrollX || window.pageXOffset || 0,
          y: window.scrollY || window.pageYOffset || 0
        };
        const key = location.key || 'default';
        if (pos.y > 0) {
          scrollPositions.current.set(key, pos);
        }
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.key]);

  // Handle in-page hashchange events directly
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const targetId = hash.replace(/^#/, '');
      const targetEl = document.getElementById(targetId) || document.querySelector(hash);
      if (targetEl) {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const targetY = Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - 70);
        window.scrollTo({
          top: targetY,
          behavior: prefersReduced ? ('instant' as ScrollBehavior) : 'smooth'
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. Central navigation reaction (useLayoutEffect runs before browser paint)
  useLayoutEffect(() => {
    // Unlock any leftover modal or drawer scroll lock on route change
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }

    const resetContainersToTop = () => {
      window.scrollTo({ left: 0, top: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const main = document.getElementById('main-content');
      if (main && main.scrollTop !== 0) {
        main.scrollTop = 0;
      }

      document.querySelectorAll<HTMLElement>('.overflow-y-auto, [data-scroll-container]').forEach(el => {
        if (el.scrollTop !== 0) {
          el.scrollTop = 0;
        }
      });
    };

    // A. POP NAVIGATION (Browser Back / Forward)
    if (navigationType === 'POP') {
      const key = location.key || 'default';
      const saved = scrollPositions.current.get(key);

      if (saved && saved.y > 0) {
        isRestoring.current = true;
        let attempts = 0;
        const maxAttempts = 60; // Allow up to ~1s for lazy components to render
        const restore = () => {
          const docHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
          );
          const maxScrollY = Math.max(0, docHeight - window.innerHeight);

          if (maxScrollY >= saved.y) {
            window.scrollTo({
              left: saved.x,
              top: saved.y,
              behavior: 'instant' as ScrollBehavior
            });
            setTimeout(() => { isRestoring.current = false; }, 50);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(restore, 16);
          } else {
            // Fallback to highest available scroll
            window.scrollTo({
              left: saved.x,
              top: maxScrollY,
              behavior: 'instant' as ScrollBehavior
            });
            setTimeout(() => { isRestoring.current = false; }, 50);
          }
        };
        restore();
      } else {
        resetContainersToTop();
      }
      return;
    }

    // B. IN-PAGE HASH NAVIGATION (#section)
    if (location.hash) {
      const targetId = location.hash.replace(/^#/, '');
      let attempts = 0;
      const maxAttempts = 20;

      const scrollToTarget = () => {
        const targetEl = document.getElementById(targetId) || document.querySelector(location.hash);
        if (targetEl) {
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const headerOffset = 90; // Fixed glass header buffer
          const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
          const targetY = Math.max(0, elementPosition - headerOffset);

          window.scrollTo({
            top: targetY,
            behavior: prefersReduced ? ('instant' as ScrollBehavior) : 'smooth'
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(scrollToTarget);
        }
      };

      requestAnimationFrame(scrollToTarget);
      return;
    }

    // C. PUSH / REPLACE NAVIGATION (New page via Link, Button, Dock, Footer, Logo)
    // Instantly reset before paint
    resetContainersToTop();

    // Guard against late data rendering or lazy Suspense chunk expansion:
    // Keep pinned to 0 during the immediate subsequent animation frames
    let pinFrames = 0;
    const pinToTop = () => {
      if (window.scrollY > 0) {
        resetContainersToTop();
      }
      pinFrames++;
      if (pinFrames < 4) {
        requestAnimationFrame(pinToTop);
      }
    };
    requestAnimationFrame(pinToTop);

    // Timeout safety checks for async React Query hydration
    const timer1 = setTimeout(resetContainersToTop, 50);
    const timer2 = setTimeout(resetContainersToTop, 150);

    // D. ACCESSIBILITY: Focus Main Heading & Announce to Screen Readers
    const a11yTimer = setTimeout(() => {
      const heading = document.querySelector<HTMLElement>('h1') || document.getElementById('main-content');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }

      const pageTitle = document.title.replace(/\s*[—|-]\s*InterviewX.*/i, '').trim() || 'page';
      setAnnouncement(`Navigated to ${pageTitle}`);
    }, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(a11yTimer);
    };
  }, [location.pathname, location.search, location.hash, navigationType]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}
    >
      {announcement}
    </div>
  );
}
