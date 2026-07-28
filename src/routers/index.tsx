import { createBrowserRouter } from "react-router-dom";
import Layout from "@/templates/layout.template";
import DashboardPage from "@/pages/dashboard";
import UserPage from "@/pages/users";

const router = createBrowserRouter([
  // Public

  // Private
  {
    element: <Layout></Layout>,
    children: [
      {
        element: <DashboardPage></DashboardPage>,
        path: "/",
      },
      {
        element: <UserPage />,
        path: "/users",
      },
      // {
      //   element: <WorkPage />,
      //   path: "/works",
      // },
    ],
  },
]);

export default router;
