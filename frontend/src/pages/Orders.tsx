import Modal from "../components/Modal";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LoadError from "../components/LoadError";
import { cents } from "../services/csv";
import {
  salesRepService,
  errorMessage,
  orderService,
  customerService,
  itemService,
  inventoryService,
  authService,
} from "../services/api";

interface OrderRow {
  orderId: number;
  invoiceNum: string;
  customerName: string;
  customerId: number;
  status: string;
  totalAmount: number;
  orderedDate: string;
}

interface OrderItemLine {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_APPROVAL: { label: "Pending", color: "warning" },
  APPROVED: { label: "Approved", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  SHIPPED: { label: "Shipped", color: "info" },
  CANCELLED: { label: "Cancelled", color: "error" },
};

const Orders: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<any>(null);
  const viewOrder = async (id: number) => {
    try {
      setDetail((await orderService.getById(id)).data);
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [repId, setRepId] = useState("");
  const [reps, setReps] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [orderLines, setOrderLines] = useState<OrderItemLine[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [ordRes, custRes, itemRes, invRes, repsRes] = await Promise.all([
        orderService.getAll(),
        customerService.getAll(),
        itemService.getAll(),
        inventoryService.getAll(),
        isAdmin ? salesRepService.getAll() : Promise.resolve({ data: [] }),
      ]);
      const raw: any[] = ordRes.data || [];
      setOrders(
        raw.map((o: any) => ({
          orderId: o.orderId,
          invoiceNum: o.invoiceNum,
          customerName:
            o.customer?.shopName || o.customer?.contactPersonName || "Unknown",
          customerId: o.customer?.customerId,
          status: o.orderStatus,
          totalAmount: o.totalAmount,
          orderedDate: o.orderedDate,
        })),
      );
      setCustomers(custRes.data || []);
      setReps(repsRes.data || []);
      setItems(itemRes.data || []);
      setInventory(invRes.data || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addLine = () => {
    const firstItem = items[0];
    setOrderLines((lines) => [
      ...lines,
      {
        itemId: firstItem?.itemId || 0,
        itemName: firstItem?.model || "",
        quantity: 1,
        unitPrice: Number(firstItem?.salePrice || 0),
        discountAmount: 0,
      },
    ]);
  };

  const updateLine = (idx: number, key: keyof OrderItemLine, value: any) => {
    setOrderLines((lines) =>
      lines.map((l, i) => {
        if (i !== idx) return l;
        if (key === "itemId") {
          const found = items.find((it: any) => it.itemId === Number(value));
          return {
            ...l,
            itemId: Number(value),
            itemName: found ? `${found.brand} ${found.model}` : "",
            unitPrice: Number(found?.salePrice || 0),
          };
        }
        return {
          ...l,
          [key]:
            key === "quantity" ||
            key === "unitPrice" ||
            key === "discountAmount"
              ? Number(value)
              : value,
        };
      }),
    );
  };

  const removeLine = (idx: number) =>
    setOrderLines((lines) => lines.filter((_, i) => i !== idx));

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || orderLines.length === 0) return;
    setSubmitting(true);
    try {
      await orderService.submit({
        customerId: Number(customerId),
        ...(isAdmin ? { repId: Number(repId) } : {}),
        items: orderLines.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
          discountAmount: l.discountAmount,
        })),
      });
      setShowModal(false);
      setOrderLines([]);
      setCustomerId("");
      fetchAll();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm("Approve this order and deduct its stock?")) return;
    setActionLoading(id);
    try {
      await orderService.approve(id);
      fetchAll();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActionLoading(rejectId);
    try {
      await orderService.reject(rejectId, rejectRemarks);
      setRejectId(null);
      setRejectRemarks("");
      fetchAll();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const orderTotal =
    orderLines.reduce(
      (s, l) => s + (l.quantity * cents(l.unitPrice) - cents(l.discountAmount)),
      0,
    ) / 100;

  return (
    <div className="space-y-xl animate-fade-in-up">
      {error && <LoadError message={error} retry={fetchAll} />}
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              Order Management
            </h1>
            <p className="text-on-surface-muted text-sm mt-1">
              View, approve, and track order progress within one unified
              workspace.
            </p>
          </div>
          <button
            disabled={loading || !!error || !items.length}
            onClick={() => {
              setShowModal(true);
              if (orderLines.length === 0) addLine();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Order
          </button>
        </div>
      </section>

      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-muted text-sm">
              Loading orders...
            </span>
          </div>
        ) : error ? null : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted">
              shopping_cart
            </span>
            <p className="text-on-surface-muted text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  {[
                    "Invoice",
                    "Customer",
                    "Date",
                    "Total",
                    "Status",
                    ...(isAdmin ? ["Actions"] : []),
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-4 px-5 text-on-surface-muted text-xs font-semibold uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {orders.map((o) => {
                  const s = statusConfig[o.status] || {
                    label: o.status,
                    color: "info",
                  };
                  return (
                    <tr
                      key={o.orderId}
                      className="hover:bg-surface-elevated/60 transition-colors"
                    >
                      <td className="py-4 px-5 font-mono font-medium text-on-surface">
                        <button
                          className="text-primary hover:underline"
                          onClick={() => viewOrder(o.orderId)}
                        >
                          {o.invoiceNum}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-on-surface-muted">
                        {o.customerName}
                      </td>
                      <td className="py-4 px-5 text-on-surface-muted text-sm">
                        {o.orderedDate}
                      </td>
                      <td className="py-4 px-5 font-medium text-on-surface">
                        ${o.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                          ${s.color === "success" ? "bg-success/10 text-success border-success/20" : ""}
                          ${s.color === "warning" ? "bg-warning/10 text-warning border-warning/20" : ""}
                          ${s.color === "error" ? "bg-error/10 text-error border-error/20" : ""}
                          ${s.color === "info" ? "bg-primary/10 text-primary border-primary/20" : ""}
                        `}
                        >
                          {s.label}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-5">
                          {o.status === "PENDING_APPROVAL" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(o.orderId)}
                                disabled={actionLoading === o.orderId}
                                className="px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                {actionLoading === o.orderId
                                  ? "..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() => setRejectId(o.orderId)}
                                disabled={actionLoading === o.orderId}
                                className="px-3 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 hover:bg-error/20 text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-on-surface-muted text-xs">
                              —
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* New Order Modal */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-surface-elevated border border-glass-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border flex-shrink-0">
                <h2 className="text-lg font-bold text-on-surface">New Order</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-surface rounded-lg text-on-surface-muted hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form
                onSubmit={handleSubmitOrder}
                className="p-6 space-y-4 overflow-y-auto flex-1"
              >
                {isAdmin && (
                  <div>
                    <label className="block text-xs text-on-surface-muted mb-2">
                      Representative
                    </label>
                    <select
                      required
                      value={repId}
                      onChange={(e) => {
                        setRepId(e.target.value);
                        setCustomerId("");
                      }}
                      className="w-full p-3 bg-surface rounded-xl border border-glass-border"
                    >
                      <option value="">Select representative</option>
                      {reps
                        .filter((r) => r.status === "ACTIVE")
                        .map((r) => (
                          <option key={r.repId} value={r.repId}>
                            {r.firstName} {r.lastName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                    Customer
                  </label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select customer...</option>
                    {customers
                      .filter((c) => !isAdmin || String(c.repId) === repId)
                      .map((c: any) => (
                        <option key={c.customerId} value={c.customerId}>
                          {c.shopName} — {c.contactPersonName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider">
                      Order Items
                    </label>
                    <button
                      type="button"
                      onClick={addLine}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">
                        add
                      </span>
                      Add item
                    </button>
                  </div>
                  {orderLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 mb-2 items-center"
                    >
                      <div className="col-span-4">
                        <select
                          value={line.itemId}
                          onChange={(e) =>
                            updateLine(idx, "itemId", e.target.value)
                          }
                          className="w-full px-2 py-2 bg-surface border border-glass-border rounded-lg text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                        >
                          {items.map((it: any) => (
                            <option key={it.itemId} value={it.itemId}>
                              {it.brand} {it.model}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min={1}
                          step={1}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(idx, "quantity", e.target.value)
                          }
                          placeholder="Qty"
                          className="w-full px-2 py-2 bg-surface border border-glass-border rounded-lg text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unitPrice}
                          readOnly
                          title="Approved catalog price; final price is validated by the server"
                          placeholder="Unit Price"
                          className="w-full px-2 py-2 bg-surface border border-glass-border rounded-lg text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          max={line.unitPrice * line.quantity}
                          step="0.01"
                          value={line.discountAmount}
                          onChange={(e) =>
                            updateLine(idx, "discountAmount", e.target.value)
                          }
                          placeholder="Discount"
                          className="w-full px-2 py-2 bg-surface border border-glass-border rounded-lg text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-error hover:text-error/80"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            remove_circle
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {orderLines.length === 0 && (
                    <p className="text-on-surface-muted text-xs text-center py-3 border border-dashed border-glass-border rounded-xl">
                      Add at least one item
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                  <span className="text-sm font-semibold text-on-surface">
                    Total:{" "}
                    <span className="text-primary">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl bg-surface border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || orderLines.length === 0}
                      className="px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      {submitting && (
                        <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
                      )}
                      {submitting ? "Submitting..." : "Submit Order"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.invoiceNum || "Order details"}
        maxWidthClass="max-w-3xl"
      >
        <div className="p-6 space-y-4">
          <p>
            {detail?.customer?.shopName} · {detail?.orderStatus} ·
            Representative: {detail?.rep?.firstName} {detail?.rep?.lastName}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {[
                    "Product",
                    "Qty",
                    "Unit price",
                    "Line discount",
                    "Total",
                  ].map((h) => (
                    <th key={h} className="p-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail?.orderItems?.map((line: any) => (
                  <tr
                    key={line.orderItemId}
                    className="border-t border-glass-border"
                  >
                    <td className="p-2">
                      {line.item?.brand} {line.item?.model}
                    </td>
                    <td>{line.quantity}</td>
                    <td>{Number(line.unitPrice).toFixed(2)}</td>
                    <td>{Number(line.discountAmount).toFixed(2)}</td>
                    <td>{Number(line.totalPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-bold">
            Total: {Number(detail?.totalAmount || 0).toFixed(2)}
          </p>
          <p className="text-xs text-on-surface-muted">
            Approved catalog prices are captured when the order is submitted.
          </p>
        </div>
      </Modal>

      {/* Reject Modal */}
      {rejectId !== null &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setRejectId(null)}
          >
            <div
              className="bg-surface-elevated border border-glass-border rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border">
                <h2 className="text-lg font-bold text-on-surface">
                  Reject Order
                </h2>
                <button
                  onClick={() => setRejectId(null)}
                  className="p-2 hover:bg-surface rounded-lg text-on-surface-muted"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1.5">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-error transition-all placeholder:text-on-surface-muted resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setRejectId(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-error text-on-surface text-sm font-semibold hover:bg-error/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {actionLoading !== null && (
                      <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
                    )}
                    Confirm Reject
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Orders;
