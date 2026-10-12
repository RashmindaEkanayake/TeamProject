import React, { useEffect, useState } from "react";
import { salesRepService, errorMessage } from "../services/api";
import Modal from "../components/Modal";
import LoadError from "../components/LoadError";
const blank = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  username: "",
  password: "",
};
export default function Representatives() {
  const [rows, setRows] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [show, setShow] = useState(false),
    [id, setId] = useState<number | null>(null),
    [form, setForm] = useState(blank),
    [busy, setBusy] = useState(false);
  const [statusRep, setStatusRep] = useState<any>(null),
    [target, setTarget] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows((await salesRepService.getAll()).data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const edit = (r: any) => {
    setId(r?.repId || null);
    setForm(
      r
        ? {
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            phoneNumber: r.phoneNumber || "",
            username: r.username || "",
            password: "",
          }
        : blank,
    );
    setShow(true);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data: any = { ...form };
      if (!data.password) delete data.password;
      if (id) {
        delete data.username;
        await salesRepService.update(id, data);
      } else await salesRepService.create(data);
      setShow(false);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const changeStatus = async () => {
    if (!statusRep) return;
    setBusy(true);
    setError("");
    try {
      await salesRepService.setStatus(
        statusRep.repId,
        statusRep.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        target ? Number(target) : undefined,
      );
      setStatusRep(null);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Representatives</h1>
        <button
          onClick={() => edit(null)}
          className="px-4 py-3 bg-primary rounded-xl"
        >
          Add Representative
        </button>
      </div>
      {error && <LoadError message={error} retry={load} />}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <section className="glass-panel p-6 rounded-2xl overflow-x-auto">
          <table className="w-full text-left [&_td]:p-3 [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead>
              <tr>
                {[
                  "Name",
                  "Email",
                  "Login",
                  "Phone",
                  "Status",
                  "Customers",
                  "Approved sales",
                  "Actions",
                ].map((t) => (
                  <th key={t} className="p-3">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.repId} className="border-t border-glass-border">
                  <td className="p-3">
                    {r.firstName} {r.lastName}
                  </td>
                  <td>{r.email}</td>
                  <td>{r.username || "No account"}</td>
                  <td>{r.phoneNumber || "—"}</td>
                  <td>{r.status}</td>
                  <td>{r.customers?.length || 0}</td>
                  <td>{Number(r.totalOrderValue).toFixed(2)}</td>
                  <td>
                    <button
                      disabled={busy}
                      onClick={() => edit(r)}
                      className="px-3 text-primary"
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        setTarget("");
                        setStatusRep(r);
                      }}
                      className="text-error"
                    >
                      {r.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && !error && <p>No representatives yet.</p>}
        </section>
      )}
      <Modal
        isOpen={!!statusRep}
        onClose={() => {
          if (!busy) setStatusRep(null);
        }}
        title={
          statusRep?.status === "ACTIVE"
            ? "Deactivate Representative"
            : "Reactivate Representative"
        }
      >
        <div className="p-6 space-y-4">
          <p>
            {statusRep?.firstName} has{" "}
            <strong>{statusRep?.customers?.length || 0}</strong> assigned
            customers. Historical orders and accounts will be retained.
          </p>
          {statusRep?.status === "ACTIVE" &&
            (statusRep?.customers?.length || 0) > 0 && (
              <label className="block">
                Reassign all customers to
                <select
                  required
                  className="w-full p-3 bg-surface border border-glass-border rounded-xl"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">Select active representative</option>
                  {rows
                    .filter(
                      (r) =>
                        r.status === "ACTIVE" && r.repId !== statusRep.repId,
                    )
                    .map((r) => (
                      <option key={r.repId} value={r.repId}>
                        {r.firstName} {r.lastName}
                      </option>
                    ))}
                </select>
              </label>
            )}
          {error && <LoadError message={error} />}
          <button
            disabled={
              busy ||
              (statusRep?.status === "ACTIVE" &&
                (statusRep?.customers?.length || 0) > 0 &&
                !target)
            }
            onClick={changeStatus}
            className="px-4 py-3 bg-primary rounded-xl disabled:opacity-50"
          >
            {busy ? "Saving…" : "Confirm"}
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={show}
        onClose={() => {
          if (!busy) setShow(false);
        }}
        title={id ? "Edit Representative" : "Add Representative"}
      >
        <form className="p-6 space-y-4" onSubmit={save}>
          {Object.keys(blank)
            .filter((k) => !id || k !== "username")
            .map((k) => (
              <label key={k} className="block text-sm">
                {
                  (
                    {
                      firstName: "First name",
                      lastName: "Last name",
                      email: "Email",
                      phoneNumber: "Phone",
                      username: "Username",
                      password: id
                        ? "New password (leave blank to keep current)"
                        : "Password (10–72 characters)",
                    } as any
                  )[k]
                }
                <input
                  type={
                    k === "password"
                      ? "password"
                      : k === "email"
                        ? "email"
                        : "text"
                  }
                  required={k !== "phoneNumber" && (k !== "password" || !id)}
                  minLength={k === "password" ? 10 : undefined}
                  maxLength={
                    k === "password" ? 72 : k === "username" ? 100 : 255
                  }
                  className="w-full p-3 bg-surface rounded-xl border border-glass-border"
                  value={(form as any)[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
          {error && <LoadError message={error} />}
          <button disabled={busy} className="px-4 py-3 bg-primary rounded-xl">
            {busy ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
