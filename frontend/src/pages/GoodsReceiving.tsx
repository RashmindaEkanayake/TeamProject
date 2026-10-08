import React, { useEffect, useState } from "react";
import {
  goodsReceivingService,
  supplierService,
  errorMessage,
} from "../services/api";
import LoadError from "../components/LoadError";
import Modal from "../components/Modal";
const input =
  "w-full p-3 bg-surface border border-glass-border rounded-xl text-on-surface";
export default function GoodsReceiving() {
  const [logs, setLogs] = useState<any[]>([]),
    [suppliers, setSuppliers] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  const [supplier, setSupplier] = useState(""),
    [reference, setReference] = useState(""),
    [notes, setNotes] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [rowErrors, setRowErrors] = useState<string[]>([]);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [l, s] = await Promise.all([
        goodsReceivingService.getAllLogs(),
        supplierService.getAll(),
      ]);
      setLogs(l.data);
      setSuppliers(s.data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setRowErrors([]);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("supplierId", supplier);
      data.append("referenceNumber", reference);
      data.append("notes", notes);
      const result = (await goodsReceivingService.uploadExcel(data)).data;
      if (result.errors?.length) {
        setRowErrors(result.errors);
      } else {
        setShow(false);
        setReference("");
        setFile(null);
        setNotes("");
        await load();
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const verify = async (id: number, status: string) => {
    setBusy(true);
    setError("");
    try {
      await goodsReceivingService.verifyItem(id, status);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const decide = async (id: number, decision: string) => {
    if (
      !window.confirm(
        decision === "VERIFY"
          ? "Finalize batch and add only ARRIVED items to stock?"
          : "Reject this batch without changing stock?",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await goodsReceivingService.decideBatch(id, decision);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-xl animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goods Receiving</h1>
          <p className="text-on-surface-muted">
            Import a shipment, verify each line, then finalize the batch.
          </p>
        </div>
        <button
          disabled={busy || loading || !suppliers.length}
          onClick={() => {
            setRowErrors([]);
            setShow(true);
          }}
          className="px-4 py-3 bg-primary rounded-xl"
        >
          Upload Excel
        </button>
      </div>
      {error && <LoadError message={error} retry={load} />}
      {loading ? (
        <p>Loading receiving logs…</p>
      ) : !error && logs.length === 0 ? (
        <p className="text-on-surface-muted">
          No shipments yet. Add a supplier and catalog items before importing.
        </p>
      ) : (
        logs.map((log) => (
          <section
            key={log.receivingId}
            className="glass-panel p-6 rounded-2xl border border-glass-border space-y-4"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {log.referenceNumber} · {log.supplierName}
                </h2>
                <p className="text-sm text-on-surface-muted">
                  {new Date(log.receiveDate).toLocaleString()} · Received by{" "}
                  {log.receivedBy}
                </p>
                {log.notes && <p>{log.notes}</p>}
              </div>
              <strong>{log.status}</strong>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {[
                      "Product",
                      "Part number",
                      "Quantity",
                      "Unit cost",
                      "Verification",
                    ].map((t) => (
                      <th key={t} className="p-3 text-on-surface-muted">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {log.items.map((i: any) => (
                    <tr
                      key={i.receivingItemId}
                      className="border-t border-glass-border"
                    >
                      <td className="p-3">
                        {i.brand} {i.model}
                      </td>
                      <td>{i.partNumber}</td>
                      <td>{i.quantityReceived}</td>
                      <td>{Number(i.costPrice).toFixed(2)}</td>
                      <td>
                        {log.status === "PENDING" ? (
                          <select
                            aria-label={`Verification ${i.partNumber}`}
                            disabled={busy}
                            value={i.verificationStatus}
                            onChange={(e) =>
                              verify(i.receivingItemId, e.target.value)
                            }
                            className={input}
                          >
                            <option value="UNVERIFIED" disabled>
                              Unverified
                            </option>
                            {["ARRIVED", "MISSING", "DAMAGED"].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          i.verificationStatus
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {log.status === "PENDING" && (
              <div className="flex gap-3">
                <button
                  disabled={
                    busy ||
                    log.items.some(
                      (i: any) => i.verificationStatus === "UNVERIFIED",
                    )
                  }
                  onClick={() => decide(log.receivingId, "VERIFY")}
                  className="px-4 py-2 bg-primary rounded-xl disabled:opacity-50"
                >
                  Finalize Receiving
                </button>
                <button
                  disabled={busy}
                  onClick={() => decide(log.receivingId, "REJECT")}
                  className="px-4 py-2 bg-error/20 text-error rounded-xl"
                >
                  Reject Batch
                </button>
              </div>
            )}
          </section>
        ))
      )}
      <Modal
        isOpen={show}
        onClose={() => {
          if (!busy) setShow(false);
        }}
        title="Import Shipment"
      >
        <form onSubmit={upload} className="p-6 space-y-4">
          <p className="text-sm text-on-surface-muted">
            First sheet columns:{" "}
            <strong>partNumber, quantity, costPrice</strong>. Part numbers must
            be text, quantity a positive whole number, cost non-negative with up
            to 2 decimals. Duplicate products are rejected. All rows must pass;
            nothing is saved if a row fails.
          </p>
          <label className="block">
            Supplier
            <select
              required
              className={input}
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.supplierId} value={s.supplierId}>
                  {s.companyName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Unique reference
            <input
              required
              maxLength={255}
              className={input}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
          <label className="block">
            Notes
            <input
              maxLength={255}
              className={input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <input
            required
            aria-label="Excel shipment"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {rowErrors.length > 0 && (
            <div role="alert" className="text-error max-h-48 overflow-auto">
              <p>Import rejected. Correct these rows and upload again:</p>
              <ul>
                {rowErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {error && <LoadError message={error} />}
          <button
            disabled={busy}
            type="submit"
            className="px-4 py-3 bg-primary rounded-xl disabled:opacity-50"
          >
            {busy ? "Importing…" : "Import Shipment"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
