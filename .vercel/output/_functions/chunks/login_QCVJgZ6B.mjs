import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { a as auth } from './auth_CP-dz2xh.mjs';

const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  const session = await auth.api.getSession({
    headers: Astro2.request.headers
  });
  if (session) {
    return Astro2.redirect("/admin/events");
  }
  const error = Astro2.url.searchParams.get("error");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Login" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[80vh] flex items-center justify-center"> <div class="card bg-base-100 shadow-lg w-full max-w-sm p-8 space-y-6"> <div class="text-center"> <h1 class="text-2xl font-bold">Admin-Login</h1> <p class="text-sm text-gray-500 mt-1">Event Manager by abg</p> </div> ${error && renderTemplate`<div class="alert alert-error text-sm"> ${error === "invalid_credentials" ? "E-Mail oder Passwort falsch." : "Ein Fehler ist aufgetreten. Bitte erneut versuchen."} </div>`} <form method="POST" action="/api/auth/login" class="space-y-4"> <div> <label class="label"> <span class="label-text font-medium">E-Mail</span> </label> <input type="email" name="email" class="input input-bordered w-full" placeholder="admin@example.com" required autofocus> </div> <div> <label class="label"> <span class="label-text font-medium">Passwort</span> </label> <input type="password" name="password" class="input input-bordered w-full" placeholder="••••••••" required> </div> <button type="submit" class="btn bg-green-800 text-white w-full mt-2">
Einloggen
</button> </form> </div> </div> ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/login.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
