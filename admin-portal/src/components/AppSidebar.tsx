import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import logo from "@/assets/psc_logo_gold.png";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BedDouble,
  Building2,
  Trees,
  Camera,
  Trophy,
  ChevronDown,
  Wallet,
  Building,
  CalendarDays,
  Bell,
  Lock,
  NotebookTabsIcon,
  Text,
  Utensils,
  MessageSquare,
  Search as SearchIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { userWho } from "../../config/apis";
import { canReadModule, ModuleName } from "@/utils/permissions";

const ROUTE_TO_PERMISSION_MAP: Record<string, ModuleName> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/members": "Members",
  "/accounts": "Accounts",
  "/admins": "Admins",
  "/admin-reservations": "Admin Reservations",
  "/rooms/types": "Room Types",
  "/rooms": "Rooms",
  "/bookings/rooms": "Room Bookings",
  "/halls": "Halls",
  "/bookings/halls": "Hall Bookings",
  "/lawns/categories": "Lawn Categories",
  "/lawns": "Lawns",
  "/bookings/lawns": "Lawn Bookings",
  "/photoshoot": "Photoshoot",
  "/bookings/photoshoot": "Photoshoot Bookings",
  "/sports": "Sports",
  "/affiliated-clubs": "Affiliated Clubs",
  "/notifications": "Notifications",
  "/calendar": "Calendar",
  "/contents": "Contents",
  "/bookings": "Bookings",
  "/messing": "Messing",
  "/feedback": "Feedback",
  "/search": "Search",
  "/reports/rooms": "Room Reports",
  "/reports/halls": "Hall Reports",
  "/reports/photoshoot": "Photoshoot Reports",
};

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Search", url: "/search", icon: SearchIcon },
  { title: "Members", url: "/members", icon: Users },
  { title: "Accounts", url: "/accounts", icon: Wallet },
  { title: "Admins", url: "/admins", icon: UserCog },
  { title: "Admin Reservations", url: "/admin-reservations", icon: CalendarDays },
  {
    title: "Rooms",
    icon: BedDouble,
    items: [
      { title: "Room Types", url: "/rooms/types" },
      { title: "Rooms", url: "/rooms" },
      { title: "Room Bookings", url: "/bookings/rooms" },
      { title: "Room Reports", url: "/reports/rooms" },
    ],
  },
  {
    title: "Halls",
    icon: Building2,
    items: [
      { title: "Manage Halls", url: "/halls" },
      { title: "Hall Bookings", url: "/bookings/halls" },
      { title: "Hall Reports", url: "/reports/halls" },
    ],
  },
  {
    title: "Lawns",
    icon: Trees,
    items: [
      { title: "Lawn Categories", url: "/lawns/categories" },
      { title: "Manage Lawns", url: "/lawns" },
      { title: "Lawn Bookings", url: "/bookings/lawns" },
    ],
  },
  {
    title: "Photoshoot",
    icon: Camera,
    items: [
      { title: "Manage Photoshoot", url: "/photoshoot" },
      { title: "Photoshoot Bookings", url: "/bookings/photoshoot" },
      { title: "Photoshoot Reports", url: "/reports/photoshoot" },
    ],
  },
  { title: "Messing", url: "/messing", icon: Utensils },
  { title: "Bookings", url: "/bookings", icon: NotebookTabsIcon },
  { title: "Sports", url: "/sports", icon: Trophy },
  { title: "Affiliated Clubs", url: "/affiliated-clubs", icon: Building },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Contents", url: "/contents", icon: Text },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: userWho,
    enabled: true
  });

  if (!currentUser) return null;

  const userRole = currentUser.role;
  const permissions = currentUser.permissions || [];

  const canAccessRoute = (route: string): boolean => {
    if (userRole === "SUPER_ADMIN") return true;
    const requiredPermission = ROUTE_TO_PERMISSION_MAP[route];
    return !!requiredPermission && canReadModule(permissions, requiredPermission);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground text-[0.8462rem] font-semibold px-2 py-3 mb-1 flex items-center justify-start">
            {open ? (
              <img src={logo} alt="Peshawar Services Club" className="h-9 w-auto" />
            ) : (
              <img src={logo} alt="PSC" className="h-6 w-auto" />
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {menuItems.map((item) => {
                if (item.items) {
                  const isActive = item.items.some(sub => location.pathname === sub.url);
                  return (
                    <Collapsible key={item.title} defaultOpen={isActive} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={`py-1.5 text-[0.7692rem] ${isActive ? "bg-sidebar-accent" : ""}`}
                          >
                            {item.icon && <item.icon className="h-3.5 w-3.5" aria-hidden="true" />}
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="mx-0 ml-6 space-y-1 border-l border-sidebar-border/25 py-1 pl-3 pr-0">
                            {item.items.map(subItem => {
                              const allowed = canAccessRoute(subItem.url);
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild className="h-8 rounded-md px-2">
                                    <NavLink
                                      to={allowed ? subItem.url : "#"}
                                      className={`flex w-full items-center justify-between text-[0.7692rem] ${allowed ? "hover:bg-sidebar-accent/50" : "cursor-not-allowed opacity-45 hover:bg-transparent"}`}
                                      activeClassName={
                                        allowed
                                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                          : ""
                                      }
                                      onClick={(e) => {
                                        if (!allowed) {
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      <span>{subItem.title}</span>
                                      {!allowed && <Lock className="h-3 w-3 ml-1.5" aria-label="No access" />}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const allowed = canAccessRoute(item.url!);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={allowed ? item.url! : "#"}
                        className={`hover:bg-sidebar-accent/50 py-1.5 flex items-center text-[0.7692rem] ${!allowed ? "opacity-50 cursor-not-allowed" : ""}`}
                        activeClassName={
                          allowed
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : ""
                        }
                        onClick={(e) => {
                          if (!allowed) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {item.icon && <item.icon className="h-3.5 w-3.5" aria-hidden="true" />}
                        <span>{item.title}</span>
                        {!allowed && <Lock className="h-3 w-3 ml-1.5" aria-label="No access" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
