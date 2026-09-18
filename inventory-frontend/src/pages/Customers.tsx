import React, { useEffect, useState } from 'react';
import { customerService } from '../services/api';
import Modal from '../components/Modal';

interface Customer {
  customerId: number;
  shopName: string;
  shopAddress: string;
  contactNumber: string;
  shopEmail: string;
  contactPersonName: string;
}

const emptyForm = { shopName: '', shopAddress: '', contactNumber: '', shopEmail: '', contactPersonName: '' };

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      setCustomers(res.data || []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (c: Customer) => {
    setEditId(c.customerId);
    setForm({ shopName: c.shopName, shopAddress: c.shopAddress, contactNumber: c.contactNumber, shopEmail: c.shopEmail || '', contactPersonName: c.contactPersonName });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await customerService.update(editId, form);
      } else {
        await customerService.create(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try {
      await customerService.delete(id);
      fetchData();
    } catch { alert('Delete failed.'); }
  };

  const filtered = customers.filter(c =>
    c.shopName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPersonName.toLowerCase().includes(search.toLowerCase())
  );

  const fields = [
    { label: 'Shop Name', key: 'shopName', placeholder: 'e.g. Bright Wave Co.' },
    { label: 'Contact Person', key: 'contactPersonName', placeholder: 'e.g. John Smith' },
    { label: 'Contact Number', key: 'contactNumber', placeholder: 'e.g. +1-800-000-0000' },
    { label: 'Shop Email', key: 'shopEmail', placeholder: 'e.g. shop@example.com', type: 'email' },
    { label: 'Shop Address', key: 'shopAddress', placeholder: 'e.g. 123 Main St, NY' },
  ] as const;

  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Customer Management</h1>
            <p className="text-on-surface-muted text-sm mt-1">Manage customer accounts, contacts, and commercial relationships.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[18px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
                className="pl-10 pr-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-muted w-52" />
            </div>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Customer
            </button>
          </div>
        </div>
      </section>

      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-muted text-sm">Loading customers...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted">group</span>
            <p className="text-on-surface-muted text-sm">No customers found.</p>
            <button onClick={openAdd} className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors">Add First Customer</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  {['Contact Person', 'Shop Name', 'Address', 'Phone', 'Email', 'Actions'].map(h => (
                    <th key={h} className="py-4 px-5 text-on-surface-muted text-xs font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filtered.map(c => (
                  <tr key={c.customerId} className="hover:bg-surface-elevated/60 transition-colors">
                    <td className="py-4 px-5 font-medium text-on-surface">{c.contactPersonName}</td>
                    <td className="py-4 px-5 text-on-surface-muted">{c.shopName}</td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">{c.shopAddress}</td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">{c.contactNumber}</td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">{c.shopEmail || '—'}</td>
                    <td className="py-4 px-5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg text-on-surface-muted transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(c.customerId, c.shopName)} className="p-1.5 hover:bg-error/10 hover:text-error rounded-lg text-on-surface-muted transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
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
        title={editId ? 'Edit Customer' : 'Add Customer'}
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input
                type={('type' in f ? f.type : 'text') as string}
                required={f.key !== 'shopEmail'}
                value={form[f.key]}
                onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-muted"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {saving && <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />}
              {saving ? 'Saving...' : (editId ? 'Update' : 'Add Customer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
