import LoadError from "../components/LoadError";
import { errorMessage } from "../services/api";
import React, { useEffect, useState } from "react";
import {
  priceApprovalService,
  itemService,
  authService,
} from "../services/api";
import Modal from "../components/Modal";

interface PriceRequest {
  priceId: number;
  item: {
    itemId: number;
    brand: string;
    model: string;
    partNumber: string;
  };
  retailPrice: number;
  importPrice: number;
  salePrice: number;
  startDate: string;
  status: string;
  requestedBy: string;
}

const PriceApproval: React.FC = () => {
  const isAdmin = authService.getCurrentUser()?.role === "ADMIN";
  const [requests, setRequests] = useState<PriceRequest[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // New Request Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    itemId: 0,
    retailPrice: 0,
    importPrice: 0,
    salePrice: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [reqRes, itemRes] = await Promise.all([
        isAdmin
          ? priceApprovalService.getPending()
          : priceApprovalService.getMine(),
        itemService.getAll(),
      ]);
      setRequests(reqRes.data || []);
      setItems(itemRes.data || []);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Confirm this price decision?")) return;
    setActionLoading(id);
    try {
      await priceApprovalService.approve(id);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Confirm this price decision?")) return;
    setActionLoading(id);
    try {
      await priceApprovalService.reject(id);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenNewRequest = () => {
    const firstItem = items[0];
    setForm({
      itemId: firstItem?.itemId || 0,
      retailPrice: 0,
      importPrice: 0,
      salePrice: 0,
    });
    setShowModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await priceApprovalService.requestPriceChange(form);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <LoadError message={error} retry={fetchData} />;
  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              {isAdmin ? "Price Approval Queue" : "My Price Requests"}
            </h1>
            <p className="text-on-surface-muted text-sm mt-1">
              Review and authorize proposed catalog and retail price
              adjustments.
            </p>
          </div>
          <button
            onClick={handleOpenNewRequest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Request Price Change
          </button>
        </div>
      </section>

      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-muted text-sm">
              Loading price requests...
            </span>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted">
              price_check
            </span>
            <p className="text-on-surface-muted text-sm">
              No price requests to display.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  {[
                    "Item",
                    "Requested By",
                    "Import Price",
                    "Sale Price",
                    "Retail Price",
                    "Date",
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
                {requests.map((r) => (
                  <tr
                    key={r.priceId}
                    className="hover:bg-surface-elevated/60 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <p className="font-medium text-on-surface">
                        {r.item?.brand} {r.item?.model}
                      </p>
                      <p className="text-xs text-on-surface-muted font-mono">
                        {r.item?.partNumber}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm font-medium">
                      {r.requestedBy || "System"}
                    </td>
                    <td className="py-4 px-5 font-mono text-sm text-on-surface">
                      ${r.importPrice?.toFixed(2)}
                    </td>
                    <td className="py-4 px-5 font-mono text-sm text-secondary font-semibold">
                      ${r.salePrice?.toFixed(2)}
                    </td>
                    <td className="py-4 px-5 font-mono text-sm text-primary font-semibold">
                      ${r.retailPrice?.toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-xs text-on-surface-muted">
                      {r.startDate?.split("T")[0]}
                    </td>
                    <td className="py-4 px-5">{r.status}</td>
                    {isAdmin && (
                      <td className="py-4 px-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(r.priceId)}
                            disabled={actionLoading === r.priceId}
                            className="px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionLoading === r.priceId ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(r.priceId)}
                            disabled={actionLoading === r.priceId}
                            className="px-3 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 hover:bg-error/20 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* New Price Request Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Submit Price Change Request"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Item
            </label>
            <select
              required
              value={form.itemId}
              onChange={(e) =>
                setForm({ ...form, itemId: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {items.map((it) => (
                <option key={it.itemId} value={it.itemId}>
                  {it.brand} {it.model} ({it.partNumber})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Import Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.importPrice}
              onChange={(e) =>
                setForm({ ...form, importPrice: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Sale Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.salePrice}
              onChange={(e) =>
                setForm({ ...form, salePrice: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Retail MSRP ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.retailPrice}
              onChange={(e) =>
                setForm({ ...form, retailPrice: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
              )}
              {submitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PriceApproval;
