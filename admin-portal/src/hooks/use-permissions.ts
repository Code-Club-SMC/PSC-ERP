import { useQuery } from "@tanstack/react-query";
import { userWho } from "../../config/apis";
import { hasModuleAction, ModuleName, PermissionAction } from "@/utils/permissions";

export function usePermissionAccess(moduleName: ModuleName) {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: userWho,
    retry: 1,
  });

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const can = (action: PermissionAction) =>
    isSuperAdmin || hasModuleAction(currentUser?.permissions, moduleName, action);

  return {
    currentUser,
    isLoading,
    isSuperAdmin,
    can,
    canRead: can("read"),
    canCreate: can("create"),
    canUpdate: can("update"),
    canDelete: can("delete"),
  };
}