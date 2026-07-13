import { createBrowserRouter } from "react-router-dom";
import Layout from "@/templates/layout.template";
import DashboardPage from "@/pages/dashboard";

const router = createBrowserRouter([
  // Public

  // Private
  {
    element: <Layout></Layout>,
    children: [
      {
        element: <DashboardPage></DashboardPage>,
        path: "/dashboard",
      },
    ],
  },
]);

export default router;
