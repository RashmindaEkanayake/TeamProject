import React from 'react';
import { useParams } from 'react-router-dom';

const ItemDetails: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-xl">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Item Details</h1>
            <p className="text-on-surface-muted text-sm">Review the item profile, stock level, and procurement history.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-label-md text-on-surface-muted">Item ID</p>
            <p className="text-xl font-bold text-on-surface">{id || 'N/A'}</p>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-lg">
        <div className="glass-panel bg-surface-elevated/40 rounded-lg border border-glass-border shadow-sm p-lg">
          <h2 className="text-xl font-bold text-on-surface mb-md">Product Summary</h2>
          <div className="grid gap-sm text-body-md text-on-surface-muted">
            <div>
              <p className="text-xs font-semibold text-label-md text-on-surface-muted">Name</p>
              <p className="font-medium text-on-surface">High-Performance Widget</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-label-md text-on-surface-muted">SKU</p>
              <p className="font-medium text-on-surface">HPW-001</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-label-md text-on-surface-muted">Category</p>
              <p className="font-medium text-on-surface">Industrial Electronics</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-label-md text-on-surface-muted">Stock Available</p>
              <p className="font-medium text-on-surface">8,240 units</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-label-md text-on-surface-muted">Location</p>
              <p className="font-medium text-on-surface">Warehouse A</p>
            </div>
          </div>
        </div>
        <div className="glass-panel bg-surface-elevated/40 rounded-lg border border-glass-border shadow-sm p-lg">
          <h2 className="text-xl font-bold text-on-surface mb-md">Pricing & Status</h2>
          <div className="space-y-md">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-muted">Current Price</span>
              <span className="font-medium text-on-surface">$42.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-muted">Last Price Update</span>
              <span className="font-medium text-on-surface">2 days ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-muted">Approval Status</span>
              <span className="font-medium text-secondary">Approved</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ItemDetails;
