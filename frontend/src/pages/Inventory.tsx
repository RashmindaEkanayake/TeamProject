import LoadError from "../components/LoadError";
import React, { useEffect, useState, useRef } from "react";
import { itemService, inventoryService } from "../services/api";
import Modal from "../components/Modal";

interface StockRow {
  itemId: number;
  itemName: string;
  partNumber: string;
  brand: string;
  model: string;
  category: string;
  currentQuantity: number;
  minimumStockLevel: number;
}

interface ItemForm {
  brand: string;
  model: string;
  category: string;
  partNumber: string;
  description: string;
  quantity: number;
}

const emptyForm: ItemForm = {
  brand: "",
  model: "",
  category: "",
  partNumber: "",
  description: "",
  quantity: 0,
};

const Inventory: React.FC = () => {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOW" | "CRITICAL">("ALL");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inventoryService.getAll();
      const data: any[] = res.data || [];
      setRows(
        data.map((d: any) => ({
          itemId: d.item?.itemId,
          itemName: `${d.item?.brand} ${d.item?.model}`,
          partNumber: d.item?.partNumber,
          brand: d.item?.brand,
          model: d.item?.model,
          category: d.item?.category,
          currentQuantity: d.currentQuantity,
          minimumStockLevel: d.minimumStockLevel,
        })),
      );
    } catch {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilterMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getStatus = (row: StockRow) => {
    if (row.currentQuantity <= 0)
      return { label: "Out of Stock", color: "error" };
    if (row.currentQuantity <= row.minimumStockLevel * 0.5)
      return { label: "Critical", color: "error" };
    if (row.currentQuantity <= row.minimumStockLevel)
      return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const filtered = rows.filter((r) => {
    const matchSearch =
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.partNumber.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "LOW")
      return r.currentQuantity <= r.minimumStockLevel && r.currentQuantity > 0;
    if (filter === "CRITICAL")
      return (
        r.currentQuantity <= 0 || r.currentQuantity <= r.minimumStockLevel * 0.5
      );
    return true;
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };
  const openEdit = async (row: StockRow) => {
    let details: any;
    try {
      details = (await itemService.getById(row.itemId)).data;
    } catch {
      setError("Unable to load item details");
      return;
    }
    setEditId(row.itemId);
    setForm({
      brand: row.brand,
      model: row.model,
      category: row.category,
      partNumber: row.partNumber,
      description: details.description || "",
      quantity: row.currentQuantity,
    });
    setShowModal(true);
  };

  const adjustStock = async (row: StockRow) => {
    const raw = window.prompt(
      "Enter signed whole-number adjustment (e.g. 5 or -2). Use Goods Receiving for shipments.",
    );
    if (raw === null) return;
    const delta = Number(raw);
    if (!Number.isInteger(delta) || delta === 0) {
      setError("Enter a non-zero whole number");
      return;
    }
    try {
      await inventoryService.adjust(row.itemId, delta);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Adjustment failed");
    }
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const { quantity, ...metadata } = form;
        await itemService.update(editId, metadata);
      } else {
        await itemService.create(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Save failed. Check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await itemService.delete(id);
      fetchData();
    } catch {
      alert("Delete failed.");
    }
  };

  if (error) return <LoadError message={error} retry={fetchData} />;
  return (
    <div className="space-y-10 animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">
                Inventory Management
              </h1>
            </div>
            <p className="text-on-surface-muted text-sm max-w-2xl">
              Review stock levels and manage inventory adjustments.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-4 py-2 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  filter_list
                </span>
                {filter === "ALL"
                  ? "Filters"
                  : filter === "LOW"
                    ? "Low Stock"
                    : "Critical"}
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-surface-elevated border border-glass-border rounded-xl shadow-xl z-50 overflow-hidden">
                  {(["ALL", "LOW", "CRITICAL"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition-colors ${filter === f ? "text-primary font-semibold" : "text-on-surface"}`}
                    >
                      {f === "ALL"
                        ? "All Items"
                        : f === "LOW"
                          ? "Low Stock"
                          : "Critical Only"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-medium hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Item
            </button>
          </div>
        </div>
      </section>

      <section className="glass-panel bg-surface-elevated/40 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 relative z-10 gap-4">
          <div>
            <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-1">
              Global Catalog
            </p>
            <h2 className="text-xl font-bold text-on-surface">
              {loading ? "..." : `${filtered.length} Items`}
            </h2>
          </div>
          <div className="relative group w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted group-focus-within:text-on-surface transition-colors text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm text-on-surface outline-none placeholder:text-on-surface-muted"
              placeholder="Search by name or part number..."
            />
          </div>
        </div>

        <div className="overflow-x-auto relative z-10 rounded-xl border border-glass-border">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-on-surface-muted text-sm">
                Loading inventory...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-muted">
                inventory_2
              </span>
              <p className="text-on-surface-muted text-sm">No items found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  {[
                    "Item Name",
                    "Part Number",
                    "Category",
                    "Stock",
                    "Min Stock",
                    "Status",
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
                {filtered.map((row) => {
                  const status = getStatus(row);
                  return (
                    <tr
                      key={row.itemId}
                      className="hover:bg-surface-elevated/80 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-5 font-medium text-on-surface">
                        {row.itemName}
                      </td>
                      <td className="py-4 px-5 text-on-surface-muted font-mono text-sm">
                        {row.partNumber}
                      </td>
                      <td className="py-4 px-5 text-on-surface-muted">
                        {row.category}
                      </td>
                      <td className="py-4 px-5 text-on-surface font-medium">
                        {row.currentQuantity.toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-on-surface-muted">
                        {row.minimumStockLevel.toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                          ${status.color === "success" ? "bg-success/10 text-success border-success/20" : ""}
                          ${status.color === "warning" ? "bg-warning/10 text-warning border-warning/20" : ""}
                          ${status.color === "error" ? "bg-error/10 text-error border-error/20" : ""}
                        `}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${status.color === "success" ? "bg-success" : status.color === "warning" ? "bg-warning" : "bg-error"}`}
                          />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustStock(row)}
                            className="p-1.5 text-primary"
                            title="Adjust stock"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              exposure
                            </span>
                          </button>
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg text-on-surface-muted transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(row.itemId, row.itemName)
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {error && <p className="text-error text-sm mt-4">{error}</p>}
      </section>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Edit Item" : "Add New Item"}
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Brand",
                key: "brand" as keyof ItemForm,
                placeholder: "e.g. Samsung",
              },
              {
                label: "Model",
                key: "model" as keyof ItemForm,
                placeholder: "e.g. Galaxy S24",
              },
              {
                label: "Category",
                key: "category" as keyof ItemForm,
                placeholder: "e.g. Electronics",
              },
              {
                label: "Part Number",
                key: "partNumber" as keyof ItemForm,
                placeholder: "e.g. SAM-001",
              },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  required
                  value={form[key] as string}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-muted"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Optional description"
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-muted"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted mb-1.5 uppercase tracking-wider">
              Initial Quantity
            </label>
            <input
              type="number"
              min={0}
              required
              value={form.quantity}
              readOnly={editId !== null}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
              }
              className="w-full px-3 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
              )}
              {saving ? "Saving..." : editId ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
