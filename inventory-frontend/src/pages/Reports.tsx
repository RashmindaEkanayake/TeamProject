import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-xl">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Reports & Analytics</h1>
            <p className="text-on-surface-muted text-sm">Analyze inventory trends, sales performance, and supply chain efficiency.</p>
          </div>
          <button className="inline-flex items-center gap-sm px-md py-2 rounded-lg bg-primary text-on-surface text-xs font-semibold hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined">download</span>
            Export PDF
          </button>
        </div>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="glass-panel bg-surface-elevated/40 rounded-lg border border-glass-border shadow-sm p-lg">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-wider mb-sm">Inventory Turnover</p>
          <h2 className="text-xl font-bold text-on-surface">12.8%</h2>
        </div>
        <div className="glass-panel bg-surface-elevated/40 rounded-lg border border-glass-border shadow-sm p-lg">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-wider mb-sm">Order Fulfillment</p>
          <h2 className="text-xl font-bold text-on-surface">96.5%</h2>
        </div>
        <div className="glass-panel bg-surface-elevated/40 rounded-lg border border-glass-border shadow-sm p-lg">
          <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-wider mb-sm">Price Change Impact</p>
          <h2 className="text-xl font-bold text-on-surface">+5.3%</h2>
        </div>
      </section>
    </div>
  );
};

export default Reports;
