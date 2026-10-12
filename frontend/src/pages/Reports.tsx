import { businessCSV, downloadCSV } from "../services/csv";
import LoadError from "../components/LoadError";
import { errorMessage } from "../services/api";
import React, { useEffect, useState } from "react";
import { orderService, inventoryService, reportService } from "../services/api";

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ordRes, invRes, reportRes] = await Promise.all([
        orderService.getAll(),
        inventoryService.getAll(),
        reportService.summary(),
      ]);
      setOrders(ordRes.data || []);
      setSummary(reportRes.data);
      setInventory(invRes.data || []);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = () => {
    setExporting(true);
    try {
      downloadCSV(
        businessCSV(orders, inventory),
        `atlas_business_report_${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch {
      alert("Failed to generate export file.");
    } finally {
      setExporting(false);
    }
  };

  const totalRevenue = Number(summary?.approvedRevenue || 0);
  const totalUnitsInStock = summary?.totalUnits || 0;
  const lowStockCount = summary?.lowStockCount || 0;

  if (error) return <LoadError message={error} retry={fetchData} />;
  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              Reports & Analytics
            </h1>
            <p className="text-on-surface-muted text-sm mt-1">
              Cross-system operational analytics, sales metrics, and export
              utilities.
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
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
            )}
            {exporting ? "Generating..." : "Export Complete CSV"}
          </button>
        </div>
      </section>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">
            Total Gross Revenue
          </p>
          <h2 className="text-4xl font-bold text-success">
            $
            {loading
              ? "..."
              : totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
          </h2>
          <p className="text-xs text-on-surface-muted mt-2">
            From approved orders across all regions
          </p>
        </div>

        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">
            Total On-Hand Units
          </p>
          <h2 className="text-4xl font-bold text-secondary">
            {loading ? "..." : totalUnitsInStock.toLocaleString()}
          </h2>
          <p className="text-xs text-on-surface-muted mt-2">
            Across all active items in warehouse stock
          </p>
        </div>

        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">
            Stock Alerts
          </p>
          <h2 className="text-4xl font-bold text-warning">
            {loading ? "..." : lowStockCount}
          </h2>
          <p className="text-xs text-on-surface-muted mt-2">
            Items currently at or below minimum threshold
          </p>
        </div>
      </div>

      {/* Report Breakdown Preview */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl p-6 border border-glass-border">
        <h3 className="text-lg font-bold text-on-surface mb-4">
          Export Summary Preview
        </h3>
        <div className="space-y-3 text-sm text-on-surface-muted">
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span>Orders recorded</span>
            <span className="font-semibold text-on-surface">
              {orders.length}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span>Catalog items monitored</span>
            <span className="font-semibold text-on-surface">
              {inventory.length}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-glass-border">
            <span>Export format</span>
            <span className="font-semibold text-secondary">
              CSV (Comma-Separated Values)
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span>Encoding</span>
            <span className="font-semibold text-on-surface">
              UTF-8 compatible with Excel & Google Sheets
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
