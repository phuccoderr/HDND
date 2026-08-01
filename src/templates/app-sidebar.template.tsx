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
import {
  AlarmClockCheck,
  CalendarSync,
  ChevronRight,
  User,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

export interface SidebarSubItem {
  title: string;
  url: string;
}

export interface SidebarItem {
  title: string;
  icon?: LucideIcon;
  tooltip?: string;
  url?: string;
  isActive?: boolean;
  items?: SidebarSubItem[];
}

export interface SidebarGroupConfig {
  title: string;
  items: SidebarItem[];
}

// 2. Mảng dữ liệu được gán type
export const sidebarNavItems: SidebarGroupConfig[] = [
  {
    title: "Lịch phân công",
    items: [
      {
        title: "Lịch trực",
        icon: CalendarSync,
        tooltip: "lịch trực",
        isActive: true,
        items: [
          {
            title: "Tổng hợp",
            url: "/",
          },
          // {
          //   title: "Ca trực",
          //   url: "works",
          // },
        ],
      },
    ],
  },
  {
    title: "Thành viên",
    items: [
      {
        title: "Thành viên",
        url: "/users",
        icon: User,
        tooltip: "Thành viên",
      },
    ],
  },
  {
    title: "Tệp tin",
    items: [
      {
        title: "Chấm công định lượng",
        url: "/timekeeping",
        icon: AlarmClockCheck,
        tooltip: "Chấm công định lượng",
      },
    ],
  },
];

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
        {sidebarNavItems.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;

                // Trường hợp 1: Menu có sub-items (Collapsible)
                if (item.items && item.items.length > 0) {
                  return (
                    <Collapsible
                      key={itemIdx}
                      asChild
                      defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.tooltip}>
                            {Icon && <Icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <SidebarMenuSub>
                            {item.items.map((subItem, subIdx) => (
                              <SidebarMenuSubItem key={subIdx}>
                                <SidebarMenuSubButton asChild>
                                  <Link to={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Trường hợp 2: Menu đơn lẻ
                return (
                  <SidebarMenuItem key={itemIdx}>
                    <SidebarMenuButton asChild tooltip={item.tooltip}>
                      <Link to={item.url || "#"}>
                        {Icon && <Icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
