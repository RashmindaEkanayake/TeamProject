import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService, customerService, authService } from '../services/api';

const SalesDashboard: React.FC = () => {
  const user = authService.getCurrentUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordRes, custRes] = await Promise.all([
          orderService.getAll(),
          customerService.getAll(),
        ]);
        setOrders(ordRes.data || []);
        setCustomerCount((custRes.data || []).length);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSales = orders
    .filter((o) => o.orderStatus === 'APPROVED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-10 animate-fade-in-up">
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Sales Hub</h1>
          </div>
          <p className="text-on-surface-muted text-sm max-w-2xl">
            Welcome, <span className="text-on-surface font-medium">{user?.fullName || user?.username}</span>. Track your customer relationships, create new orders, and monitor your delivery progress.
          </p>
        </div>
        <div>
          <Link
            to="/sales/orders"
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Order
          </Link>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl relative overflow-hidden">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">Assigned Customers</p>
          <h2 className="text-4xl font-bold text-on-surface">
            {loading ? '...' : customerCount}
          </h2>
          <div className="flex items-center gap-2 mt-4 text-xs text-secondary">
            <span className="material-symbols-outlined text-sm">group</span>
            <span>Active accounts</span>
          </div>
        </div>

        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl relative overflow-hidden">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">Orders Placed</p>
          <h2 className="text-4xl font-bold text-on-surface">
            {loading ? '...' : orders.length}
          </h2>
          <div className="flex items-center gap-2 mt-4 text-xs text-primary">
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            <span>Total orders</span>
          </div>
        </div>

        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl relative overflow-hidden">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">Pending Approval</p>
          <h2 className="text-4xl font-bold text-warning">
            {loading ? '...' : pendingOrders}
          </h2>
          <div className="flex items-center gap-2 mt-4 text-xs text-warning">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Awaiting admin review</span>
          </div>
        </div>

        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl relative overflow-hidden">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">Approved Revenue</p>
          <h2 className="text-4xl font-bold text-success">
            ${loading ? '...' : totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-2 mt-4 text-xs text-success">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>Closed pipeline</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-glass-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-on-surface">Recent Orders</h3>
          <Link to="/sales/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-on-surface-muted text-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-on-surface-muted text-sm">No orders placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-glass-border">
                  <th className="py-3 px-5 text-on-surface-muted text-xs uppercase tracking-wider">Invoice</th>
                  <th className="py-3 px-5 text-on-surface-muted text-xs uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-5 text-on-surface-muted text-xs uppercase tracking-wider">Date</th>
                  <th className="py-3 px-5 text-on-surface-muted text-xs uppercase tracking-wider">Total</th>
                  <th className="py-3 px-5 text-on-surface-muted text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.orderId} className="hover:bg-surface-elevated/60 transition-colors">
                    <td className="py-3 px-5 font-mono text-sm text-on-surface">{o.invoiceNum}</td>
                    <td className="py-3 px-5 text-sm text-on-surface-muted">{o.customer?.shopName || '—'}</td>
                    <td className="py-3 px-5 text-xs text-on-surface-muted">{o.orderedDate}</td>
                    <td className="py-3 px-5 text-sm font-medium text-on-surface">${o.totalAmount?.toFixed(2)}</td>
                    <td className="py-3 px-5 text-xs">
                      <span className={`px-2.5 py-1 rounded-full font-semibold border ${
                        o.orderStatus === 'APPROVED' ? 'bg-success/10 text-success border-success/20' :
                        o.orderStatus === 'PENDING_APPROVAL' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-error/10 text-error border-error/20'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default SalesDashboard;
