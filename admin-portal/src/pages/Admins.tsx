import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Shield, ShieldCheck, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  userWho,
} from "../../config/apis";
import { Admin } from "@/types/admin.types";
import {
  PERMISSION_SECTIONS,
  PERMISSION_ACTIONS,
  ModuleName,
  PermissionAction,
  PermissionMatrix,
  emptyActionMap,
  hasModuleAction,
  isLegacyPermissionPayload,
  moduleSupportsAction,
  normalizePermissionMatrix,
  sanitizePermissionMatrix,
} from "@/utils/permissions";

const actionLabels: Record<PermissionAction, string> = {
  read: "Read",
  create: "Create",
  update: "Update",
  delete: "Delete",
};

export default function Admins() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<any>(null);
  const [deleteAdminData, setDeleteAdminData] = useState<any>(null);
  const [permissions, setPermissions] = useState<Record<string, PermissionMatrix>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: userWho,
  });

  const isCurrentSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const canCreateAdmins =
    isCurrentSuperAdmin || hasModuleAction(currentUser?.permissions, "Admins", "create");
  const canUpdateAdmins =
    isCurrentSuperAdmin || hasModuleAction(currentUser?.permissions, "Admins", "update");
  const canDeleteAdmins =
    isCurrentSuperAdmin || hasModuleAction(currentUser?.permissions, "Admins", "delete");

  // ✅ FETCH ADMINS
  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ["admins"],
    queryFn: getAdmins,
  });

  useEffect(() => {
    if (admins?.length) {
      const initial: Record<string, PermissionMatrix> = {};
      admins.forEach((admin) => {
        initial[admin.id] = normalizePermissionMatrix(admin.permissions);
      });
      setPermissions(initial);
    }
  }, [admins]);


  // ✅ CREATE ADMIN
  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      toast({
        title: "Admin added",
        description: "New admin created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsAddOpen(false);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  // ✅ UPDATE ADMIN
  const updateMutation = useMutation({
    mutationFn: updateAdmin,
    onSuccess: () => {
      toast({
        title: "Admin updated",
        description: "Admin details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setEditAdmin(null);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  // ✅ DELETE ADMIN
  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      toast({
        title: "Admin deleted",
        description: "Admin removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setDeleteAdminData(null);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const handlePermissionChange = (
    adminID: string,
    module: ModuleName,
    action: PermissionAction,
    checked: boolean
  ) => {
    if (!moduleSupportsAction(module, action)) return;
    setPermissions((prev) => {
      const current = prev[adminID] || normalizePermissionMatrix(null);
      const currentModule = current.modules[module] || emptyActionMap();
      return {
        ...prev,
        [adminID]: {
          version: 2,
          modules: {
            ...current.modules,
            [module]: {
              ...currentModule,
              [action]: checked,
            },
          },
        },
      };
    });
  };
  const handleSavePermissions = (admin: any) => {
    const selected = sanitizePermissionMatrix(permissions[admin.id]);
    updateMutation.mutate({ adminID: admin.id, updates: { permissions: selected } });
  };

  if (isLoading) return <p>Loading admins...</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Admins
          </h2>
          <p className="text-muted-foreground">
            Manage admin users and their permissions
          </p>
        </div>

        {/* Add Admin Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" rbacAllowed={canCreateAdmins}>
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <AddAdminForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsAddOpen(false)}
              canCreateSuperAdmin={isCurrentSuperAdmin}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Cards */}
      <div className="space-y-6">
        {admins?.map((admin: any) => (
          <Card key={admin.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{admin.name}</h3>
                    {admin.role === "SUPER_ADMIN" ? (
                      <Badge className="bg-primary text-primary-foreground">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canUpdateAdmins}
                    onClick={() => setEditAdmin(admin)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canDeleteAdmins}
                    onClick={() => setDeleteAdminData(admin)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Permissions */}
              {admin.role !== "SUPER_ADMIN" && (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-medium">Module Action Permissions</h4>
                    {isLegacyPermissionPayload(admin.permissions) && (
                      <Badge variant="outline">Legacy permissions inactive</Badge>
                    )}
                  </div>
                  <Accordion type="multiple" defaultValue={["Rooms"]} className="space-y-3">
                    {PERMISSION_SECTIONS.map((section) => (
                      <AccordionItem
                        key={section.title}
                        value={section.title}
                        className="rounded-lg border bg-card px-3"
                      >
                        <AccordionTrigger className="py-3 text-left hover:no-underline">
                          <div>
                            <div className="text-sm font-semibold">{section.title}</div>
                            {section.description && (
                              <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                                {section.description}
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="hidden md:grid grid-cols-[minmax(220px,1fr)_repeat(4,88px)] gap-3 border-b px-3 pb-2 text-xs font-medium text-muted-foreground">
                            <span>Area</span>
                            {PERMISSION_ACTIONS.map((action) => (
                              <span key={action} className="text-center">
                                {actionLabels[action]}
                              </span>
                            ))}
                          </div>
                          <div className="space-y-2 pt-2">
                            {section.modules.map(({ module, label, description }) => (
                              <div
                                key={module}
                                className="grid gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent/30 md:grid-cols-[minmax(220px,1fr)_repeat(4,88px)]"
                              >
                                <div>
                                  <div className="text-sm font-medium">{label || module}</div>
                                  {label && (
                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                      Permission key: {module}
                                    </div>
                                  )}
                                  {description && (
                                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                      {description}
                                    </div>
                                  )}
                                </div>
                                {PERMISSION_ACTIONS.map((action) => {
                                  const checkboxId = `${admin.id}-${module}-${action}`;
                                  const supported = moduleSupportsAction(module, action);
                                  const checked =
                                    supported && permissions[admin.id]?.modules?.[module]?.[action] === true;
                                  return (
                                    <div
                                      key={action}
                                      className="flex items-center justify-between gap-2 md:justify-center"
                                    >
                                      <Label
                                        htmlFor={checkboxId}
                                        className="text-xs text-muted-foreground md:hidden"
                                      >
                                        {actionLabels[action]}
                                      </Label>
                                      {supported ? (
                                        <Checkbox
                                          id={checkboxId}
                                          checked={checked}
                                          disabled={!canUpdateAdmins}
                                          onCheckedChange={(value) =>
                                            handlePermissionChange(
                                              admin.id,
                                              module,
                                              action,
                                              value === true
                                            )
                                          }
                                        />
                                      ) : (
                                        <span className="text-xs font-medium text-muted-foreground">N/A</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => handleSavePermissions(admin)}
                      disabled={!canUpdateAdmins || updateMutation.isPending}
                    >
                      {updateMutation.isPending
                        ? "Saving..."
                        : "Save Permissions"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          {editAdmin && (
            <EditAdminForm
              admin={editAdmin}
              onSubmit={(data: any) =>
                updateMutation.mutate({ adminID: editAdmin.id, ...data })
              }
              onCancel={() => setEditAdmin(null)}
              canManageSuperAdmin={isCurrentSuperAdmin}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteAdminData}
        onOpenChange={() => setDeleteAdminData(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <strong>{deleteAdminData?.name}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAdminData(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!canDeleteAdmins || deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteAdminData.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------- Helper Subcomponents ---------------------- */

function AddAdminForm({ onSubmit, onCancel, canCreateSuperAdmin }: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              {canCreateSuperAdmin && (
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)}>Add Admin</Button>
      </DialogFooter>
    </>
  );
}

function EditAdminForm({ admin, onSubmit, onCancel, canManageSuperAdmin }: any) {
  const [form, setForm] = useState({
    name: admin.name,
    email: admin.email,
    role: admin.role,
    password: "",
  });

  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
            value={form.role}
            disabled={!canManageSuperAdmin}
            onValueChange={(value) => setForm({ ...form, role: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              {canManageSuperAdmin && (
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Update Password?</Label>
          <Input
            type="password"
            value={form.password}
            placeholder="new password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)}>Update</Button>
      </DialogFooter>
    </>
  );
}
