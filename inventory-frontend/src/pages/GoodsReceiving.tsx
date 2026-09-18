import React, { useEffect, useState } from 'react';
import { goodsReceivingService } from '../services/api';
import Modal from '../components/Modal';

interface GoodsItem {
  receivingItemId: number;
  item?: { brand?: string; model?: string; partNumber?: string };
  expectedQuantity: number;
  receivedQuantity: number;
  verificationStatus: string;
}

interface GoodsBatch {
  receivingId: number;
  invoiceNumber: string;
  receivedDate: string;
  status: string;
  items: GoodsItem[];
}

const GoodsReceiving: React.FC = () => {
  const [batches, setBatches] = useState<GoodsBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<GoodsBatch | null>(null);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState<number | string | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await goodsReceivingService.getAllLogs();
      const data: GoodsBatch[] = res.data || [];
      setBatches(data);
      if (data.length > 0) {
        setSelectedBatch(data[0]);
      }
    } catch {
      // Failed to load batches
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await goodsReceivingService.uploadExcel(formData);
      setShowUploadModal(false);
      setSelectedFile(null);
      fetchBatches();
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Failed to upload Excel file.');
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyItem = async (itemId: number, newStatus: string) => {
    setActionLoading(itemId);
    try {
      await goodsReceivingService.verifyItem(itemId, newStatus);
      await fetchBatches();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Verification update failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBatchDecision = async (receivingId: number, decision: 'APPROVED' | 'REJECTED') => {
    if (!window.confirm(`Are you sure you want to set batch status to ${decision}?`)) return;
    setActionLoading(`batch-${receivingId}`);
    try {
      await goodsReceivingService.decideBatch(receivingId, decision);
      await fetchBatches();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Decision submission failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const activeItems = selectedBatch?.items || [];

  return (
    <div className="space-y-xl animate-fade-in-up">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Goods Receiving</h1>
            <p className="text-on-surface-muted text-sm mt-1">Verify inbound shipments and mark received items as arrived, missing, or damaged.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Upload Excel
          </button>
        </div>
      </section>

      {/* Main Panel */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border shadow-sm p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-muted text-sm">Loading receiving logs...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted">inbox</span>
            <p className="text-on-surface-muted text-sm">No receiving logs found. Upload an Excel manifest to get started.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Upload Manifest
            </button>
          </div>
        ) : (
          <div>
            {/* Batch Selector Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-glass-border gap-4">
              <div>
                <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-widest">Active Shipment Log</p>
                <div className="flex items-center gap-3 mt-1">
                  <select
                    value={selectedBatch?.receivingId || ''}
                    onChange={(e) => {
                      const found = batches.find(b => b.receivingId === Number(e.target.value));
                      if (found) setSelectedBatch(found);
                    }}
                    className="px-3 py-2 bg-surface border border-glass-border rounded-xl text-base font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    {batches.map(b => (
                      <option key={b.receivingId} value={b.receivingId}>
                        Batch #{b.receivingId} — Invoice: {b.invoiceNumber || 'N/A'} ({b.receivedDate ? new Date(b.receivedDate).toLocaleDateString() : 'Recent'})
                      </option>
                    ))}
                  </select>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    selectedBatch?.status === 'APPROVED' ? 'bg-success/10 text-success border-success/20' :
                    selectedBatch?.status === 'REJECTED' ? 'bg-error/10 text-error border-error/20' :
                    'bg-warning/10 text-warning border-warning/20'
                  }`}>
                    {selectedBatch?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {selectedBatch && selectedBatch.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBatchDecision(selectedBatch.receivingId, 'APPROVED')}
                    disabled={actionLoading === `batch-${selectedBatch.receivingId}`}
                    className="px-4 py-2 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Approve Batch
                  </button>
                  <button
                    onClick={() => handleBatchDecision(selectedBatch.receivingId, 'REJECTED')}
                    disabled={actionLoading === `batch-${selectedBatch.receivingId}`}
                    className="px-4 py-2 rounded-xl bg-error/10 text-error border border-error/20 hover:bg-error/20 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Reject Batch
                  </button>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto rounded-xl border border-glass-border">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-surface/50 border-b border-glass-border text-on-surface-muted text-xs font-semibold uppercase tracking-widest">
                    <th className="py-4 px-5">Item</th>
                    <th className="py-4 px-5">Part Number</th>
                    <th className="py-4 px-5">Expected</th>
                    <th className="py-4 px-5">Received</th>
                    <th className="py-4 px-5">Verification</th>
                    <th className="py-4 px-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {activeItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-on-surface-muted text-sm">No items logged in this batch.</td>
                    </tr>
                  ) : (
                    activeItems.map(item => {
                      const status = item.verificationStatus || 'PENDING';
                      return (
                        <tr key={item.receivingItemId} className="hover:bg-surface-elevated/60 transition-colors">
                          <td className="py-4 px-5 font-medium text-on-surface">
                            {item.item ? `${item.item.brand || ''} ${item.item.model || ''}`.trim() : 'Unknown Item'}
                          </td>
                          <td className="py-4 px-5 font-mono text-xs text-on-surface-muted">{item.item?.partNumber || '—'}</td>
                          <td className="py-4 px-5 text-on-surface">{item.expectedQuantity}</td>
                          <td className="py-4 px-5 text-on-surface font-semibold">{item.receivedQuantity}</td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              status === 'ARRIVED' || status === 'VERIFIED' ? 'bg-success/10 text-success border-success/20' :
                              status === 'MISSING' || status === 'DAMAGED' ? 'bg-error/10 text-error border-error/20' :
                              'bg-warning/10 text-warning border-warning/20'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <select
                                value={status}
                                disabled={actionLoading === item.receivingItemId}
                                onChange={(e) => handleVerifyItem(item.receivingItemId, e.target.value)}
                                className="px-2.5 py-1.5 bg-surface border border-glass-border rounded-lg text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                              >
                                <option value="PENDING">Mark Pending</option>
                                <option value="ARRIVED">Mark Arrived</option>
                                <option value="MISSING">Mark Missing</option>
                                <option value="DAMAGED">Mark Damaged</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Shipment Manifest (Excel)"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
          {uploadError && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs">
              {uploadError}
            </div>
          )}
          <div className="border-2 border-dashed border-glass-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            <span className="material-symbols-outlined text-4xl text-on-surface-muted mb-2">upload_file</span>
            <p className="text-sm font-medium text-on-surface mb-1">Select Excel File (.xlsx, .xls)</p>
            <p className="text-xs text-on-surface-muted mb-4">Upload the receiving manifest to process inbound inventory.</p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-on-surface-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-glass-border text-on-surface text-sm hover:bg-outline-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-surface text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {uploading && <div className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />}
              {uploading ? 'Uploading...' : 'Upload & Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GoodsReceiving;

