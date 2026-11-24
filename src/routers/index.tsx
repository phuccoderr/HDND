import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/templates/layout.template";

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const UserPage = lazy(() => import("@/pages/users"));
const TimekeepingPage = lazy(() => import("@/pages/timekeeping"));
const LichKhttsPage = lazy(() => import("@/pages/khtts/lich-khtts"));
const KhttsPage = lazy(() => import("@/pages/khtts/khtts"));

const RouteFallback = () => (
  <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
    Đang tải...
  </div>
);

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

const router = createBrowserRouter([
  // Public

  // Private
  {
    element: <Layout></Layout>,
    children: [
      {
        element: (
          <LazyPage>
            <DashboardPage />
          </LazyPage>
        ),
        path: "/",
      },
      {
        element: (
          <LazyPage>
            <UserPage />
          </LazyPage>
        ),
        path: "/users",
      },
      {
        element: (
          <LazyPage>
            <TimekeepingPage />
          </LazyPage>
        ),
        path: "/timekeeping",
      },
      {
        element: (
          <LazyPage>
            <LichKhttsPage />
          </LazyPage>
        ),
        path: "/lich-khtts",
      },
      {
        element: (
          <LazyPage>
            <KhttsPage />
          </LazyPage>
        ),
        path: "/khtts",
      },
    ],
  },
]);

export default router;
