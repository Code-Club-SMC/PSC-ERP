import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

interface BookingPaymentSummaryCardProps {
  paymentStatus: string;
  paidAmount: number;
  pendingAmount: number;
  paymentMode?: string;
  transactionId?: string;
  onRecordPayment: () => void;
  disabled?: boolean;
}

const getStatusClass = (status: string) => {
  if (status === "PAID") return "bg-green-50 text-green-700 border-green-200";
  if (status === "HALF_PAID")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "TO_BILL") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "ADVANCE_PAYMENT")
    return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

export function BookingPaymentSummaryCard({
  paymentStatus,
  paidAmount,
  pendingAmount,
  paymentMode,
  transactionId,
  onRecordPayment,
  disabled = false,
}: BookingPaymentSummaryCardProps) {
  return (
    <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Receipt className="h-4 w-4 text-blue-600" />
          Payment Summary
        </h4>
        <Badge variant="outline" className={getStatusClass(paymentStatus)}>
          {paymentStatus || "UNPAID"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground">Paid</div>
          <div className="font-semibold text-green-700">
            PKR {(Number(paidAmount) || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Pending</div>
          <div className="font-semibold text-red-700">
            PKR {(Number(pendingAmount) || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Mode</div>
          <div className="font-medium">{paymentMode || "CASH"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Transaction</div>
          <div className="font-medium truncate">{transactionId || "-"}</div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onRecordPayment}
        disabled={disabled}
      >
        Record Payment
      </Button>
    </div>
  );
}
