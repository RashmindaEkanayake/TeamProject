import React, { useEffect, useState } from 'react';
import { supplierService } from '../services/api';

interface Supplier {
  supplierId: number;
  companyName: string;
  companyEmail: string;
  contactNumber: string;
  fax: string;
  country: string;
  bankDetails: string;
  contactPerson: string;
  contactPersonNumber: string;
  personEmail: string;
}

const emptyForm = {
  companyName: '', companyEmail: '', contactNumber: '', fax: '',
  country: '', bankDetails: '', contactPerson: '', contactPersonNumber: '', personEmail: '',
};

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getAll();
      setSuppliers(res.data || []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (s: Supplier) => {
    setEditId(s.supplierId);
    setForm({
      companyName: s.companyName, companyEmail: s.companyEmail, contactNumber: s.contactNumber,
      fax: s.fax || '', country: s.country, bankDetails: s.bankDetails || '',
      contactPerson: s.contactPerson, contactPersonNumber: s.contactPersonNumber || '', personEmail: s.personEmail || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await supplierService.update(editId, form);
      } else {
        await supplierService.create(form);
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
    if (!window.confirm(`Delete supplier "${name}"?`)) return;
    try {
      await supplierService.delete(id);
      fetchData();
    } catch { alert('Delete failed.'); }
  };

  const filtered = suppliers.filter(s =>
    s.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const fields = [
    { label: 'Company Name', key: 'companyName', required: true, placeholder: 'e.g. Atlas Components' },
    { label: 'Company Email', key: 'companyEmail', required: true, type: 'email', placeholder: 'company@email.com' },
    { label: 'Contact Number', key: 'contactNumber', required: true, placeholder: '+1-000-000-0000' },
    { label: 'Country', key: 'country', required: true, placeholder: 'e.g. United States' },
    { label: 'Contact Person', key: 'contactPerson', required: true, placeholder: 'Full name' },
    { label: 'Contact Person Number', key: 'contactPersonNumber', required: false, placeholder: '+1-000-000-0000' },
    { label: 'Person Email', key: 'personEmail', required: false, type: 'email', placeholder: 'person@email.com' },
    { label: 'Fax', key: 'fax', required: false, placeholder: 'Fax number' },
    { label: 'Bank Details', key: 'bankDetails', required: false, placeholder: 'Optional bank info' },
  ] as const;

  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Supplier Management</h1>
            <p className="text-on-surface-muted text-sm mt-1">Track supplier relationships, lead times, and procurement channels.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[18px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..."
                className="pl-10 pr-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-muted w-52" />
            </div>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <span className="material-symbols-outlined text-[18px]">add_business</span>
              Add Supplier
            </button>
          </div>
        </div>
      </section>

      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-muted text-sm">Loading suppliers...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted">local_shipping</span>
            <p className="text-on-surface-muted text-sm">No suppliers found.</p>
            <button onClick={openAdd} className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors">Add First Supplier</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  {['Company', 'Country', 'Contact Person', 'Phone', 'Email', 'Actions'].map(h => (
                    <th key={h} className="py-4 px-5 text-on-surface-muted text-xs font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filtered.map(s => (
                  <tr key={s.supplierId} className="hover:bg-surface-elevated/60 transition-colors">
                    <td className="py-4 px-5 font-medium text-on-surface">{s.companyName}</td>
                    <td className="py-4 px-5 text-on-surface-muted">{s.country}</td>
                    <td className="py-4 px-5 text-on-surface-muted">{s.contactPerson}</td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">{s.contactNumber}</td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">{s.companyEmail}</td>
                    <td className="py-4 px-5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg text-on-surface-muted transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(s.supplierId, s.companyName)} className="p-1.5 hover:bg-error/10 hover:text-error rounded-lg text-on-surface-muted transition-colors">
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface-elevated border border-glass-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border flex-shrink-0">
              <h2 className="text-lg font-bold text-on-surface">{editId ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface rounded-lg text-on-surface-muted"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                {fields.map(f => (
                  <div key={f.key} className={f.key === 'bankDetails' ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1 uppercase tracking-wider">{f.label}{f.required && <span className="text-error ml-0.5">*</span>}</label>
                    <input
                      type={('type' in f ? f.type : 'text') as string}
                      required={f.required}
                      value={form[f.key]}
                      onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-muted"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving && <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />}
                  {saving ? 'Saving...' : (editId ? 'Update' : 'Add Supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
