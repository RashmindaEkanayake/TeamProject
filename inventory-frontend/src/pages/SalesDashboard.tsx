import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';

const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const res = await orderService.getAll();
        setOrders(res.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  const totalSales = orders
    .filter(o => o.orderStatus === 'APPROVED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const openOrdersCount = orders.filter(o => o.orderStatus === 'PENDING_APPROVAL').length;

  const customerTotals: Record<string, number> = {};
  orders.forEach(o => {
    const custName = o.customer?.shopName || o.customer?.contactPersonName || 'Unknown Customer';
    customerTotals[custName] = (customerTotals[custName] || 0) + (o.totalAmount || 0);
  });

  const topCustomer = Object.entries(customerTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No Data';

  return (
    <div className="space-y-10 animate-fade-in-up">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-secondary/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">point_of_sale</span>
              </div>
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">Sales Operations</h1>
            </div>
            <p className="text-on-surface-muted text-sm max-w-2xl">
              Track key orders, customer activity, and inventory availability from your dedicated sales workspace.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/sales/orders')}
              className="px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-medium hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              New Order
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Widget 1 */}
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl hover:border-success/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-success/20 transition-all duration-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest">Approved Revenue</p>
              <span className="material-symbols-outlined text-success/50 group-hover:text-success transition-colors">payments</span>
            </div>
            <h2 className="text-5xl font-bold text-on-surface mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-success transition-all">
              {loading ? '...' : `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-6 p-2 rounded-lg bg-success/10 border border-success/20 w-fit">
            <span className="material-symbols-outlined text-success text-[16px]">trending_up</span>
            <p className="text-success text-xs font-semibold">Live order total</p>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl hover:border-secondary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest">Pending Orders</p>
              <span className="material-symbols-outlined text-secondary/50 group-hover:text-secondary transition-colors">receipt_long</span>
            </div>
            <h2 className="text-5xl font-bold text-on-surface mb-2">{loading ? '...' : openOrdersCount}</h2>
          </div>
          <div className="flex items-center gap-2 mt-6 p-2 rounded-lg bg-primary/10 border border-secondary/20 w-fit">
            <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
            <p className="text-secondary text-xs font-semibold">Awaiting admin review</p>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="glass-panel bg-surface-elevated/60 p-6 rounded-2xl hover:border-accent/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-accent/20 transition-all duration-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest">Top Customer</p>
              <span className="material-symbols-outlined text-accent/50 group-hover:text-accent transition-colors">star</span>
            </div>
            <h2 className="text-3xl font-bold text-on-surface mb-2 pt-2 truncate">{loading ? '...' : topCustomer}</h2>
          </div>
          <div className="flex items-center gap-2 mt-6 p-2 rounded-lg bg-accent/10 border border-accent/20 w-fit">
            <span className="material-symbols-outlined text-accent text-[16px]">pie_chart</span>
            <p className="text-accent text-xs font-semibold">Highest total volume</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;

