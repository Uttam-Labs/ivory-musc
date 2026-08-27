"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { formatMoney } from "@/lib/format";
import styles from "../../account.module.css";

export type OrderListItem = {
  id: string;
  encodedId: string;
  name: string;
  processedAt: string;
  canceledAt?: string | null;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
};

type Copy = {
  searchPlaceholder: string;
  filterAll: string;
  filterOpen: string;
  filterFulfilled: string;
  filterCancelled: string;
  noResultsHeading: string;
  noResultsText: string;
  viewDetailsLabel: string;
  previousLabel: string;
  nextLabel: string;
};

const PAGE_SIZE = 8;
const readable = (value: string) => value.replaceAll("_", " ").toLowerCase();

export function OrderList({ orders, copy }: { orders: OrderListItem[]; copy: Copy }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = !term || `${order.name} ${order.financialStatus} ${order.fulfillmentStatus}`.toLowerCase().includes(term);
      const matchesFilter = filter === "all" ||
        (filter === "cancelled" && Boolean(order.canceledAt)) ||
        (filter === "fulfilled" && !order.canceledAt && order.fulfillmentStatus === "FULFILLED") ||
        (filter === "open" && !order.canceledAt && order.fulfillmentStatus !== "FULFILLED");
      return matchesSearch && matchesFilter;
    });
  }, [filter, orders, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const changeFilter = (value: string) => { setFilter(value); setPage(1); };

  return (
    <div className={styles.ordersExperience}>
      <div className={styles.orderToolbar}>
        <label className={styles.orderSearch}>
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">{copy.searchPlaceholder}</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={copy.searchPlaceholder} />
        </label>
        <select value={filter} onChange={(event) => changeFilter(event.target.value)} aria-label="Filter orders">
          <option value="all">{copy.filterAll}</option>
          <option value="open">{copy.filterOpen}</option>
          <option value="fulfilled">{copy.filterFulfilled}</option>
          <option value="cancelled">{copy.filterCancelled}</option>
        </select>
      </div>
      {visible.length ? (
        <div className={styles.orderCards}>
          {visible.map((order) => {
            const fulfilment = order.canceledAt ? "Cancelled" : readable(order.fulfillmentStatus);
            return (
              <Link className={styles.orderCard} href={`/account/orders/${order.encodedId}`} key={order.id}>
                <div className={styles.orderCardLead}>
                  <strong>{order.name}</strong>
                  <span>{new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(order.processedAt))}</span>
                </div>
                <div className={styles.orderBadges}>
                  <span className={styles.orderBadge}>{readable(order.financialStatus)}</span>
                  <span className={`${styles.orderBadge} ${order.canceledAt ? styles.orderBadgeDanger : ""}`}>{fulfilment}</span>
                </div>
                <strong className={styles.orderTotal}>{formatMoney(order.totalPrice)}</strong>
                <span className={styles.orderView}>{copy.viewDetailsLabel}<ArrowRight size={17} aria-hidden="true" /></span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.orderNoResults}><h2>{copy.noResultsHeading}</h2><p>{copy.noResultsText}</p></div>
      )}
      {pages > 1 && (
        <nav className={styles.orderPagination} aria-label="Order pages">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} />{copy.previousLabel}</button>
          <span>{currentPage} / {pages}</span>
          <button type="button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>{copy.nextLabel}<ChevronRight size={17} /></button>
        </nav>
      )}
    </div>
  );
}
