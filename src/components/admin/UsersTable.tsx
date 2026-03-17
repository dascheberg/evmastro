import React, { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

// ── Typen ─────────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type Props = {
  currentUserId: string;  // eingeloggter Nutzer darf sich nicht selbst löschen
};

// ── Komponente ────────────────────────────────────────────────────────────────

export function UsersTable({ currentUserId }: Props) {

  const [users, setUsers] = useState<AdminUser[]>([]);
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

  useEffect(() => { loadUsers(); }, []);

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
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
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error ?? "Fehler beim Anlegen.");
        return;
      }

      setNewName("");
      setNewEmail("");
      setNewPassword("");
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

    if (newPw.length < 8) {
      setPwError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (newPw !== newPwConfirm) {
      setPwError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPw }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPwError(data.error ?? "Fehler beim Speichern.");
        return;
      }

      setEditingId(null);
      setNewPw("");
      setNewPwConfirm("");
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
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Fehler beim Löschen.");
        setDeletingId(null);
        return;
      }

      setDeletingId(null);
      await loadUsers();
      showSuccess("Admin-Account erfolgreich gelöscht.");

    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
      setDeletingId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="p-4 text-gray-500">Lade Nutzer…</div>;
  }

  return (
    <div className="space-y-4">

      {/* Globale Meldungen */}
      {success && (
        <div className="alert alert-success text-sm py-2">✅ {success}</div>
      )}
      {error && (
        <div className="alert alert-error text-sm py-2">
          ❌ {error}
          <button className="ml-2 underline" onClick={() => setError("")}>
            Schließen
          </button>
        </div>
      )}

      {/* Neuen Admin anlegen Button */}
      {!isAdding && (
        <button
          className="btn btn-sm bg-green-600 text-white"
          onClick={() => setIsAdding(true)}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Neuen Admin anlegen
        </button>
      )}

      {/* Formular: Neuen Admin anlegen */}
      {isAdding && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-green-800">Neuen Admin anlegen</h3>

          {addError && (
            <div className="alert alert-error text-sm py-2">❌ {addError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-medium">Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Max Mustermann"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">E-Mail</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="max@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Passwort</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="mind. 8 Zeichen"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNew()}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-sm bg-green-700 text-white"
              onClick={saveNew}
              disabled={addLoading}
            >
              {addLoading ? "Anlegen…" : "Anlegen"}
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setIsAdding(false);
                setNewName("");
                setNewEmail("");
                setNewPassword("");
                setAddError("");
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Tabelle */}
      <table className="table table-compact w-full border-1">
        <thead className="font-bold border-b-2 text-black text-base">
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Angelegt am</th>
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
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Du
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-gray-600">{u.email}</td>
                <td className="py-2 px-3 text-gray-500 text-sm">
                  {new Date(u.createdAt).toLocaleDateString("de-DE")}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2">

                    {/* Passwort ändern */}
                    {editingId === u.id ? (
                      <>
                        <button
                          className="btn btn-xs bg-green-700 text-white"
                          onClick={() => savePassword(u.id)}
                          disabled={pwLoading}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => {
                            setEditingId(null);
                            setNewPw("");
                            setNewPwConfirm("");
                            setPwError("");
                          }}
                        >
                          <XMarkIcon className="h-4 w-4 text-red-600" />
                        </button>
                      </>
                    ) : deletingId === u.id ? (
                      <>
                        <button
                          className="btn btn-xs bg-red-600 text-white"
                          onClick={() => confirmDelete(u.id)}
                        >
                          <CheckIcon className="h-4 w-4" />
                          Ja, löschen
                        </button>
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => setDeletingId(null)}
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Abbrechen
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-xs btn-ghost"
                          title="Passwort ändern"
                          onClick={() => {
                            setEditingId(u.id);
                            setNewPw("");
                            setNewPwConfirm("");
                            setPwError("");
                          }}
                        >
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost"
                          title="Admin löschen"
                          disabled={u.id === currentUserId}
                          onClick={() => setDeletingId(u.id)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>

              {/* Passwort-Ändern-Zeile (inline, klappt auf) */}
              {editingId === u.id && (
                <tr className="bg-blue-50">
                  <td colSpan={4} className="px-3 py-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">
                        Passwort ändern für {u.name}
                      </p>
                      {pwError && (
                        <div className="alert alert-error text-sm py-1">
                          ❌ {pwError}
                        </div>
                      )}
                      <div className="flex gap-3 flex-wrap">
                        <input
                          type="password"
                          className="input input-bordered input-sm w-56"
                          placeholder="Neues Passwort"
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                        />
                        <input
                          type="password"
                          className="input input-bordered input-sm w-56"
                          placeholder="Passwort wiederholen"
                          value={newPwConfirm}
                          onChange={(e) => setNewPwConfirm(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && savePassword(u.id)}
                        />
                        <button
                          className="btn btn-sm bg-blue-600 text-white"
                          onClick={() => savePassword(u.id)}
                          disabled={pwLoading}
                        >
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
                  <td colSpan={4} className="px-3 py-3">
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ Soll der Account von <strong>{u.name}</strong> ({u.email}) wirklich gelöscht werden?
                    </p>
                  </td>
                </tr>
              )}

            </React.Fragment>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-6 text-gray-400">
                Keine Admin-Accounts gefunden.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
