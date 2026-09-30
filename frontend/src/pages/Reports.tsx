import React, { useEffect, useState } from 'react';
import { orderService, inventoryService } from '../services/api';

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordRes, invRes] = await Promise.all([
          orderService.getAll(),
          inventoryService.getAll(),
        ]);
        setOrders(ordRes.data || []);
        setInventory(invRes.data || []);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    setExporting(true);
    try {
      let csv = 'NEXUS ERP - COMPREHENSIVE BUSINESS REPORT\n\n';
      csv += '--- ORDERS DATA ---\n';
      csv += 'Invoice Number,Customer,Status,Ordered Date,Total Amount ($)\n';
      orders.forEach((o) => {
        csv += `${o.invoiceNum},"${o.customer?.shopName || ''}",${o.orderStatus},${o.orderedDate},${o.totalAmount?.toFixed(2)}\n`;
      });
      csv += '\n--- INVENTORY DATA ---\n';
      csv += 'Item ID,Brand,Model,Category,Part Number,Current Quantity,Min Stock\n';
      inventory.forEach((i) => {
        csv += `${i.itemId},"${i.item?.brand || ''}","${i.item?.model || ''}","${i.item?.category || ''}",${i.item?.partNumber || ''},${i.currentQuantity},${i.minimumStockLevel}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexus_business_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Failed to generate export file.');
    } finally {
      setExporting(false);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'APPROVED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalUnitsInStock = inventory.reduce((sum, i) => sum + (i.currentQuantity || 0), 0);
  const lowStockCount = inventory.filter((i) => i.currentQuantity <= i.minimumStockLevel).length;

  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Reports & Analytics</h1>
            <p className="text-on-surface-muted text-sm mt-1">
              Cross-system operational analytics, sales metrics, and export utilities.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-60"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">download</span>
            )}
            {exporting ? 'Generating...' : 'Export Complete CSV'}
          </button>
        </div>
      </section>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">Total Gross Revenue</p>
          <h2 className="text-4xl font-bold text-success">
            ${loading ? '...' : totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-on-surface-muted mt-2">From approved orders across all regions</p>
        </div>

        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">Total On-Hand Units</p>
          <h2 className="text-4xl font-bold text-secondary">
            {loading ? '...' : totalUnitsInStock.toLocaleString()}
          </h2>
          <p className="text-xs text-on-surface-muted mt-2">Across all active items in warehouse stock</p>
        </div>

        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">Stock Alerts</p>
          <h2 className="text-4xl font-bold text-warning">
            {loading ? '...' : lowStockCount}
          </h2>
          <p className="text-xs text-on-surface-muted mt-2">Items currently at or below minimum threshold</p>
        </div>
      </div>

      {/* Report Breakdown Preview */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl p-6 border border-glass-border">
        <h3 className="text-lg font-bold text-on-surface mb-4">Export Summary Preview</h3>
        <div className="space-y-3 text-sm text-on-surface-muted">
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span>Orders recorded</span>
            <span className="font-semibold text-on-surface">{orders.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span>Catalog items monitored</span>
            <span className="font-semibold text-on-surface">{inventory.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span>Export format</span>
            <span className="font-semibold text-secondary">CSV (Comma-Separated Values)</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Encoding</span>
            <span className="font-semibold text-on-surface">UTF-8 compatible with Excel & Google Sheets</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
