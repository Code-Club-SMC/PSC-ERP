import { useRef, useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface BookingSearchFilters {
  membershipNo: string;
  bookingId: string;
  fromDate: string;
  toDate: string;
  checkIn?: string;
  checkOut?: string;
}

const getTodayDateInputValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

interface BookingSearchFilterProps {
  filters: BookingSearchFilters;
  onChange: (filters: BookingSearchFilters) => void;
  checkInLabel?: string;
  checkOutLabel?: string;
}

export function BookingSearchFilter({
  filters,
  onChange,
  checkInLabel = "Check-In Date",
  checkOutLabel = "Check-Out Date",
}: BookingSearchFilterProps) {
  // Local controlled state for text inputs so they stay in sync with Clear
  const [localMembership, setLocalMembership] = useState(filters.membershipNo);
  const [localBookingId, setLocalBookingId] = useState(filters.bookingId);

  // Keep local state in sync when parent clears filters
  useEffect(() => {
    setLocalMembership(filters.membershipNo);
  }, [filters.membershipNo]);
  useEffect(() => {
    setLocalBookingId(filters.bookingId);
  }, [filters.bookingId]);

  // Use a ref to always have the latest filters without stale closure
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const membershipTimerRef = useRef<NodeJS.Timeout>();
  const bookingIdTimerRef = useRef<NodeJS.Timeout>();

  const handleMembershipChange = useCallback(
    (value: string) => {
      setLocalMembership(value);
      if (membershipTimerRef.current) clearTimeout(membershipTimerRef.current);
      membershipTimerRef.current = setTimeout(() => {
        onChange({ ...filtersRef.current, membershipNo: value });
      }, 300);
    },
    [onChange]
  );

  const handleBookingIdChange = useCallback(
    (value: string) => {
      setLocalBookingId(value);
      if (bookingIdTimerRef.current) clearTimeout(bookingIdTimerRef.current);
      bookingIdTimerRef.current = setTimeout(() => {
        onChange({ ...filtersRef.current, bookingId: value });
      }, 300);
    },
    [onChange]
  );

  const hasAnyFilter =
    filters.membershipNo || filters.bookingId || filters.fromDate || filters.toDate;

  return (
    <div className="flex flex-wrap items-end gap-3 p-3 bg-muted/30 rounded-lg border mb-4">
      <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-full">
        <Search className="h-3 w-3" />
        Search & Filter
      </div>

      {/* Membership No */}
      <div className="space-y-1 min-w-[160px]">
        <Label className="text-xs">Membership #</Label>
        <Input
          className="h-8 text-xs"
          placeholder="e.g. 001"
          value={localMembership}
          onChange={(e) => handleMembershipChange(e.target.value)}
        />
      </div>

      {/* Booking ID */}
      <div className="space-y-1 min-w-[130px]">
        <Label className="text-xs">Booking ID</Label>
        <Input
          className="h-8 text-xs"
          placeholder="e.g. 123"
          value={localBookingId}
          onChange={(e) => handleBookingIdChange(e.target.value)}
        />
      </div>

      {/* From Date */}
      <div className="space-y-1 min-w-[160px]">
        <Label className="text-xs">{checkInLabel}</Label>
        <Input
          type="date"
          className="h-8 text-xs"
          value={filters.fromDate}
          onChange={(e) => onChange({ ...filtersRef.current, fromDate: e.target.value })}
        />
      </div>

      {/* To Date */}
      <div className="space-y-1 min-w-[160px]">
        <Label className="text-xs">{checkOutLabel}</Label>
        <Input
          type="date"
          className="h-8 text-xs"
          value={filters.toDate}
          onChange={(e) => onChange({ ...filtersRef.current, toDate: e.target.value })}
        />
      </div>

      {/* Clear */}
      {hasAnyFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-destructive"
          onClick={() =>
            onChange({ membershipNo: "", bookingId: "", fromDate: getTodayDateInputValue(), toDate: "" })
          }
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

/** Apply search filters to a flat bookings array. */
export function applyBookingSearchFilters<T extends Record<string, any>>(
  bookings: T[],
  filters: BookingSearchFilters
): T[] {
  let result = bookings;

  if (filters.membershipNo.trim()) {
    const q = filters.membershipNo.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.Membership_No?.toString().toLowerCase().includes(q) ||
        b.member?.Membership_No?.toString().toLowerCase().includes(q) ||
        b.membershipNo?.toString().toLowerCase().includes(q)
    );
  }

  if (filters.bookingId.trim()) {
    const q = filters.bookingId.trim();
    // Support exact match or partial match on numeric id
    result = result.filter((b) => b.id?.toString() === q || b.id?.toString().startsWith(q));
  }

  if (filters.fromDate || filters.toDate) {
    const fromTime = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`).getTime() : null;
    const toTime = filters.toDate ? new Date(`${filters.toDate}T23:59:59`).getTime() : null;
    result = result.filter((b) => {
      const startValue =
        b.checkIn ||
        b.bookingDate;
      const endValue =
        b.checkOut ||
        b.endDate ||
        b.bookingDate;
      const startTime = startValue ? new Date(startValue).getTime() : NaN;
      const endTime = endValue ? new Date(endValue).getTime() : startTime;
      if (Number.isNaN(startTime) || Number.isNaN(endTime)) return false;
      if (fromTime != null && endTime < fromTime) return false;
      if (toTime != null && startTime > toTime) return false;
      return true;
    });
  }

  return result;
}
