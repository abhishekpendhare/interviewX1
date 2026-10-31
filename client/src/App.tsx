import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ScrollManager } from '@/components/layout/ScrollManager';
import { PageLoader } from '@/components/ui/PageLoader';
import { AuthProvider } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Gateway         = lazy(() => import('@/pages/Gateway'));
const CompilerArena   = lazy(() => import('@/pages/CompilerArena'));
const CompilerStudio  = lazy(() => import('@/pages/CompilerStudio'));
const FoundationsHub  = lazy(() => import('@/pages/FoundationsHub'));
const VoiceSimulator  = lazy(() => import('@/pages/VoiceSimulator'));
const NeuralAdvisor   = lazy(() => import('@/pages/NeuralAdvisor'));
const Dossier         = lazy(() => import('@/pages/Dossier'));
const Journal         = lazy(() => import('@/pages/Journal'));
const ArticleDetail   = lazy(() => import('@/pages/ArticleDetail'));
const AuthPage        = lazy(() => import('@/pages/AuthPage'));
const CareerPlanner   = lazy(() => import('@/pages/CareerPlanner'));
const AnalyticsDashboard = lazy(() => import('@/pages/AnalyticsDashboard'));
const LegalPolicy     = lazy(() => import('@/pages/LegalPolicy'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1 
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollManager />
        <AuthProvider>
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Home & Policy Routes */}
                <Route path="/"                 element={<Gateway />} />
                <Route path="/terms"            element={<LegalPolicy initialSection="terms" />} />
                <Route path="/privacy"          element={<LegalPolicy initialSection="privacy" />} />
                <Route path="/honor-code"       element={<LegalPolicy initialSection="honor-code" />} />

                {/* Auth Routes */}
                <Route path="/login"            element={<AuthPage />} />
                <Route path="/signup"           element={<AuthPage />} />
                <Route path="/forgot-password"  element={<AuthPage />} />
                <Route path="/reset-password"   element={<AuthPage />} />

                {/* Protected Product Routes */}
                <Route path="/planner"          element={<ProtectedRoute><CareerPlanner /></ProtectedRoute>} />
                <Route path="/analytics"        element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/terminal"         element={<Navigate to="/" replace />} />
                <Route path="/compiler"         element={<ProtectedRoute><CompilerArena /></ProtectedRoute>} />
                <Route path="/compiler/:slug"   element={<ProtectedRoute><CompilerStudio /></ProtectedRoute>} />
                <Route path="/foundations"      element={<ProtectedRoute><FoundationsHub /></ProtectedRoute>} />
                <Route path="/simulator"        element={<ProtectedRoute><VoiceSimulator /></ProtectedRoute>} />
                <Route path="/advisor"          element={<ProtectedRoute><NeuralAdvisor /></ProtectedRoute>} />
                <Route path="/dossier"          element={<ProtectedRoute><Dossier /></ProtectedRoute>} />
                <Route path="/articles"         element={<ProtectedRoute><Journal /></ProtectedRoute>} />
                <Route path="/articles/:slug"   element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
                <Route path="/journal"          element={<Navigate to="/articles" replace />} />
                <Route path="/journal/:slug"    element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />

                {/* Catch-all redirect to Gateway */}
                <Route path="*"                 element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
