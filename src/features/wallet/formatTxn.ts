// src/features/wallet/formatTxn.ts
import type { WalletTransaction } from "@/api/wallet";

const TXN_LABELS: Record<WalletTransaction["type"], string> = {
  recharge: "Recharge",
  call_debit: "Call charge",
  call_credit: "Call earning",
  withdrawal: "Withdrawal",
  withdrawal_refund: "Withdrawal refund",
  promotion: "Bonus",
  admin_adjustment: "Adjustment",
};

export function labelForTxn(t: WalletTransaction): string {
  return TXN_LABELS[t.type] ?? "Transaction";
}

export function signedAmount(t: WalletTransaction): string {
  const sign = t.direction === "credit" ? "+" : "-";
  return `${sign}₹${t.amount}`;
}
