import React from 'react';

const GoodsReceiving: React.FC = () => {
  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Goods Receiving</h1>
            <p className="text-on-surface-muted text-sm">Verify inbound shipments and mark received items as arrived, missing, or damaged.</p>
          </div>
        </div>
      </section>
      <section className="glass-panel bg-surface-elevated/40 rounded-lg border border-glass-border shadow-sm p-lg">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-wider">Latest Shipment</p>
            <h2 className="text-xl font-bold text-on-surface">Inbound Batch #237</h2>
          </div>
          <button className="inline-flex items-center gap-sm px-md py-2 rounded-lg bg-primary text-on-surface text-xs font-semibold hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined">upload</span>
            Upload Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-muted text-label-md uppercase tracking-wider border-b border-glass-border">
                <th className="py-sm pr-lg">Item</th>
                <th className="py-sm pr-lg">Expected</th>
                <th className="py-sm pr-lg">Received</th>
                <th className="py-sm pr-lg">Verification</th>
                <th className="py-sm pr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              <tr>
                <td className="py-md pr-lg font-medium">Industrial Control Module</td>
                <td className="py-md pr-lg">120</td>
                <td className="py-md pr-lg">120</td>
                <td className="py-md pr-lg text-secondary">Arrived</td>
                <td className="py-md pr-lg">
                  <button className="px-md py-2 rounded-lg bg-surface-elevated text-on-surface hover:bg-surface-container-high transition-colors">Verify</button>
                </td>
              </tr>
              <tr>
                <td className="py-md pr-lg font-medium">Precision Bearing Kit</td>
                <td className="py-md pr-lg">95</td>
                <td className="py-md pr-lg">90</td>
                <td className="py-md pr-lg text-error font-medium">Missing</td>
                <td className="py-md pr-lg">
                  <button className="px-md py-2 rounded-lg bg-surface-elevated text-on-surface hover:bg-surface-container-high transition-colors">Verify</button>
                </td>
              </tr>
              <tr>
                <td className="py-md pr-lg font-medium">High-Performance Widget</td>
                <td className="py-md pr-lg">320</td>
                <td className="py-md pr-lg">320</td>
                <td className="py-md pr-lg text-secondary">Arrived</td>
                <td className="py-md pr-lg">
                  <button className="px-md py-2 rounded-lg bg-surface-elevated text-on-surface hover:bg-surface-container-high transition-colors">Verify</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default GoodsReceiving;
