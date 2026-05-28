import { lazy, Suspense } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';

const GOOGLE_CLIENT_ID = '857151489825-5v6iesseopqcjkdeprjh6gck9ung15gs.apps.googleusercontent.com';
import { Layout } from './components/Layout';

// ── Lazy page imports ────────────────────────────────────────────────────────

const ModeSelector = lazy(() =>
  import('./pages/fantasy/ModeSelector').then((m) => ({
    default: m.ModeSelector,
  })),
);

const FantasyLeaguePage = lazy(() =>
  import('./pages/FantasyLeaguePage').then((m) => ({
    default: m.FantasyLeaguePage,
  })),
);

const FantasyAdminPage = lazy(() =>
  import('./pages/FantasyAdminPage').then((m) => ({
    default: m.FantasyAdminPage,
  })),
);

const PlayerProfilePage = lazy(() =>
  import('./pages/fantasy/PlayerProfilePage').then((m) => ({
    default: m.PlayerProfilePage,
  })),
);

const LeagueDetail = lazy(() =>
  import('./pages/fantasy/LeagueDetail').then((m) => ({
    default: m.LeagueDetail,
  })),
);

// MobileDraftPage is rendered inside FantasyLeaguePage's draft tab for mobile
// viewports, so it does not need its own route. The /mobile-draft route
// redirects to /play.

// ── Loading fallback ─────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );
}

// ── Route tree ───────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function IndexPage() {
    return (
      <Suspense fallback={<PageLoader />}>
        <ModeSelector meta={null} onSelect={() => {
          // Navigate to the play page when a mode is selected from landing
          window.location.href = '/play';
        }} />
      </Suspense>
    );
  },
});

const playRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/play',
  component: function PlayPage() {
    return (
      <Suspense fallback={<PageLoader />}>
        <FantasyLeaguePage />
      </Suspense>
    );
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: function AdminPage() {
    return (
      <Suspense fallback={<PageLoader />}>
        <FantasyAdminPage />
      </Suspense>
    );
  },
});

const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/player',
  component: function PlayerPage() {
    // PlayerProfilePage reads playerId from window.location.search internally
    return (
      <Suspense fallback={<PageLoader />}>
        <PlayerProfilePage />
      </Suspense>
    );
  },
});

const leagueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/league/$leagueId',
  component: function LeaguePage() {
    // LeagueDetail receives leagueId as a prop; extract from URL path param
    const params = leagueRoute.useParams();
    const leagueId = Number(params.leagueId);
    return (
      <Suspense fallback={<PageLoader />}>
        <LeagueDetail
          leagueId={leagueId}
          onBack={() => window.history.back()}
          currentUserId={null}
        />
      </Suspense>
    );
  },
});

const mobileDraftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mobile-draft',
  component: function MobileDraftRedirect() {
    // MobileDraftPage requires draft state props from FantasyLeaguePage.
    // Redirect to the play page which handles mobile draft internally.
    window.location.replace('/play');
    return <PageLoader />;
  },
});

// ── Catch-all route ──────────────────────────────────────────────────────────

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: function NotFound() {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <p className="text-gray-500 text-sm mb-6">Page not found</p>
        <a
          href="/"
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-black"
          style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}
        >
          Back to Home
        </a>
      </div>
    );
  },
});

// ── Route tree assembly ──────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  playRoute,
  adminRoute,
  playerRoute,
  leagueRoute,
  mobileDraftRoute,
  notFoundRoute,
]);

// ── Router instance ──────────────────────────────────────────────────────────

export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ── Query client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── App component ────────────────────────────────────────────────────────────

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
