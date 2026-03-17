import { a as auth } from './auth_CP-dz2xh.mjs';

const prerender = false;
const POST = async ({ request, redirect }) => {
  await auth.api.signOut({
    headers: request.headers,
    asResponse: true
  });
  return redirect("/");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
