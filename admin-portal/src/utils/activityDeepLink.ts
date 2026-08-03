export const ACTIVITY_HIGHLIGHT_CLASS =
  "bg-yellow-100/80 hover:bg-yellow-100 ring-2 ring-yellow-300/80";

export function getActivityTargetId(search: string) {
  const id = new URLSearchParams(search).get("id");
  return id && id.trim() ? id.trim() : "";
}

export function isActivityTarget(rowId: string | number | undefined | null, targetId: string) {
  return Boolean(targetId && rowId != null && rowId.toString() === targetId);
}

/**
 * Callback ref that scrolls the target row into view when it mounts.
 * Attach to the TableRow that matches the deep-link target ID.
 */
export function activityScrollRef(rowId: string | number | undefined | null, targetId: string) {
  return (node: HTMLElement | null) => {
    if (node && isActivityTarget(rowId, targetId)) {
      setTimeout(() => node.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    }
  };
}

export function getActivityBookingFilters<T extends {
  membershipNo?: string;
  bookingId?: string;
  checkIn?: string;
  checkOut?: string;
}>(search: string, currentFilters: T) {
  const targetId = getActivityTargetId(search);
  if (!targetId) return currentFilters;

  return {
    ...currentFilters,
    membershipNo: "",
    bookingId: targetId,
    checkIn: "",
    checkOut: "",
  };
}
