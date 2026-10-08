import LoadError from "../components/LoadError";
import { errorMessage } from "../services/api";
import React, { useEffect, useState } from "react";
import { supplierService, itemService } from "../services/api";
import Modal from "../components/Modal";

interface SupplierItem {
  supplierItemId: number;
  itemId: number;
  brand?: string;
  model?: string;
  supplierPartNumber: string;
  supplierPrice: number;
  supplyQuantity: number;
}

interface Supplier {
  supplierId: number;
  companyName: string;
  companyEmail: string;
  contactNumber: string;
  fax?: string;
  country?: string;
  bankDetails?: string;
  contactPerson?: string;
  contactPersonNumber?: string;
  personEmail?: string;
  supplierItems?: SupplierItem[];
}

const emptyForm = {
  companyName: "",
  companyEmail: "",
  contactNumber: "",
  fax: "",
  country: "",
  bankDetails: "",
  contactPerson: "",
  contactPersonNumber: "",
  personEmail: "",
};

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Link item modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null,
  );
  const [linkForm, setLinkForm] = useState({
    itemId: 0,
    supplierPartNumber: "",
    supplierPrice: 0,
    supplyQuantity: 0,
  });
  const [linking, setLinking] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [supRes, itemRes] = await Promise.all([
        supplierService.getAll(),
        itemService.getAll(),
      ]);
      setSuppliers(supRes.data || []);
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

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditId(s.supplierId);
    setForm({
      companyName: s.companyName,
      companyEmail: s.companyEmail || "",
      contactNumber: s.contactNumber || "",
      fax: s.fax || "",
      country: s.country || "",
      bankDetails: s.bankDetails || "",
      contactPerson: s.contactPerson || "",
      contactPersonNumber: s.contactPersonNumber || "",
      personEmail: s.personEmail || "",
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
      alert(err?.response?.data?.message || "Failed to save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return;
    try {
      await supplierService.delete(id);
      fetchData();
    } catch {
      alert("Delete failed.");
    }
  };

  const openLinkItem = (supplierId: number) => {
    setSelectedSupplierId(supplierId);
    const firstItem = items[0];
    setLinkForm({
      itemId: firstItem?.itemId || 0,
      supplierPartNumber: firstItem?.partNumber || "",
      supplierPrice: 0,
      supplyQuantity: 0,
    });
    setShowLinkModal(true);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) return;
    setLinking(true);
    try {
      await supplierService.linkItem(selectedSupplierId, linkForm);
      setShowLinkModal(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to link item.");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (supplierId: number, itemId: number) => {
    if (!window.confirm("Remove this item from supplier catalog?")) return;
    try {
      await supplierService.unlinkItem(supplierId, itemId);
      fetchData();
    } catch {
      alert("Unlink failed.");
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson &&
        s.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
      (s.country && s.country.toLowerCase().includes(search.toLowerCase())),
  );

  if (error) return <LoadError message={error} retry={fetchData} />;
  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              Supplier Directory
            </h1>
            <p className="text-on-surface-muted text-sm mt-1">
              Manage vendor agreements, catalog pricing, and procurement
              channels.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[18px]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suppliers..."
                className="pl-10 pr-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-muted w-52"
              />
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_business
              </span>
              Add Supplier
            </button>
          </div>
        </div>
      </section>

      {/* Suppliers List */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-muted text-sm">
              Loading suppliers...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted">
              local_shipping
            </span>
            <p className="text-on-surface-muted text-sm">No suppliers found.</p>
            <button
              onClick={openAdd}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Add First Supplier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  {[
                    "Company",
                    "Contact Person",
                    "Phone / Email",
                    "Country",
                    "Catalog Items",
                    "Actions",
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
                {filtered.map((s) => (
                  <tr
                    key={s.supplierId}
                    className="hover:bg-surface-elevated/60 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <p className="font-medium text-on-surface">
                        {s.companyName}
                      </p>
                      <p className="text-xs text-on-surface-muted">
                        {s.bankDetails || "—"}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">
                      <p className="text-on-surface font-medium">
                        {s.contactPerson || "—"}
                      </p>
                      <p className="text-xs text-on-surface-muted">
                        {s.contactPersonNumber || ""}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">
                      <p>{s.contactNumber}</p>
                      <p className="text-xs text-on-surface-muted">
                        {s.companyEmail || "—"}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-on-surface-muted text-sm">
                      {s.country || "—"}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-semibold">
                          {(s.supplierItems || []).length} items
                        </span>
                        <button
                          onClick={() => openLinkItem(s.supplierId)}
                          className="text-xs text-primary hover:underline flex items-center gap-0.5"
                          title="Link new catalog item"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            add_link
                          </span>
                          Link
                        </button>
                      </div>
                      {/* Sub-table of linked items */}
                      {(s.supplierItems || []).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {s.supplierItems?.slice(0, 3).map((item) => (
                            <div
                              key={item.supplierItemId}
                              className="flex items-center justify-between text-[11px] text-on-surface-muted bg-surface/60 px-2 py-1 rounded-lg"
                            >
                              <span>
                                {item.brand} {item.model} ($
                                {item.supplierPrice?.toFixed(2)})
                              </span>
                              <button
                                onClick={() =>
                                  handleUnlink(s.supplierId, item.itemId)
                                }
                                className="text-error hover:text-error/80"
                                title="Unlink item"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  close
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg text-on-surface-muted transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(s.supplierId, s.companyName)
                          }
                          className="p-1.5 hover:bg-error/10 hover:text-error rounded-lg text-on-surface-muted transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
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

      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Edit Supplier" : "Add New Supplier"}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                Company Name
              </label>
              <input
                required
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                placeholder="e.g. Global Tech Supplies"
                className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                Company Email
              </label>
              <input
                type="email"
                value={form.companyEmail}
                onChange={(e) =>
                  setForm({ ...form, companyEmail: e.target.value })
                }
                placeholder="info@supplier.com"
                className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                Contact Number
              </label>
              <input
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
                placeholder="+1-800-555-0199"
                className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                Country
              </label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. United States"
                className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                Contact Person
              </label>
              <input
                value={form.contactPerson}
                onChange={(e) =>
                  setForm({ ...form, contactPerson: e.target.value })
                }
                placeholder="Robert Smith"
                className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                Bank Details
              </label>
              <input
                value={form.bankDetails}
                onChange={(e) =>
                  setForm({ ...form, bankDetails: e.target.value })
                }
                placeholder="Chase Bank, Acct: 1234..."
                className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
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
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
              )}
              {saving
                ? "Saving..."
                : editId
                  ? "Update Supplier"
                  : "Add Supplier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Link Item Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Link Catalog Item to Supplier"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleLinkSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Item
            </label>
            <select
              required
              value={linkForm.itemId}
              onChange={(e) =>
                setLinkForm({ ...linkForm, itemId: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {items.map((i) => (
                <option key={i.itemId} value={i.itemId}>
                  {i.brand} {i.model} ({i.partNumber})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Supplier Part Number
            </label>
            <input
              required
              value={linkForm.supplierPartNumber}
              onChange={(e) =>
                setLinkForm({ ...linkForm, supplierPartNumber: e.target.value })
              }
              placeholder="e.g. SUPP-ITEM-001"
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Supplier Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={linkForm.supplierPrice}
              onChange={(e) =>
                setLinkForm({
                  ...linkForm,
                  supplierPrice: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={linking}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {linking && (
                <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
              )}
              {linking ? "Linking..." : "Confirm Link"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
