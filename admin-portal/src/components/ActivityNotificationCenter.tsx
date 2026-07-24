import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Bell, CheckCheck, ChevronDown, ChevronUp, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ActivityNotificationItem,
  deleteActivityNotification,
  getActivityNotifications,
  markActivityNotificationRead,
  markAllActivityNotificationsRead,
  socket_base_url,
  userWho,
} from "../../config/apis";

function formatWhen(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityNotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [items, setItems] = useState<ActivityNotificationItem[]>([]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try { return await userWho(); } catch { return null; }
    },
    retry: false,
  });

  const { data } = useQuery({
    queryKey: ["activityNotifications", "floating"],
    queryFn: () => getActivityNotifications({ limit: 25 }),
    enabled: !!currentUser,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!data?.data) return;
    setItems(data.data);
    if (data.unreadCount > 0) {
      setShake(true);
      const timer = window.setTimeout(() => setShake(false), 1400);
      return () => window.clearTimeout(timer);
    }
  }, [data]);

  useEffect(() => {
    if (!currentUser) return;
    const socket: Socket = io(`${socket_base_url}/realtime`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("activity_notification", (notification: ActivityNotificationItem) => {
      setItems((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 25));
      setShake(true);
      queryClient.invalidateQueries({ queryKey: ["activityNotifications"] });
      window.setTimeout(() => setShake(false), 1400);
    });

    return () => socket.disconnect();
  }, [currentUser, queryClient]);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const markReadMutation = useMutation({
    mutationFn: markActivityNotificationRead,
    onSuccess: (_data, id) => {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, isRead: true } : item));
      queryClient.invalidateQueries({ queryKey: ["activityNotifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllActivityNotificationsRead,
    onSuccess: () => {
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      queryClient.invalidateQueries({ queryKey: ["activityNotifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivityNotification,
    onSuccess: (_data, id) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      queryClient.invalidateQueries({ queryKey: ["activityNotifications"] });
    },
  });

  if (!currentUser) return null;

  const goToNotification = async (item: ActivityNotificationItem) => {
    if (!item.isRead) await markReadMutation.mutateAsync(item.id);
    if (item.deepLink) navigate(item.deepLink);
  };

  return (
    <>
      <style>{`
        @keyframes psc-activity-shake {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          15% { transform: translateX(calc(-50% - 8px)); }
          30% { transform: translateX(calc(-50% + 8px)); }
          45% { transform: translateX(calc(-50% - 6px)); }
          60% { transform: translateX(calc(-50% + 6px)); }
          75% { transform: translateX(calc(-50% - 3px)); }
        }
        .psc-activity-shake { animation: psc-activity-shake 0.9s ease-in-out 2; }
      `}</style>
      <div className={cn(
        "fixed bottom-4 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border bg-background/95 shadow-2xl backdrop-blur",
        shake && "psc-activity-shake"
      )}>
        <button
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="flex items-center gap-2 font-semibold">
            <span className="relative rounded-full bg-amber-100 p-2 text-amber-700">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />}
            </span>
            System Activity
            {unreadCount > 0 && <Badge className="bg-red-600 text-white">{unreadCount} new</Badge>}
          </span>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        {open && (
          <div className="border-t">
            <div className="flex items-center justify-between px-4 py-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/activity-notifications")}>View all</Button>
              <Button variant="ghost" size="sm" onClick={() => markAllMutation.mutate()} disabled={!unreadCount}>
                <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto px-2 pb-2">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No activity yet</div>
              ) : items.map((item) => (
                <div key={item.id} className={cn("mb-2 rounded-xl border p-3", !item.isRead ? "border-amber-300 bg-amber-50/70" : "bg-muted/30")}>
                  <div className="flex items-start justify-between gap-2">
                    <button className="min-w-0 flex-1 text-left" onClick={() => goToNotification(item)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{item.title}</span>
                        <Badge variant="outline">{item.module}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatWhen(item.createdAt)}</p>
                    </button>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToNotification(item)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
