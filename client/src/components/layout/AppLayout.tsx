import React, { ReactNode, useState, useEffect } from 'react';
import { AISaasHeader } from './AISaasHeader';
import { AISaasFooter } from './AISaasFooter';
import { GlassDock } from '@/components/ui/GlassDock';
import { useAuth } from '@/lib/authContext';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('strata_theme');
    return saved !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('strata_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('strata_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <div className="min-h-screen bg-[#0B1020] text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#6D5CFF]/30 selection:text-white overflow-x-hidden">
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#6D5CFF] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} onFocus={(e) => { e.currentTarget.style.position = 'absolute'; e.currentTarget.style.left = '1rem'; e.currentTarget.style.top = '1rem'; }} onBlur={(e) => { e.currentTarget.style.left = '-9999px'; e.currentTarget.style.top = '-9999px'; }}>
        Skip to main content
      </a>
      
      {/* 1. AI SaaS Glass Navigation Bar */}
      <AISaasHeader isDark={isDark} onToggleTheme={toggleTheme} />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className={`flex-1 flex flex-col overflow-x-hidden ${user ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-16' : 'pb-0'}`}>
        {children}
      </main>

      {/* 2. AI SaaS Footer */}
      <AISaasFooter />

      {/* 3. Floating Glass Dock AI Assistant Launcher - ONLY when signed in */}
      {user && <GlassDock isDark={isDark} onToggleTheme={toggleTheme} />}
    </div>
  );
}
