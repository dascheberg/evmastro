import { a6 as defineMiddleware, af as sequence } from './chunks/sequence_BWwqfJV7.mjs';
import 'piccolore';
import 'clsx';
import { a as auth } from './chunks/auth_CP-dz2xh.mjs';

const onRequest$1 = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith("/admin")) {
    return next();
  }
  const session = await auth.api.getSession({
    headers: context.request.headers
  });
  if (!session) {
    return context.redirect("/login");
  }
  context.locals.session = session;
  context.locals.user = session.user;
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
