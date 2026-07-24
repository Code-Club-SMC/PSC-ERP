import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ActivityNotificationItem,
  deleteActivityNotifications,
  getActivityNotifications,
  markActivityNotificationRead,
  markAllActivityNotificationsRead,
} from "../../config/apis";

function formatWhen(value: string) {
  return value ? new Date(value).toLocaleString("en-PK") : "";
}

export default function ActivityNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [from, setFrom] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["activityNotifications", "page", from, to],
    queryFn: () => getActivityNotifications({ from, to, limit: 200 }),
  });

  const rows = data?.data || [];
  const unreadCount = data?.unreadCount || 0;
  const allVisibleSelected = useMemo(() => rows.length > 0 && rows.every((row) => selected.includes(row.id)), [rows, selected]);

  const markReadMutation = useMutation({
    mutationFn: markActivityNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activityNotifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllActivityNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activityNotifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivityNotifications,
    onSuccess: () => {
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["activityNotifications"] });
    },
  });

  const toggleAll = () => {
    setSelected(allVisibleSelected ? [] : rows.map((row) => row.id));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const openNotification = async (item: ActivityNotificationItem) => {
    if (!item.isRead) await markReadMutation.mutateAsync(item.id);
    if (item.deepLink) navigate(item.deepLink);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            My Activity Notifications
          </h1>
          <p className="text-muted-foreground">Only your own module-based activity notifications are shown here.</p>
        </div>
        {unreadCount > 0 && <Badge className="w-fit bg-red-600 text-white">{unreadCount} unread</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            </div>
            <Button variant="outline" onClick={() => markAllMutation.mutate()} disabled={!unreadCount || markAllMutation.isPending}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
            </Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(selected)} disabled={!selected.length || deleteMutation.isPending}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete selected
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading notifications...</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No notifications found</TableCell></TableRow>
              ) : rows.map((item) => (
                <TableRow key={item.id} className={!item.isRead ? "bg-amber-50/60" : undefined}>
                  <TableCell><Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggleOne(item.id)} /></TableCell>
                  <TableCell>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.message}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{item.module}</Badge></TableCell>
                  <TableCell>{formatWhen(item.createdAt)}</TableCell>
                  <TableCell>{item.isRead ? <Badge variant="outline">Read</Badge> : <Badge className="bg-red-600 text-white">Unread</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openNotification(item)}>
                      <ExternalLink className="mr-2 h-4 w-4" /> Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
