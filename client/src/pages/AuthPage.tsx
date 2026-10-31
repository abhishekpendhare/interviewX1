import GlassAuthCard from '@/components/auth/GlassAuthCard';
import { useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';

export function getSafeNextUrl(nextParam: string | null | undefined, defaultUrl = '/foundations'): string {
  if (!nextParam || typeof nextParam !== 'string') return defaultUrl;
  const trimmed = nextParam.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return defaultUrl;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultUrl;
  }
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') return defaultUrl;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return defaultUrl;
  }
}

export default function AuthPage() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();

  const nextParam = searchParams.get('next') || searchParams.get('redirect');
  const safeNext = getSafeNextUrl(nextParam, '/foundations');

  // If already logged in, redirect to dashboard or safe next
  if (!isLoading && user) {
    return <Navigate to={safeNext} replace />;
  }

  const mode =
    pathname.startsWith('/signup') ? 'signup'
    : pathname.startsWith('/forgot-password') ? 'forgot'
    : pathname.startsWith('/reset-password') ? 'reset'
    : 'login';

  const resetToken = searchParams.get('token') || '';
  return <GlassAuthCard key={`${mode}:${resetToken}`} initialMode={mode as 'login' | 'signup' | 'forgot' | 'reset'} />;
}
