import {
  pgTable,
  serial,
  text,
  date,
  integer,
  timestamp,
  jsonb
} from "drizzle-orm/pg-core";

export const organizers = pgTable("organizers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const eventTypes = pgTable("event_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// 🔥 KORREKTUR: import_log vollständig
export const importLog = pgTable("import_log", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  count: integer("count").notNull(),
  events: jsonb("events").notNull(), // JSONB array of event IDs
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),

  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),

  timeId: integer("time_id")
    .notNull()
    .references(() => timeSlots.id),

  organizerId: integer("organizer_id")
    .notNull()
    .references(() => organizers.id),

  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id),

  typeId: integer("type_id")
    .notNull()
    .references(() => eventTypes.id),

  recurrence: jsonb("recurrence"), // optional, JSONB empfohlen
  notes: text("notes"),

  importId: integer("import_id").references(() => importLog.id),
});
