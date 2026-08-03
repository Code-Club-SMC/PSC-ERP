import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Bell, CheckCheck, ChevronDown, ChevronUp, ExternalLink, Move, Trash2 } from "lucide-react";
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

const ACTIVITY_POSITION_KEY = "psc-activity-notification-position";
const FLOATING_MARGIN = 12;
const DEFAULT_FLOATING_WIDTH = 360;

type FloatingPosition = {
  x: number;
  y: number;
};

function getInitialPosition(): FloatingPosition {
  if (typeof window === "undefined") {
    return { x: FLOATING_MARGIN, y: FLOATING_MARGIN };
  }

  try {
    const stored = window.localStorage.getItem(ACTIVITY_POSITION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as FloatingPosition;
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors and use the default position.
  }

  return {
    x: Math.max(FLOATING_MARGIN, window.innerWidth - DEFAULT_FLOATING_WIDTH - 24),
    y: Math.max(FLOATING_MARGIN, window.innerHeight - 92),
  };
}

export function ActivityNotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [items, setItems] = useState<ActivityNotificationItem[]>([]);
  const [position, setPosition] = useState<FloatingPosition>(getInitialPosition);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

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

    return () => {
      socket.disconnect();
    };
  }, [currentUser, queryClient]);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const clampPosition = (next: FloatingPosition) => {
    if (typeof window === "undefined") return next;
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || DEFAULT_FLOATING_WIDTH;
    const height = rect?.height || 64;
    const maxX = Math.max(FLOATING_MARGIN, window.innerWidth - width - FLOATING_MARGIN);
    const maxY = Math.max(FLOATING_MARGIN, window.innerHeight - height - FLOATING_MARGIN);

    return {
      x: Math.min(Math.max(FLOATING_MARGIN, next.x), maxX),
      y: Math.min(Math.max(FLOATING_MARGIN, next.y), maxY),
    };
  };

  useEffect(() => {
    const handleResize = () => setPosition((prev) => clampPosition(prev));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPosition((prev) => clampPosition(prev));
  }, [open, items.length]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVITY_POSITION_KEY, JSON.stringify(position));
    } catch {
      // Position persistence is a convenience only.
    }
  }, [position]);

  const handleDragStart = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      drag.moved = true;
    }

    setPosition(clampPosition({ x: drag.startX + deltaX, y: drag.startY + deltaY }));
  };

  const handleDragEnd = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    window.setTimeout(() => {
      dragRef.current = null;
    }, 0);
  };

  const handleHeaderClick = () => {
    if (dragRef.current?.moved) return;
    setOpen((prev) => !prev);
  };

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
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
        }
        .psc-activity-shake { animation: psc-activity-shake 0.9s ease-in-out 2; }
      `}</style>
      <div
        ref={containerRef}
        className={cn(
          "fixed z-50 w-[min(88vw,360px)] rounded-xl border bg-background/95 shadow-xl backdrop-blur",
          shake && "psc-activity-shake"
        )}
        style={{ left: position.x, top: position.y }}
      >
        <button
          className="flex w-full cursor-grab touch-none items-center justify-between gap-2 px-3 py-2.5 text-left active:cursor-grabbing"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          onClick={handleHeaderClick}
          title="Drag to move. Click to expand or collapse."
        >
          <span className="flex min-w-0 items-center gap-2 font-semibold">
            <Move className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="relative rounded-full bg-amber-100 p-1.5 text-amber-700">
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />}
            </span>
            <span className="truncate text-sm">System Activity</span>
            {unreadCount > 0 && <Badge className="shrink-0 bg-red-600 px-1.5 text-white">{unreadCount} new</Badge>}
          </span>
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronUp className="h-4 w-4 shrink-0" />}
        </button>

        {open && (
          <div className="border-t">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/activity-notifications")}>View all</Button>
              <Button variant="ghost" size="sm" onClick={() => markAllMutation.mutate()} disabled={!unreadCount}>
                <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto px-2 pb-2">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No activity yet</div>
              ) : items.map((item) => (
                <div key={item.id} className={cn("mb-2 rounded-lg border p-2.5", !item.isRead ? "border-amber-300 bg-amber-50/70" : "bg-muted/30")}>
                  <div className="flex items-start justify-between gap-2">
                    <button className="min-w-0 flex-1 text-left" onClick={() => goToNotification(item)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{item.title}</span>
                        <Badge variant="outline">{item.module}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
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
