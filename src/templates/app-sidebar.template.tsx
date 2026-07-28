import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/animate-ui/components/radix/sidebar";
import bo_cong_an_jpg from "@/assets/bo-cong-an-removebg-preview.png";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CalendarSync, ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="bg-muted">
      <SidebarHeader className="flex flex-row gap-2 items-center">
        <img
          src={bo_cong_an_jpg}
          alt="Photo"
          className="h-10 w-12  rounded-lg"
        />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Hội Đồng Nhân Dân</span>
          <span className="truncate text-xs">PK02 Mục Tiêu</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lịch phân công</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible asChild className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={"lịch trực"}>
                    <CalendarSync />
                    <span>Lịch trực</span>
                    <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link to={"/"}>
                          <span>Tổng hợp</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    {/* <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link to={"works"}>
                          <span>Ca trực</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem> */}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Thành viên</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/users">
                <SidebarMenuButton tooltip={"Thành viên"}>
                  <User />
                  <span>Thành viên</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
