import { SidebarProvider } from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "./app-sidebar.template";
import { Outlet } from "react-router-dom";
import Header from "./header.template";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Header />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
