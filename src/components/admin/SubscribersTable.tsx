// src/components/admin/SubscribersTable.tsx

import { useState, useEffect } from "react";

interface Subscriber {
  id: number;
  name: string;
  email: string;
  organizerIds: number[];
  locationIds: number[];
  createdAt: string;
}

interface Lookup {
  id: number;
  name: string;
}

interface Props {
  organizers: Lookup[];
  locations: Lookup[];
}

export default function SubscribersTable({ organizers, locations }: Props) {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Lookup-Maps für schnelle Namens-Auflösung
  const orgMap = Object.fromEntries(organizers.map((o) => [o.id, o.name]));
  const locMap = Object.fromEntries(locations.map((l) => [l.id, l.name]));

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/subscribers");
      if (!res.ok) throw new Error("Fehler beim Laden");
      setRows(await res.json());
    } catch {
      setError("Abonnenten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setDeletingId(null);
      await load();
      showSuccess("Abonnent erfolgreich gelöscht.");
    } catch {
      setError("Fehler beim Löschen.");
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg" /></div>;
  }

  return (
    <div className="space-y-4">

      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {success && <div className="alert alert-success"><span>{success}</span></div>}

      {rows.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          Noch keine Abonnenten eingetragen.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Veranstalter</th>
                <th>Orte</th>
                <th>Seit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="font-medium">{row.name}</td>
                  <td>
                    <a href={`mailto:${row.email}`} className="link link-primary">
                      {row.email}
                    </a>
                  </td>
                  <td>
                    {row.organizerIds.length === 0 ? (
                      <span className="text-gray-400">–</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {row.organizerIds.map((id) => (
                          <span key={id} className="badge badge-primary badge-sm">
                            {orgMap[id] ?? `#${id}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {row.locationIds.length === 0 ? (
                      <span className="text-gray-400">–</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {row.locationIds.map((id) => (
                          <span key={id} className="badge badge-secondary badge-sm">
                            {locMap[id] ?? `#${id}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="text-gray-400 whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td>
                    {deletingId === row.id ? (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-error btn-xs"
                          onClick={() => handleDelete(row.id)}
                        >
                          Löschen bestätigen
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setDeletingId(null)}
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => setDeletingId(row.id)}
                      >
                        Löschen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-right text-xs text-gray-400">
        {rows.length} Abonnent{rows.length !== 1 ? "en" : ""}
      </div>
    </div>
  );
}
