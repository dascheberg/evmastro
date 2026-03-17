import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { b5 as renderHead, a2 as addAttribute, F as Fragment, L as renderTemplate, b6 as renderSlot } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { a as auth } from './auth_CP-dz2xh.mjs';

const $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "Event Manager by abg" } = Astro2.props;
  const current = Astro2.url.pathname;
  const session = await auth.api.getSession({
    headers: Astro2.request.headers
  });
  const isLoggedIn = !!session;
  const isAdmin = current.startsWith("/admin");
  return renderTemplate`<html lang="de" data-theme="light"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen flex flex-col bg-base-200"> <nav class="navbar bg-base-100 shadow"> <div class="navbar-start"> <div class="dropdown"> <label tabindex="0" class="btn btn-ghost lg:hidden"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </label> <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"> <li class="menu-title"><span>Bereich</span></li> <li> <a href="/"${addAttribute(current === "/" ? "font-bold" : "", "class")}>Dashboard</a> </li> <li> <a href="/user"${addAttribute(current.startsWith("/user") ? "font-bold" : "", "class")}>Veranstaltungen</a> </li> ${isLoggedIn && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate` <li class="menu-title mt-2"> <span class="text-red-600">Admin</span> </li> <li> <a href="/admin/events"${addAttribute(`text-red-600 ${current === "/admin/events" ? "font-bold" : ""}`, "class")}>
Veranstaltungen verwalten
</a> </li> <li> <a href="/admin/lookups"${addAttribute(`text-red-600 ${current === "/admin/lookups" ? "font-bold" : ""}`, "class")}>
Lookup-Tabellen
</a> </li> <li> <a href="/admin/import"${addAttribute(`text-red-600 ${current === "/admin/import" ? "font-bold" : ""}`, "class")}>
Daten-Import
</a> </li> <li> <a href="/admin/imports"${addAttribute(`text-red-600 ${current === "/admin/imports" ? "font-bold" : ""}`, "class")}>
Import-Übersicht
</a> </li> <li> <a href="/admin/users"${addAttribute(`text-red-600 ${current === "/admin/users" ? "font-bold" : ""}`, "class")}>
Admin-Verwaltung
</a> </li> ` })}`} </ul> </div> <a href="/" class="btn btn-ghost normal-case text-xl">Event Manager by abg</a> </div> <div class="navbar-center hidden lg:flex"> <ul class="menu menu-horizontal px-1 gap-1"> <li> <a href="/"${addAttribute(current === "/" ? "font-bold" : "", "class")}>Dashboard</a> </li> <li> <a href="/user"${addAttribute(current.startsWith("/user") ? "font-bold" : "", "class")}>Veranstaltungen</a> </li> ${isLoggedIn && renderTemplate`<li> <details> <summary${addAttribute(`text-red-600 font-semibold ${isAdmin ? "font-bold" : ""}`, "class")}>
Admin
</summary> <ul class="bg-base-100 rounded-box shadow z-[1] w-56 p-2"> <li> <a href="/admin/events"${addAttribute(`text-red-600 ${current === "/admin/events" ? "font-bold" : ""}`, "class")}>
Veranstaltungen verwalten
</a> </li> <li> <a href="/admin/lookups"${addAttribute(`text-red-600 ${current === "/admin/lookups" ? "font-bold" : ""}`, "class")}>
Lookup-Tabellen
</a> </li> <li> <a href="/admin/import"${addAttribute(`text-red-600 ${current === "/admin/import" ? "font-bold" : ""}`, "class")}>
Daten-Import
</a> </li> <li> <a href="/admin/imports"${addAttribute(`text-red-600 ${current === "/admin/imports" ? "font-bold" : ""}`, "class")}>
Import-Übersicht
</a> </li> <li> <a href="/admin/users"${addAttribute(`text-red-600 ${current === "/admin/users" ? "font-bold" : ""}`, "class")}>
Admin-Verwaltung
</a> </li> </ul> </details> </li>`} </ul> </div> <div class="navbar-end gap-2"> ${isLoggedIn ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate` <span class="text-sm text-gray-500 hidden md:block"> ${session.user.name || session.user.email} </span> <form method="POST" action="/api/auth/logout"> <button type="submit" class="btn btn-sm btn-ghost text-red-600">
Logout
</button> </form> ` })}` : renderTemplate`<a href="/login" class="btn btn-sm btn-outline">
Admin-Login
</a>`} </div> </nav> <main class="flex-1 p-4"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="footer footer-center p-4 bg-base-100 text-base-content"> <aside> <p>© ${(/* @__PURE__ */ new Date()).getFullYear()} – Datenschutzerklärung – Impressum</p> </aside> </footer> </body></html>`;
}, "/home/dieter/dev/evmastro/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
