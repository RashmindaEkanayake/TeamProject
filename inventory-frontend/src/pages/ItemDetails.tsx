import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemService, inventoryService } from '../services/api';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchItemDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemRes, stockRes] = await Promise.all([
          itemService.getById(id),
          inventoryService.getById(id).catch(() => ({ data: null })),
        ]);
        setItem(itemRes.data);
        setStock(stockRes.data);
      } catch {
        setError('Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-on-surface-muted text-sm font-medium">Loading item details...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-on-surface font-semibold text-lg">{error || 'Item not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-surface-elevated border border-glass-border hover:bg-outline-variant text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                {item.brand} {item.model}
              </h1>
              <p className="text-on-surface-muted text-sm mt-1">{item.description || 'No description provided.'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider">Item ID</p>
            <p className="text-xl font-bold text-primary font-mono">#{item.itemId}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-lg">
        {/* Summary */}
        <div className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-on-surface border-b border-glass-border pb-3">Product Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">Brand</p>
              <p className="font-semibold text-on-surface">{item.brand || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">Model</p>
              <p className="font-semibold text-on-surface">{item.model || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">Part Number</p>
              <p className="font-mono text-on-surface">{item.partNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">Category</p>
              <p className="font-semibold text-on-surface">{item.category || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">Current Stock</p>
              <p className="font-bold text-on-surface text-base">
                {stock?.currentQuantity != null ? stock.currentQuantity.toLocaleString() : 'N/A'} units
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">Minimum Stock Threshold</p>
              <p className="font-semibold text-on-surface-muted">
                {stock?.minimumStockLevel != null ? stock.minimumStockLevel.toLocaleString() : 'N/A'} units
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-on-surface border-b border-glass-border pb-3">Pricing Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-muted">Retail Price</span>
              <span className="font-semibold text-on-surface">${item.retailPrice?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-muted">Import Price</span>
              <span className="font-semibold text-on-surface">${item.importPrice?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-glass-border">
              <span className="text-on-surface font-semibold">Selling Price</span>
              <span className="font-bold text-primary text-lg">${item.salePrice?.toFixed(2) ?? item.sellingPrice?.toFixed(2) ?? '0.00'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ItemDetails;

