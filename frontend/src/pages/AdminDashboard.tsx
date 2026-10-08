import { businessCSV, downloadCSV } from "../services/csv";
import LoadError from "../components/LoadError";
import { errorMessage } from "../services/api";
import React, { useEffect, useState } from "react";
import {
  orderService,
  inventoryService,
  authService,
  reportService,
} from "../services/api";

const AdminDashboard: React.FC = () => {
  const user = authService.getCurrentUser();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [inventoryCount, setInventoryCount] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [movement, setMovement] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, inventoryRes, reportRes] = await Promise.all([
        orderService.getAll(),
        inventoryService.getAll(),
        reportService.summary(),
      ]);
      const orders: any[] = ordersRes.data || [];
      const inventory: any[] = inventoryRes.data || [];
      setPendingCount(
        orders.filter((o: any) => o.orderStatus === "PENDING_APPROVAL").length,
      );
      setInventoryCount(inventory.length);
      setTotalRevenue(Number(reportRes.data.approvedRevenue));
      setMovement(reportRes.data.movement);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        orderService.getAll(),
        inventoryService.getAll(),
      ]);
      const orders: any[] = ordersRes.data || [];
      const inventory: any[] = inventoryRes.data || [];

      downloadCSV(
        businessCSV(orders, inventory),
        `atlas-report-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch {
      alert("Failed to export report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const Spinner = () => (
    <div className="w-6 h-6 border-2 border-on-surface/20 border-t-on-surface rounded-full animate-spin" />
  );

  if (error) return <LoadError message={error} retry={fetchStats} />;
  return (
    <div className="space-y-10 animate-fade-in-up">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">
                Operational Overview
              </h1>
            </div>
            <p className="text-on-surface-muted text-sm max-w-2xl">
              Welcome back,{" "}
              <span className="text-on-surface font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              . Monitor global inventory flow, ordering patterns, and approvals
              from this unified admin hub.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportReport}
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
              )}
              {exporting ? "Exporting..." : "Export Report"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Widget 1 - Inventory Count */}
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest">
                Total Inventory Items
              </p>
              <span className="material-symbols-outlined text-secondary/50 group-hover:text-secondary transition-colors">
                inventory_2
              </span>
            </div>
            {loading ? (
              <div className="flex items-center gap-3 mb-2">
                <Spinner />
              </div>
            ) : (
              <h2 className="text-5xl font-bold text-on-surface mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-secondary transition-all">
                {inventoryCount?.toLocaleString()}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 mt-6 p-2 rounded-lg bg-success/10 border border-success/20 w-fit">
            <span className="material-symbols-outlined text-success text-[16px]">
              trending_up
            </span>
            <p className="text-success text-xs font-semibold">
              Live inventory data
            </p>
          </div>
        </div>

        {/* Widget 2 - Pending Orders */}
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl hover:border-warning/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-warning/20 transition-all duration-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest">
                Pending Orders
              </p>
              <span className="material-symbols-outlined text-warning/50 group-hover:text-warning transition-colors">
                pending_actions
              </span>
            </div>
            {loading ? (
              <div className="flex items-center gap-3 mb-2">
                <Spinner />
              </div>
            ) : (
              <h2 className="text-5xl font-bold text-on-surface mb-2">
                {pendingCount}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 mt-6 p-2 rounded-lg bg-warning/10 border border-warning/20 w-fit">
            <span className="material-symbols-outlined text-warning text-[16px]">
              warning
            </span>
            <p className="text-warning text-xs font-semibold">
              Awaiting approval
            </p>
          </div>
        </div>

        {/* Widget 3 - Total Revenue */}
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest">
                Approved Revenue
              </p>
              <span className="material-symbols-outlined text-on-surface/50 group-hover:text-on-surface transition-colors">
                payments
              </span>
            </div>
            {loading ? (
              <div className="flex items-center gap-3 mb-2">
                <Spinner />
              </div>
            ) : (
              <h2 className="text-5xl font-bold text-on-surface mb-2">
                $
                {totalRevenue != null
                  ? totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : "0"}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 mt-6 p-2 rounded-lg bg-primary/10 border border-secondary/20 w-fit">
            <span className="material-symbols-outlined text-secondary text-[16px]">
              info
            </span>
            <p className="text-secondary text-xs font-semibold">
              From approved orders
            </p>
          </div>
        </div>
      </div>

      <section className="mt-8 glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-3">
          Stock Movement · Last 12 Months
        </h3>
        <p className="text-xs text-on-surface-muted mb-6">
          Incoming units (purple), outgoing units (teal). Includes opening
          balances and manual adjustments.
        </p>
        <div className="h-64 flex items-end gap-2 overflow-x-auto">
          {movement.map((m) => {
            const max = Math.max(
              1,
              ...movement.flatMap((x) => [x.incoming, x.outgoing]),
            );
            return (
              <div
                key={m.month}
                className="flex-1 min-w-[42px] h-full flex flex-col justify-end items-center"
              >
                <div className="flex items-end justify-center gap-1 h-48 w-full">
                  <div
                    title={`${m.month}: ${m.incoming} incoming`}
                    className="bg-primary w-3 rounded-t"
                    style={{ height: `${(m.incoming / max) * 100}%` }}
                  />
                  <div
                    title={`${m.month}: ${m.outgoing} outgoing`}
                    className="bg-secondary w-3 rounded-t"
                    style={{ height: `${(m.outgoing / max) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-on-surface-muted mt-2">
                  {m.month}
                </span>
                <span className="text-[10px]">
                  {m.incoming}/{m.outgoing}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
