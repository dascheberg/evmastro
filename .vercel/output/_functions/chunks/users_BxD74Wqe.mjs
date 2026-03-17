import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React, { useState, useEffect } from 'react';
import { PlusIcon, CheckIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { a as auth } from './auth_CP-dz2xh.mjs';

function UsersTable({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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
  useEffect(() => {
    loadUsers();
  }, []);
  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3e3);
  }
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
          password: newPassword
        })
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
  async function savePassword(id) {
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
        body: JSON.stringify({ password: newPw })
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
  async function confirmDelete(id) {
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
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 text-gray-500", children: "Lade Nutzer…" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    success && /* @__PURE__ */ jsxs("div", { className: "alert alert-success text-sm py-2", children: [
      "✅ ",
      success
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "alert alert-error text-sm py-2", children: [
      "❌ ",
      error,
      /* @__PURE__ */ jsx("button", { className: "ml-2 underline", onClick: () => setError(""), children: "Schließen" })
    ] }),
    !isAdding && /* @__PURE__ */ jsxs(
      "button",
      {
        className: "btn btn-sm bg-green-600 text-white",
        onClick: () => setIsAdding(true),
        children: [
          /* @__PURE__ */ jsx(PlusIcon, { className: "h-4 w-4 mr-1" }),
          "Neuen Admin anlegen"
        ]
      }
    ),
    isAdding && /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-green-800", children: "Neuen Admin anlegen" }),
      addError && /* @__PURE__ */ jsxs("div", { className: "alert alert-error text-sm py-2", children: [
        "❌ ",
        addError
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Name" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "input input-bordered w-full",
              placeholder: "Max Mustermann",
              value: newName,
              onChange: (e) => setNewName(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "E-Mail" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              className: "input input-bordered w-full",
              placeholder: "max@example.com",
              value: newEmail,
              onChange: (e) => setNewEmail(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Passwort" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              className: "input input-bordered w-full",
              placeholder: "mind. 8 Zeichen",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && saveNew()
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm bg-green-700 text-white",
            onClick: saveNew,
            disabled: addLoading,
            children: addLoading ? "Anlegen…" : "Anlegen"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm btn-ghost",
            onClick: () => {
              setIsAdding(false);
              setNewName("");
              setNewEmail("");
              setNewPassword("");
              setAddError("");
            },
            children: "Abbrechen"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("table", { className: "table table-compact w-full border-1", children: [
      /* @__PURE__ */ jsx("thead", { className: "font-bold border-b-2 text-black text-base", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Name" }),
        /* @__PURE__ */ jsx("th", { children: "E-Mail" }),
        /* @__PURE__ */ jsx("th", { children: "Angelegt am" }),
        /* @__PURE__ */ jsx("th", { className: "w-48", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        users.map((u) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-t odd:bg-green-100 hover:bg-green-200", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-2 px-3", children: [
              u.name,
              u.id === currentUserId && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded", children: "Du" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: u.email }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-500 text-sm", children: new Date(u.createdAt).toLocaleDateString("de-DE") }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: editingId === u.id ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-xs bg-green-700 text-white",
                  onClick: () => savePassword(u.id),
                  disabled: pwLoading,
                  children: /* @__PURE__ */ jsx(CheckIcon, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-xs btn-ghost",
                  onClick: () => {
                    setEditingId(null);
                    setNewPw("");
                    setNewPwConfirm("");
                    setPwError("");
                  },
                  children: /* @__PURE__ */ jsx(XMarkIcon, { className: "h-4 w-4 text-red-600" })
                }
              )
            ] }) : deletingId === u.id ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "btn btn-xs bg-red-600 text-white",
                  onClick: () => confirmDelete(u.id),
                  children: [
                    /* @__PURE__ */ jsx(CheckIcon, { className: "h-4 w-4" }),
                    "Ja, löschen"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "btn btn-xs btn-ghost",
                  onClick: () => setDeletingId(null),
                  children: [
                    /* @__PURE__ */ jsx(XMarkIcon, { className: "h-4 w-4" }),
                    "Abbrechen"
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-xs btn-ghost",
                  title: "Passwort ändern",
                  onClick: () => {
                    setEditingId(u.id);
                    setNewPw("");
                    setNewPwConfirm("");
                    setPwError("");
                  },
                  children: /* @__PURE__ */ jsx(PencilIcon, { className: "h-4 w-4 text-blue-600" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-xs btn-ghost",
                  title: "Admin löschen",
                  disabled: u.id === currentUserId,
                  onClick: () => setDeletingId(u.id),
                  children: /* @__PURE__ */ jsx(TrashIcon, { className: "h-4 w-4 text-red-500" })
                }
              )
            ] }) }) })
          ] }),
          editingId === u.id && /* @__PURE__ */ jsx("tr", { className: "bg-blue-50", children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-3 py-3", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-blue-800", children: [
              "Passwort ändern für ",
              u.name
            ] }),
            pwError && /* @__PURE__ */ jsxs("div", { className: "alert alert-error text-sm py-1", children: [
              "❌ ",
              pwError
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  className: "input input-bordered input-sm w-56",
                  placeholder: "Neues Passwort",
                  value: newPw,
                  onChange: (e) => setNewPw(e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  className: "input input-bordered input-sm w-56",
                  placeholder: "Passwort wiederholen",
                  value: newPwConfirm,
                  onChange: (e) => setNewPwConfirm(e.target.value),
                  onKeyDown: (e) => e.key === "Enter" && savePassword(u.id)
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-sm bg-blue-600 text-white",
                  onClick: () => savePassword(u.id),
                  disabled: pwLoading,
                  children: pwLoading ? "Speichere…" : "Speichern"
                }
              )
            ] })
          ] }) }) }),
          deletingId === u.id && /* @__PURE__ */ jsx("tr", { className: "bg-red-50", children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-3 py-3", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-700 font-medium", children: [
            "⚠️ Soll der Account von ",
            /* @__PURE__ */ jsx("strong", { children: u.name }),
            " (",
            u.email,
            ") wirklich gelöscht werden?"
          ] }) }) })
        ] }, u.id)),
        users.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "text-center py-6 text-gray-400", children: "Keine Admin-Accounts gefunden." }) })
      ] })
    ] })
  ] });
}

const prerender = false;
const $$Users = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Users;
  const session = await auth.api.getSession({
    headers: Astro2.request.headers
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Admin-Verwaltung" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-4"> <h1 class="text-2xl font-bold">Admin-Verwaltung</h1> <p class="text-gray-500 text-sm">
Hier kannst du Admin-Accounts anlegen, Passwörter ändern und Accounts
      löschen. Jeder Account hat vollen Zugriff auf den Admin-Bereich.
</p> ${renderComponent($$result2, "UsersTable", UsersTable, { "currentUserId": session?.user.id ?? "", "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/dieter/dev/evmastro/src/components/admin/UsersTable", "client:component-export": "UsersTable" })} </div> ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/admin/users.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/admin/users.astro";
const $$url = "/admin/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Users,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
