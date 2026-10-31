import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { PageLoader } from '@/components/ui/PageLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow, noarchive');

    return () => {
      if (metaRobots && location.pathname === '/') {
        metaRobots.setAttribute('content', 'index, follow');
      }
    };
  }, [location.pathname]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    const fullPath = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(fullPath)}`} replace />;
  }

  return <>{children}</>;
}
