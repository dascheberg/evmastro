import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pgTable, jsonb, integer, timestamp, serial, text, date, boolean } from 'drizzle-orm/pg-core';

const organizers = pgTable("organizers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull()
});
const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull()
});
const eventTypes = pgTable("event_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull()
});
const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull()
});
const importLog = pgTable("import_log", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  count: integer("count").notNull(),
  events: jsonb("events").notNull()
});
const events = pgTable("events", {
  id: serial("id").primaryKey(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  timeId: integer("time_id").notNull().references(() => timeSlots.id),
  organizerId: integer("organizer_id").notNull().references(() => organizers.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  typeId: integer("type_id").notNull().references(() => eventTypes.id),
  recurrence: jsonb("recurrence"),
  notes: text("notes"),
  importId: integer("import_id").references(() => importLog.id)
});
const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  account,
  eventTypes,
  events,
  importLog,
  locations,
  organizers,
  session,
  timeSlots,
  user,
  verification
}, Symbol.toStringTag, { value: 'Module' }));

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Lb8ydjQHMu0e@ep-blue-truth-agkn3drw-pooler.c-2.eu-central-1.aws.neon.tech/event_manager?sslmode=verify-full"
});
const db = drizzle(pool, { schema });

export { events as a, account as b, db as d, eventTypes as e, importLog as i, locations as l, organizers as o, session as s, timeSlots as t, user as u, verification as v };
