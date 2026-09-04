import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { NavBar } from './components/ui/NavBar';
import { Skeleton } from './components/ui/primitives';

// Lazy-load all routes for optimal bundle splitting
const Landing = lazy(() => import('./routes/Landing'));
const MapPage = lazy(() => import('./routes/MapPage'));
const ProductSearch = lazy(() => import('./routes/ProductSearch'));
const OrderIntake = lazy(() => import('./routes/OrderIntake'));
const Dashboard = lazy(() => import('./routes/Dashboard'));
const ColdStorage = lazy(() => import('./routes/ColdStorage'));
const Tracking = lazy(() => import('./routes/Tracking'));
const Vendors = lazy(() => import('./routes/Vendors'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col gap-4 max-w-screen-2xl mx-auto px-6 py-8">
      <Skeleton height="2rem" width="40%" />
      <Skeleton height="1rem" width="60%" />
      <div className="grid grid-cols-4 gap-4 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="120px" className="rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/map" element={<PageTransition><MapPage /></PageTransition>} />
          <Route path="/search" element={<PageTransition><ProductSearch /></PageTransition>} />
          <Route path="/order" element={<PageTransition><OrderIntake /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/cold-storage" element={<PageTransition><ColdStorage /></PageTransition>} />
          <Route path="/tracking" element={<PageTransition><Tracking /></PageTransition>} />
          <Route path="/vendors" element={<PageTransition><Vendors /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-base font-body relative overflow-x-hidden selection:bg-accent/20">
          {/* Subtle ambient radial gradients — fixed, behind everything */}
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 0,
              background:
                "radial-gradient(ellipse 55% 35% at 72% 18%, rgba(224,143,94,0.045) 0%, transparent 60%), radial-gradient(ellipse 40% 28% at 22% 72%, rgba(95,163,116,0.03) 0%, transparent 55%)",
            }}
          />
          <div className="relative" style={{ zIndex: 10 }}>
            <NavBar />
            <main>
              <AppRoutes />
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
