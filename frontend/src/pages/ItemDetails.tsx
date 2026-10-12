import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  authService,
  itemService,
  priceApprovalService,
  reportService,
  errorMessage,
} from "../services/api";
import LoadError from "../components/LoadError";
export default function ItemDetails() {
  const { id } = useParams();
  const admin = authService.getCurrentUser()?.role === "ADMIN";
  const [item, setItem] = useState<any>(null),
    [history, setHistory] = useState<any[]>([]),
    [movement, setMovement] = useState<any[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [i, h, m] = await Promise.all([
        itemService.getById(id!),
        priceApprovalService.getHistory(id!),
        admin ? reportService.movements(id!) : Promise.resolve({ data: [] }),
      ]);
      setItem(i.data);
      setHistory(h.data);
      setMovement(m.data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  return (
    <div className="space-y-xl animate-fade-in-up">
      <h1 className="text-3xl font-bold">Item Details</h1>
      {error ? (
        <LoadError message={error} retry={load} />
      ) : loading ? (
        <p>Loading item…</p>
      ) : (
        item && (
          <>
            <section className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold">
                {item.brand} {item.model}
              </h2>
              <p>
                {item.partNumber} · {item.category}
              </p>
              <p className="text-on-surface-muted">
                {item.description || "No description"}
              </p>
              <p className="mt-4">
                Available: {item.quantity} units · Approved selling price:{" "}
                {item.salePrice == null
                  ? "Not set"
                  : Number(item.salePrice).toFixed(2)}
              </p>
            </section>
            <section className="glass-panel p-6 rounded-2xl overflow-x-auto">
              <h2 className="text-xl font-bold mb-3">Price History</h2>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sale price</th>
                    <th>Status</th>
                    <th>Requested by</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr
                      key={p.priceId}
                      className="border-t border-glass-border"
                    >
                      <td className="py-3">
                        {new Date(p.startDate).toLocaleString()}
                      </td>
                      <td>{Number(p.salePrice).toFixed(2)}</td>
                      <td>{p.status}</td>
                      <td>{p.requestedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!history.length && <p>No price records yet.</p>}
            </section>
            {admin && (
              <section className="glass-panel p-6 rounded-2xl overflow-x-auto">
                <h2 className="text-xl font-bold mb-3">Stock Movements</h2>
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Change</th>
                      <th>Reason</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movement.map((m) => (
                      <tr key={m.id} className="border-t border-glass-border">
                        <td className="py-3">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>
                        <td>
                          {m.quantity > 0 ? "+" : ""}
                          {m.quantity}
                        </td>
                        <td>{m.reason}</td>
                        <td>{m.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!movement.length && <p>No stock movements recorded.</p>}
              </section>
            )}
          </>
        )
      )}
      <Link
        className="text-primary"
        to={admin ? "/admin/inventory" : "/sales/orders"}
      >
        Back
      </Link>
    </div>
  );
}
