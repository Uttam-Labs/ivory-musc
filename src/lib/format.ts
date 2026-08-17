import type { Money } from "@/lib/shopify/types";
export function formatMoney(money: Money) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: money.currencyCode }).format(Number(money.amount));
}
