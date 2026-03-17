import { a as auth } from './auth_CP-dz2xh.mjs';

const prerender = false;
const ALL = async (ctx) => {
  return auth.handler(ctx.request);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
