import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../../config/apis";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Outlet } from "react-router-dom";

export function Layout() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const { mutate } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logout success",
      })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate("/auth")
    },
    onError: (err) => toast({
      title: "Error",
      description: err.message,
      variant: "destructive",
    })
  })

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <main id="main-content" className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b bg-card flex items-center justify-between px-3 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-7 w-7" />
              <h1 className="text-[1.0769rem] font-semibold text-foreground">
                Admin Portal
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-[28px] w-[28px]"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" size="icon" className="h-[28px] w-[28px]" aria-label="Sign out" onClick={() => mutate()}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </header>
          <div className="flex-1 p-4 bg-background overflow-auto">
            <div className="max-w-[100vw]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}