import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';

const prerender = false;
const $$Lookups = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Hilfstabellen" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h2 class="text-2xl font-semibold mb-4">Hilfstabellen‑Übersicht</h2> <div class="pl-24 py-4 pr-4 grid grid-cols-4 gap-4"> <div> <div class="text-2xl font-bold underline">Veranstalter</div> ${renderComponent($$result2, "LookupTable", null, { "api": "/api/lookups/organizers", "title": "Veranstalter", "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/dieter/dev/evmastro/src/components/lookups/LookupsTable", "client:component-export": "LookupTable" })} </div> <div> <div class="text-2xl font-bold underline">Veranstaltungsorte</div> ${renderComponent($$result2, "LookupTable", null, { "api": "/api/lookups/locations", "title": "Veranstaltungsorte", "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/dieter/dev/evmastro/src/components/lookups/LookupsTable", "client:component-export": "LookupTable" })} </div> <div> <div class="text-2xl font-bold underline">Veranstaltungsarten</div> ${renderComponent($$result2, "LookupTable", null, { "api": "/api/lookups/eventTypes", "title": "Veranstaltungsarten", "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/dieter/dev/evmastro/src/components/lookups/LookupsTable", "client:component-export": "LookupTable" })} </div> <div> <div class="text-2xl font-bold underline">Uhrzeiten</div> ${renderComponent($$result2, "LookupTable", null, { "api": "/api/lookups/timeSlots", "title": "Uhrzeiten", "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/dieter/dev/evmastro/src/components/lookups/LookupsTable", "client:component-export": "LookupTable" })} </div> </div> ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/admin/lookups.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/admin/lookups.astro";
const $$url = "/admin/lookups";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Lookups,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
