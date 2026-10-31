import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API = '/api/auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  targetTrack?: string;
  placementVelocityIndex?: number;
}

interface AuthCtx {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...((opts.headers as Record<string, string>) || {}) },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const hasSessionFlag = typeof window !== 'undefined' && localStorage.getItem('strata_has_session') === 'true';

  const { data, isLoading } = useQuery<{ user: AuthUser } | null>({
    queryKey: ['auth/me'],
    queryFn: async () => {
      try { 
        return await apiFetch(`${API}/me`); 
      } catch (err: any) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('strata_has_session');
        }
        return null; 
      }
    },
    enabled: hasSessionFlag,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['auth/me'] });

  // Re-check session on pageshow (including bfcache restores) and tab focus
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      const activeFlag = localStorage.getItem('strata_has_session') === 'true';
      if (activeFlag) {
        invalidate();
      } else {
        qc.setQueryData(['auth/me'], null);
      }
    };

    const handleFocus = () => {
      const activeFlag = localStorage.getItem('strata_has_session') === 'true';
      if (activeFlag) {
        invalidate();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, [qc]);

  const loginMut = useMutation({
    mutationFn: ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) =>
      apiFetch(`${API}/login`, { method: 'POST', body: JSON.stringify({ email, password, rememberMe }) }),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('strata_has_session', 'true');
      }
      invalidate();
    },
  });

  const signupMut = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      apiFetch(`${API}/signup`, { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('strata_has_session', 'true');
      }
      invalidate();
    },
  });

  const logoutMut = useMutation({
    mutationFn: () => apiFetch(`${API}/logout`, { method: 'POST' }),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('strata_has_session');
      }
      qc.setQueryData(['auth/me'], null);
    },
  });

  const ctx: AuthCtx = {
    user: hasSessionFlag ? (data?.user ?? null) : null,
    isLoading: hasSessionFlag && isLoading,
    login: async (email, password, rememberMe) => { await loginMut.mutateAsync({ email, password, rememberMe }); },
    signup: async (name, email, password) => { await signupMut.mutateAsync({ name, email, password }); },
    logout: async () => { await logoutMut.mutateAsync(); },
    forgotPassword: async (email) => {
      const r = await apiFetch(`${API}/forgot-password`, { method: 'POST', body: JSON.stringify({ email }) });
      return r.message as string;
    },
    resetPassword: async (token, newPassword) => {
      await apiFetch(`${API}/reset-password`, { method: 'POST', body: JSON.stringify({ token, newPassword }) });
    },
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
