import { a as auth } from './auth_CP-dz2xh.mjs';

const prerender = false;
const POST = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";
  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: request.headers,
      asResponse: true
      // gibt direkt eine Response mit Set-Cookie zurück
    });
    if (!response.ok) {
      return redirect("/login?error=invalid_credentials");
    }
    const setCookie = response.headers.get("set-cookie");
    const headers = new Headers({ Location: "/admin/events" });
    if (setCookie) headers.set("set-cookie", setCookie);
    return new Response(null, { status: 302, headers });
  } catch {
    return redirect("/login?error=server_error");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
