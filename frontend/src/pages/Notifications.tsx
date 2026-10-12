import React, { useEffect, useState } from "react";
import {
  orderService,
  priceApprovalService,
  authService,
} from "../services/api";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type:
    | "ORDER_PENDING"
    | "ORDER_APPROVED"
    | "ORDER_REJECTED"
    | "PRICE_PENDING"
    | "PRICE_APPROVED"
    | "PRICE_REJECTED";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconBg: string;
  linkPath?: string;
}

const timeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "ORDERS" | "PRICING">(
    "ALL",
  );
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      return new Set(
        JSON.parse(
          localStorage.getItem(
            `atlas-read-${authService.getCurrentUser()?.id}`,
          ) || "[]",
        ),
      );
    } catch {
      return new Set();
    }
  });
  const navigate = useNavigate();

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const basePrefix = isAdmin ? "/admin" : "/sales";

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      const built: Notification[] = [];

      try {
        const ordersRes = await orderService.getAll();
        const orders: any[] = ordersRes.data || [];

        orders.forEach((order: any) => {
          const date = order.orderedDate || new Date().toISOString();
          if (order.orderStatus === "PENDING_APPROVAL") {
            built.push({
              id: `order-pending-${order.orderId}`,
              type: "ORDER_PENDING",
              title: "Order Awaiting Approval",
              message: `Order ${order.invoiceNum} from ${order.customer?.shopName || order.customer?.name || "Unknown"} is pending approval. Total: $${order.totalAmount?.toFixed(2) ?? "0.00"}.`,
              time: timeAgo(date),
              read: false,
              icon: "pending_actions",
              iconBg: "bg-amber-500/20 text-amber-400",
              linkPath: `${basePrefix}/orders`,
            });
          } else if (order.orderStatus === "APPROVED") {
            built.push({
              id: `order-approved-${order.orderId}`,
              type: "ORDER_APPROVED",
              title: "Order Approved",
              message: `Order ${order.invoiceNum} has been approved successfully.`,
              time: timeAgo(date),
              read: false,
              icon: "check_circle",
              iconBg: "bg-emerald-500/20 text-emerald-400",
              linkPath: `${basePrefix}/orders`,
            });
          } else if (order.orderStatus === "REJECTED") {
            built.push({
              id: `order-rejected-${order.orderId}`,
              type: "ORDER_REJECTED",
              title: "Order Rejected",
              message: `Order ${order.invoiceNum} was rejected and requires attention.`,
              time: timeAgo(date),
              read: false,
              icon: "cancel",
              iconBg: "bg-red-500/20 text-red-400",
              linkPath: `${basePrefix}/orders`,
            });
          }
        });
      } catch {
        setError("Unable to load order notifications. Refresh to retry.");
      }

      if (isAdmin) {
        try {
          const priceRes = await priceApprovalService.getPending();
          const prices: any[] = priceRes.data || [];
          prices.forEach((p: any) => {
            const date = p.startDate || new Date().toISOString();
            built.push({
              id: `price-${p.priceId}`,
              type: "PRICE_PENDING",
              title: "Price Change Request",
              message: `${p.requestedBy || "A user"} requested a price update for ${p.item?.brand ? `${p.item.brand} ${p.item.model}` : "an item"}: sale price → $${p.salePrice?.toFixed(2) ?? "?"}.`,
              time: timeAgo(date),
              read: false,
              icon: "price_change",
              iconBg: "bg-violet-500/20 text-violet-400",
              linkPath: `${basePrefix}/price-approvals`,
            });
          });
        } catch {
          setError("Unable to load price notifications. Refresh to retry.");
        }
      }

      setNotifications(built);
      setLoading(false);
    };

    fetchNotifications();
  }, [isAdmin, basePrefix]);

  useEffect(() => {
    localStorage.setItem(
      `atlas-read-${user?.id}`,
      JSON.stringify([...readIds]),
    );
  }, [readIds, user?.id]);
  const markRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.linkPath) navigate(n.linkPath);
  };

  const visible = notifications
    .map((n) => ({ ...n, read: readIds.has(n.id) || n.read }))
    .filter((n) => {
      if (filter === "UNREAD") return !n.read;
      if (filter === "ORDERS") return n.type.startsWith("ORDER");
      if (filter === "PRICING") return n.type.startsWith("PRICE");
      return true;
    });

  const unreadCount = notifications.filter(
    (n) => !readIds.has(n.id) && !n.read,
  ).length;

  const filters: { key: typeof filter; label: string; icon: string }[] = [
    { key: "ALL", label: "All", icon: "inbox" },
    {
      key: "UNREAD",
      label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
      icon: "mark_email_unread",
    },
    { key: "ORDERS", label: "Orders", icon: "shopping_cart" },
    ...(isAdmin
      ? [
          {
            key: "PRICING" as typeof filter,
            label: "Pricing",
            icon: "payments",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-xl animate-fade-in-up">
      {/* Header */}
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              Notification Center
            </h1>
            <p className="text-on-surface-muted text-sm mt-1">
              Real-time alerts for orders, approvals, and inventory events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-all"
              >
                <span className="material-symbols-outlined text-base">
                  done_all
                </span>
                Mark all as read
              </button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-elevated/60 rounded-xl border border-glass-border">
              <span className="material-symbols-outlined text-base text-on-surface-muted">
                notifications
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {notifications.length}
              </span>
              <span className="text-sm text-on-surface-muted">total</span>
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              filter === f.key
                ? "bg-primary/20 border-primary/40 text-on-surface shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                : "bg-surface-elevated/40 border-glass-border text-on-surface-muted hover:text-on-surface hover:bg-surface-elevated"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {f.icon}
            </span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-muted text-sm">
              Loading notifications...
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center border border-glass-border">
              <span className="material-symbols-outlined text-3xl text-on-surface-muted">
                {filter === "UNREAD" ? "done_all" : "notifications_off"}
              </span>
            </div>
            <p className="text-on-surface font-semibold text-lg">
              {filter === "UNREAD"
                ? "All caught up!"
                : "No notifications found"}
            </p>
            <p className="text-on-surface-muted text-sm">
              {filter === "UNREAD"
                ? "You have no unread notifications."
                : "There are no notifications matching this filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-glass-border">
            {visible.map((n, idx) => (
              <li
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex items-start gap-4 px-6 py-5 cursor-pointer transition-all duration-200 group
                  ${!n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-surface-elevated/60"}
                  ${idx === 0 ? "rounded-t-2xl" : ""}
                  ${idx === visible.length - 1 ? "rounded-b-2xl" : ""}
                `}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${n.iconBg} mt-0.5`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {n.icon}
                  </span>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${!n.read ? "text-on-surface" : "text-on-surface-muted"}`}
                    >
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-on-surface-muted">
                        {n.time}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-muted mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  {n.linkPath && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                      View details
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default Notifications;
