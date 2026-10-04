import React, { useCallback, useEffect, useState } from 'react';
import { priceApprovalService, itemService, authService } from '../services/api';
import Modal from '../components/Modal';

interface PriceRow {
  priceId: number;
  itemName: string;
  itemId: number;
  retailPrice: number;
  importPrice: number;
  salePrice: number;
  status: string;
  requestedBy: string;
  startDate: string;
}

const PriceApproval: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ itemId: '', retailPrice: '', importPrice: '', salePrice: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [priceRes, itemRes] = await Promise.all([
        isAdmin ? priceApprovalService.getPending() : Promise.resolve({ data: [] }),
        itemService.getAll(),
      ]);
      const raw: any[] = priceRes.data || [];
      setPrices(raw.map((p: any) => ({
        priceId: p.priceId,
        itemName: p.item ? `${p.item.brand} ${p.item.model}` : 'Unknown',
        itemId: p.item?.itemId,
        retailPrice: p.retailPrice,
        importPrice: p.importPrice,
        salePrice: p.salePrice,
        status: p.status,
        requestedBy: p.requestedBy || '—',
        startDate: p.startDate ? new Date(p.startDate).toLocaleDateString() : '—',
      })));
      setItems(itemRes.data || []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await priceApprovalService.approve(id);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Reject this price change request?')) return;
    setActionLoading(id);
    try {
      await priceApprovalService.reject(id);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await priceApprovalService.requestPriceChange({
        itemId: Number(form.itemId),
        retailPrice: Number(form.retailPrice),
        importPrice: Number(form.importPrice),
        salePrice: Number(form.salePrice),
      });
      setShowModal(false);
      setForm({ itemId: '', retailPrice: '', importPrice: '', salePrice: '' });
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    APPROVED: 'bg-success/10 text-success border-success/20',
    REJECTED: 'bg-error/10 text-error border-error/20',
  };

  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Price Approval</h1>
            <p className="text-on-surface-muted text-sm mt-1">Review requested pricing changes and approve or reject them.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            New Request
          </button>
        </div>
      </section>

      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-muted text-sm">Loading price requests...</span>
          </div>
        ) : prices.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted">price_change</span>
            <p className="text-on-surface-muted text-sm">{isAdmin ? 'No pending price change requests.' : 'No price changes available.'}</p>
            <button onClick={() => setShowModal(true)} className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors">Submit a Request</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  {['Item', 'Retail Price', 'Import Price', 'Sale Price', 'Requested By', 'Date', 'Status', ...(isAdmin ? ['Actions'] : [])].map(h => (
                    <th key={h} className="py-4 px-5 text-on-surface-muted text-xs font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {prices.map(p => (
                  <tr key={p.priceId} className="hover:bg-surface-elevated/60 transition-colors">
                    <td className="py-4 px-5 font-medium text-on-surface">{p.itemName}</td>
                    <td className="py-4 px-5 text-on-surface">${p.retailPrice?.toFixed(2)}</td>
                    <td className="py-4 px-5 text-on-surface">${p.importPrice?.toFixed(2)}</td>
                    <td className="py-4 px-5 font-semibold text-primary">${p.salePrice?.toFixed(2)}</td>
                    <td className="py-4 px-5 text-on-surface-muted">{p.requestedBy}</td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">{p.startDate}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[p.status] || 'bg-surface-elevated text-on-surface-muted border-glass-border'}`}>
                        {p.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-5">
                        {p.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(p.priceId)}
                              disabled={actionLoading === p.priceId}
                              className="px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {actionLoading === p.priceId ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(p.priceId)}
                              disabled={actionLoading === p.priceId}
                              className="px-3 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 hover:bg-error/20 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-on-surface-muted text-xs">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Price Change Request"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">Item</label>
            <select required value={form.itemId} onChange={e => setForm(f => ({ ...f, itemId: e.target.value }))}
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all">
              <option value="">Select item...</option>
              {items.map((it: any) => (
                <option key={it.itemId} value={it.itemId}>{it.brand} {it.model} — {it.partNumber}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Retail Price', key: 'retailPrice' },
              { label: 'Import Price', key: 'importPrice' },
              { label: 'Sale Price', key: 'salePrice' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">{f.label}</label>
                <input type="number" required min={0} step="0.01"
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting && <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PriceApproval;
