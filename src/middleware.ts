import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import { db } from "./db";
import { userOrganizers } from "./db/schema";
import { eq } from "drizzle-orm";

export const onRequest = defineMiddleware(async (context, next) => {

  // Session laden — für alle Routen die eine Session haben könnten
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (session) {
    // Session in locals speichern
    context.locals.session = session;
    context.locals.user = session.user;

    // Erlaubte Veranstalter-IDs laden (für alle authentifizierten Requests)
    const rows = await db
      .select({ organizerId: userOrganizers.organizerId })
      .from(userOrganizers)
      .where(eq(userOrganizers.userId, session.user.id));

    context.locals.allowedOrganizerIds = rows.length > 0
      ? rows.map((r) => r.organizerId)
      : null; // null = Super-Admin, darf alles
  } else {
    context.locals.allowedOrganizerIds = null;
  }

  // /admin-Routen nur mit Session erlauben
  if (context.url.pathname.startsWith("/admin")) {
    if (!session) {
      return context.redirect("/login");
    }
  }

  return next();
});
