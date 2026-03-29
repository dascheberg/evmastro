import React from "react";
import { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";

// ── Typen ─────────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  notify?: boolean;
};

type Organizer = {
  id: number;
  name: string;
};

type Props = {
  currentUserId: string;
};

// ── Komponente ────────────────────────────────────────────────────────────────

export function UsersTable({ currentUserId }: Props) {

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Neuen Admin anlegen
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Passwort ändern
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Löschen bestätigen
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ← NEU: Veranstalter-Zuordnung
  const [orgEditingId, setOrgEditingId] = useState<string | null>(null);
  const [orgAssignments, setOrgAssignments] = useState<Record<string, number[]>>({});
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgSaving, setOrgSaving] = useState(false);

  // ── Daten laden ───────────────────────────────────────────────────────────

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Fehler beim Laden der Nutzer.");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrganizers() {
    try {
      const res = await fetch("/api/lookups/organizers");
      const data = await res.json();
      setOrganizers(data);
    } catch {
      // Kein kritischer Fehler
    }
  }

  useEffect(() => {
    loadUsers();
    loadOrganizers();
  }, []);

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  // ── Veranstalter-Zuordnung laden ──────────────────────────────────────────

  async function openOrgEditor(userId: string) {
    setOrgEditingId(userId);
    setOrgLoading(true);
    try {
      const res = await fetch(`/api/admin/user-organizers/${userId}`);
      const ids: number[] = await res.json();
      setOrgAssignments((prev) => ({ ...prev, [userId]: ids }));
    } catch {
      setError("Fehler beim Laden der Veranstalter-Zuordnung.");
    } finally {
      setOrgLoading(false);
    }
  }

  function toggleOrgForUser(userId: string, orgId: number) {
    setOrgAssignments((prev) => {
      const current = prev[userId] ?? [];
      const updated = current.includes(orgId)
        ? current.filter((id) => id !== orgId)
        : [...current, orgId];
      return { ...prev, [userId]: updated };
    });
  }

  async function saveOrgAssignment(userId: string) {
    setOrgSaving(true);
    try {
      const organizerIds = orgAssignments[userId] ?? [];
      const res = await fetch(`/api/admin/user-organizers/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerIds }),
      });
      if (!res.ok) throw new Error();
      setOrgEditingId(null);
      showSuccess(
        organizerIds.length === 0
          ? "Zuordnung entfernt — Account hat vollen Zugriff (Super-Admin)."
          : `Zuordnung gespeichert: ${organizerIds.length} Veranstalter.`
      );
    } catch {
      setError("Fehler beim Speichern der Veranstalter-Zuordnung.");
    } finally {
      setOrgSaving(false);
    }
  }

  // ── Neuen Admin anlegen ───────────────────────────────────────────────────

  async function saveNew() {
    setAddError("");
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setAddError("Alle Felder müssen ausgefüllt sein.");
      return;
    }
    if (newPassword.length < 8) {
      setAddError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? "Fehler beim Anlegen."); return; }
      setNewName(""); setNewEmail(""); setNewPassword("");
      setIsAdding(false);
      await loadUsers();
      showSuccess("Admin-Account erfolgreich angelegt!");
    } catch {
      setAddError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setAddLoading(false);
    }
  }

  // ── Passwort ändern ───────────────────────────────────────────────────────

  async function savePassword(id: string) {
    setPwError("");
    if (newPw.length < 8) { setPwError("Das Passwort muss mindestens 8 Zeichen lang sein."); return; }
    if (newPw !== newPwConfirm) { setPwError("Die Passwörter stimmen nicht überein."); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error ?? "Fehler beim Speichern."); return; }
      setEditingId(null); setNewPw(""); setNewPwConfirm("");
      showSuccess("Passwort erfolgreich geändert!");
    } catch {
      setPwError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setPwLoading(false);
    }
  }

  // ── Admin löschen ─────────────────────────────────────────────────────────

  async function confirmDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Fehler beim Löschen."); setDeletingId(null); return; }
      setDeletingId(null);
      await loadUsers();
      showSuccess("Admin-Account erfolgreich gelöscht.");
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
      setDeletingId(null);
    }
  }

  async function toggleNotify(id: string, value: boolean) {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify: value }),
      });
      await loadUsers();
    } catch {
      setError("Fehler beim Speichern der Mail-Einstellung.");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <div className="p-4 text-gray-500">Lade Nutzer…</div>;

  return (
    <div className="space-y-4">

      {success && <div className="alert alert-success text-sm py-2">✅ {success}</div>}
      {error && (
        <div className="alert alert-error text-sm py-2">
          ❌ {error}
          <button className="ml-2 underline" onClick={() => setError("")}>Schließen</button>
        </div>
      )}

      {!isAdding && (
        <button className="btn btn-sm bg-green-600 text-white" onClick={() => setIsAdding(true)}>
          <PlusIcon className="h-4 w-4 mr-1" /> Neuen Admin anlegen
        </button>
      )}

      {isAdding && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-green-800">Neuen Admin anlegen</h3>
          {addError && <div className="alert alert-error text-sm py-2">❌ {addError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label"><span className="label-text font-medium">Name</span></label>
              <input type="text" className="input input-bordered w-full" placeholder="Max Mustermann"
                value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="label"><span className="label-text font-medium">E-Mail</span></label>
              <input type="email" className="input input-bordered w-full" placeholder="max@example.com"
                value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div>
              <label className="label"><span className="label-text font-medium">Passwort</span></label>
              <input type="password" className="input input-bordered w-full" placeholder="mind. 8 Zeichen"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNew()} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm bg-green-700 text-white" onClick={saveNew} disabled={addLoading}>
              {addLoading ? "Anlegen…" : "Anlegen"}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => {
              setIsAdding(false); setNewName(""); setNewEmail(""); setNewPassword(""); setAddError("");
            }}>Abbrechen</button>
          </div>
        </div>
      )}

      <table className="table table-compact w-full border-1">
        <thead className="font-bold border-b-2 text-black text-base">
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Angelegt am</th>
            <th>Mail-Info</th>
            <th>Veranstalter</th>
            <th className="w-48">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <React.Fragment key={u.id}>

              {/* Hauptzeile */}
              <tr className="border-t odd:bg-green-100 hover:bg-green-200">
                <td className="py-2 px-3">
                  {u.name}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Du</span>
                  )}
                </td>
                <td className="py-2 px-3 text-gray-600">{u.email}</td>
                <td className="py-2 px-3 text-gray-500 text-sm">
                  {new Date(u.createdAt).toLocaleDateString("de-DE")}
                </td>
                <td className="py-2 px-3">
                  <input type="checkbox" className="checkbox checkbox-sm"
                    checked={u.notify ?? false}
                    onChange={(e) => toggleNotify(u.id, e.target.checked)} />
                </td>

                {/* ← NEU: Veranstalter-Badge */}
                <td className="py-2 px-3">
                  {orgAssignments[u.id] !== undefined ? (
                    orgAssignments[u.id].length === 0 ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Super-Admin</span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        {orgAssignments[u.id].length} Veranstalter
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                  )}
                </td>

                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    {editingId === u.id ? (
                      <>
                        <button className="btn btn-xs bg-green-700 text-white"
                          onClick={() => savePassword(u.id)} disabled={pwLoading}>
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button className="btn btn-xs btn-ghost"
                          onClick={() => { setEditingId(null); setNewPw(""); setNewPwConfirm(""); setPwError(""); }}>
                          <XMarkIcon className="h-4 w-4 text-red-600" />
                        </button>
                      </>
                    ) : deletingId === u.id ? (
                      <>
                        <button className="btn btn-xs bg-red-600 text-white" onClick={() => confirmDelete(u.id)}>
                          <CheckIcon className="h-4 w-4" /> Ja, löschen
                        </button>
                        <button className="btn btn-xs btn-ghost" onClick={() => setDeletingId(null)}>
                          <XMarkIcon className="h-4 w-4" /> Abbrechen
                        </button>
                      </>
                    ) : (
                      <>
                        {/* ← NEU: Veranstalter-Button */}
                        <button className="btn btn-xs btn-ghost" title="Veranstalter zuordnen"
                          onClick={() => openOrgEditor(u.id)}>
                          <BuildingOfficeIcon className="h-4 w-4 text-amber-600" />
                        </button>
                        <button className="btn btn-xs btn-ghost" title="Passwort ändern"
                          onClick={() => { setEditingId(u.id); setNewPw(""); setNewPwConfirm(""); setPwError(""); }}>
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </button>
                        <button className="btn btn-xs btn-ghost" title="Admin löschen"
                          disabled={u.id === currentUserId} onClick={() => setDeletingId(u.id)}>
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>

              {/* ← NEU: Veranstalter-Zuordnung aufgeklappt */}
              {orgEditingId === u.id && (
                <tr className="bg-amber-50">
                  <td colSpan={6} className="px-3 py-4">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-amber-800">
                        🏢 Veranstalter-Zuordnung für {u.name}
                      </p>
                      <p className="text-xs text-amber-700">
                        Kein Häkchen gesetzt = Super-Admin (voller Zugriff auf alle Veranstalter).
                        Mindestens ein Häkchen = nur diese Veranstalter sind erlaubt.
                      </p>

                      {orgLoading ? (
                        <p className="text-sm text-gray-500 italic">Lade…</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {organizers.map((org) => (
                            <label key={org.id} className="flex items-center gap-2 cursor-pointer
                              bg-white border border-amber-200 rounded px-2 py-1.5 hover:bg-amber-100">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={(orgAssignments[u.id] ?? []).includes(org.id)}
                                onChange={() => toggleOrgForUser(u.id, org.id)}
                              />
                              <span className="text-sm text-gray-700">{org.name}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          className="btn btn-sm bg-amber-600 text-white"
                          onClick={() => saveOrgAssignment(u.id)}
                          disabled={orgSaving}
                        >
                          {orgSaving ? "Speichere…" : "Speichern"}
                        </button>
                        <button className="btn btn-sm btn-ghost"
                          onClick={() => setOrgEditingId(null)}>
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Passwort-Ändern-Zeile */}
              {editingId === u.id && (
                <tr className="bg-blue-50">
                  <td colSpan={6} className="px-3 py-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">Passwort ändern für {u.name}</p>
                      {pwError && <div className="alert alert-error text-sm py-1">❌ {pwError}</div>}
                      <div className="flex gap-3 flex-wrap">
                        <input type="password" className="input input-bordered input-sm w-56"
                          placeholder="Neues Passwort" value={newPw}
                          onChange={(e) => setNewPw(e.target.value)} />
                        <input type="password" className="input input-bordered input-sm w-56"
                          placeholder="Passwort wiederholen" value={newPwConfirm}
                          onChange={(e) => setNewPwConfirm(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && savePassword(u.id)} />
                        <button className="btn btn-sm bg-blue-600 text-white"
                          onClick={() => savePassword(u.id)} disabled={pwLoading}>
                          {pwLoading ? "Speichere…" : "Speichern"}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Löschen-Bestätigung */}
              {deletingId === u.id && (
                <tr className="bg-red-50">
                  <td colSpan={6} className="px-3 py-3">
                    <p className="text-sm font-semibold text-red-700">
                      ⚠️ Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                    </p>
                  </td>
                </tr>
              )}

            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
