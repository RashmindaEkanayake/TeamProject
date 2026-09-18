import React, { useEffect, useState } from 'react';
import { salesRepService } from '../services/api';
import Modal from '../components/Modal';

interface Customer {
  customerId: number;
  shopName: string;
  contactPersonName: string;
  contactNumber: string;
  shopEmail: string;
  shopAddress: string;
}

interface SalesRep {
  repId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  customers: Customer[];
  orderCount: number;
  totalOrderValue: number;
}

const emptyForm = { firstName: '', lastName: '', email: '', phoneNumber: '' };

const SalesRepManagement: React.FC = () => {
  const [reps, setReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editRep, setEditRep] = useState<SalesRep | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail drawer (view customers)
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<SalesRep | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReps = async () => {
    setLoading(true);
    try {
      const res = await salesRepService.getAll();
      setReps(res.data || []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReps(); }, []);

  const openAdd = () => {
    setEditRep(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (rep: SalesRep) => {
    setEditRep(rep);
    setForm({ firstName: rep.firstName, lastName: rep.lastName, email: rep.email, phoneNumber: rep.phoneNumber });
    setFormError(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editRep) {
        await salesRepService.update(editRep.repId, form);
      } else {
        await salesRepService.create(form);
      }
      setShowForm(false);
      fetchReps();
      if (selectedRep && editRep && selectedRep.repId === editRep.repId) {
        setSelectedRep(null);
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await salesRepService.delete(deleteTarget.repId);
      setDeleteTarget(null);
      if (selectedRep?.repId === deleteTarget.repId) setSelectedRep(null);
      fetchReps();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete rep.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredReps = reps.filter(r => {
    const q = search.toLowerCase();
    return (
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phoneNumber.includes(q)
    );
  });

  const totalOrders = reps.reduce((s, r) => s + r.orderCount, 0);
  const totalValue = reps.reduce((s, r) => s + r.totalOrderValue, 0);
  const totalCustomers = reps.reduce((s, r) => s + r.customers.length, 0);

  const avatarColor = (id: number) => {
    const colors = [
      'from-indigo-500 to-violet-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="space-y-xl animate-fade-in-up">

      {/* ── Header ── */}
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Sales Rep Management</h1>
            <p className="text-on-surface-muted text-sm mt-1">
              Manage your sales team, monitor performance, and track customer assignments.
            </p>
          </div>
          <button
            id="add-rep-btn"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.5)]"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Sales Rep
          </button>
        </div>
      </section>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reps', value: reps.length, icon: 'group', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Total Customers', value: totalCustomers, icon: 'store', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Total Orders', value: totalOrders, icon: 'shopping_cart', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Order Value', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'payments', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(k => (
          <div key={k.label} className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-on-surface-muted uppercase tracking-widest">{k.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.bg}`}>
                <span className={`material-symbols-outlined text-[20px] ${k.color}`}>{k.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-on-surface">{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Content: list + detail side panel ── */}
      <div className="flex gap-6">

        {/* Reps list */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedRep ? 'lg:w-[55%]' : 'w-full'}`}>
          {/* Search */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="w-full pl-11 pr-4 py-2.5 bg-surface-elevated/50 border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-muted"
            />
          </div>

          <div className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-on-surface-muted text-sm">Loading reps…</span>
              </div>
            ) : filteredReps.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <span className="material-symbols-outlined text-4xl text-on-surface-muted">person_search</span>
                <p className="text-on-surface-muted text-sm">{search ? 'No reps match your search.' : 'No sales reps added yet.'}</p>
              </div>
            ) : (
              <div className="divide-y divide-glass-border">
                {filteredReps.map(rep => {
                  const isSelected = selectedRep?.repId === rep.repId;
                  return (
                    <div
                      key={rep.repId}
                      onClick={() => setSelectedRep(isSelected ? null : rep)}
                      className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all group ${isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-surface-elevated/60 border-l-2 border-transparent'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColor(rep.repId)} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md`}>
                        {rep.firstName.charAt(0)}{rep.lastName.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface">{rep.firstName} {rep.lastName}</p>
                        <p className="text-xs text-on-surface-muted truncate">{rep.email}</p>
                      </div>

                      {/* Stats chips */}
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
                          <span className="material-symbols-outlined text-[13px]">store</span>
                          {rep.customers.length}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                          <span className="material-symbols-outlined text-[13px]">shopping_cart</span>
                          {rep.orderCount}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                          id={`edit-rep-${rep.repId}`}
                          onClick={() => openEdit(rep)}
                          title="Edit"
                          className="p-2 rounded-lg hover:bg-primary/10 text-on-surface-muted hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          id={`delete-rep-${rep.repId}`}
                          onClick={() => setDeleteTarget(rep)}
                          title="Remove"
                          className="p-2 rounded-lg hover:bg-error/10 text-on-surface-muted hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      <span className={`material-symbols-outlined text-[18px] text-on-surface-muted transition-transform flex-shrink-0 ${isSelected ? 'rotate-180 text-primary' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Detail panel (right side) ── */}
        {selectedRep && (
          <div className="hidden lg:flex flex-col w-[400px] flex-shrink-0 animate-fade-in-up">
            <div className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor(selectedRep.repId)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {selectedRep.firstName.charAt(0)}{selectedRep.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{selectedRep.firstName} {selectedRep.lastName}</h3>
                    <p className="text-xs text-on-surface-muted">{selectedRep.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRep(null)} className="p-2 hover:bg-surface rounded-lg text-on-surface-muted hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Contact */}
              <div className="px-6 py-4 border-b border-glass-border">
                <div className="flex items-center gap-2 text-sm text-on-surface-muted mb-1">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  <span>{selectedRep.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-muted">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span className="truncate">{selectedRep.email}</span>
                </div>
              </div>

              {/* Performance stats */}
              <div className="grid grid-cols-3 divide-x divide-glass-border border-b border-glass-border">
                {[
                  { label: 'Customers', value: selectedRep.customers.length, color: 'text-cyan-400' },
                  { label: 'Orders', value: selectedRep.orderCount, color: 'text-emerald-400' },
                  { label: 'Value', value: `$${(selectedRep.totalOrderValue / 1000).toFixed(1)}k`, color: 'text-amber-400' },
                ].map(s => (
                  <div key={s.label} className="px-4 py-3 text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-on-surface-muted uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Customer list */}
              <div className="flex-1 overflow-hidden">
                <div className="px-6 py-3 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-on-surface-muted uppercase tracking-widest">Assigned Customers</h4>
                  <span className="text-xs text-primary font-semibold">{selectedRep.customers.length}</span>
                </div>

                {selectedRep.customers.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2 px-6">
                    <span className="material-symbols-outlined text-3xl text-on-surface-muted">store</span>
                    <p className="text-sm text-on-surface-muted">No customers assigned yet.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-64 divide-y divide-glass-border">
                    {selectedRep.customers.map(c => (
                      <div key={c.customerId} className="px-6 py-3 hover:bg-surface-elevated/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-glass-border flex-shrink-0">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-muted">store</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate">{c.shopName}</p>
                            <p className="text-xs text-on-surface-muted truncate">{c.contactPersonName} · {c.contactNumber}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="px-6 py-4 border-t border-glass-border flex gap-3">
                <button
                  onClick={() => openEdit(selectedRep)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit Rep
                </button>
                <button
                  onClick={() => setDeleteTarget(selectedRep)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-error/10 text-error text-sm font-semibold border border-error/20 hover:bg-error/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile: selected rep customers (below list) ── */}
      {selectedRep && (
        <div className="lg:hidden glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden animate-fade-in-up">
          <div className="px-5 py-4 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(selectedRep.repId)} flex items-center justify-center text-white font-bold`}>
                {selectedRep.firstName.charAt(0)}{selectedRep.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">{selectedRep.firstName} {selectedRep.lastName}</h3>
                <p className="text-xs text-on-surface-muted">{selectedRep.customers.length} customers · {selectedRep.orderCount} orders</p>
              </div>
            </div>
            <button onClick={() => setSelectedRep(null)} className="p-1.5 rounded-lg hover:bg-surface text-on-surface-muted">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="divide-y divide-glass-border">
            {selectedRep.customers.length === 0 ? (
              <p className="text-on-surface-muted text-sm text-center py-8">No customers assigned.</p>
            ) : selectedRep.customers.map(c => (
              <div key={c.customerId} className="px-5 py-3">
                <p className="text-sm font-medium text-on-surface">{c.shopName}</p>
                <p className="text-xs text-on-surface-muted">{c.contactPersonName} · {c.contactNumber}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editRep ? 'Edit Sales Rep' : 'Add New Sales Rep'}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name', key: 'firstName', placeholder: 'John', icon: 'badge' },
              { label: 'Last Name', key: 'lastName', placeholder: 'Smith', icon: 'badge' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">{f.label}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[16px]">{f.icon}</span>
                  <input
                    required
                    type="text"
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          {[
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@company.com', icon: 'mail' },
            { label: 'Phone Number', key: 'phoneNumber', type: 'tel', placeholder: '+1 555 000 0000', icon: 'phone' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">{f.label}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[16px]">{f.icon}</span>
                <input
                  required
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {submitting ? 'Saving…' : (editRep ? 'Save Changes' : 'Add Rep')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Sales Rep"
        maxWidthClass="max-w-sm"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-error/8 border border-error/20">
            <div className="w-12 h-12 rounded-xl bg-error/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-error text-2xl">person_remove</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{deleteTarget?.firstName} {deleteTarget?.lastName}</p>
              <p className="text-xs text-on-surface-muted mt-0.5">{deleteTarget?.customers.length} customer(s) will be unassigned</p>
            </div>
          </div>
          <p className="text-sm text-on-surface-muted leading-relaxed">
            This will permanently remove the sales rep profile. Their assigned customers will become unassigned and can be re-assigned later.
          </p>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {deleting ? 'Removing…' : 'Remove Rep'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesRepManagement;
