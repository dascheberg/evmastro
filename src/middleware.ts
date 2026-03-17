import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {

  // Nur /admin-Routen schützen
  if (!context.url.pathname.startsWith("/admin")) {
    return next();
  }

  // Session prüfen
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  // Keine Session → zum Login weiterleiten
  if (!session) {
    return context.redirect("/login");
  }

  // Session in locals speichern, damit .astro-Seiten darauf zugreifen können
  context.locals.session = session;
  context.locals.user = session.user;

  return next();
});
