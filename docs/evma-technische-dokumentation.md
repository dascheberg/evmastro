# EvMA – Technische Dokumentation

**Veranstaltungskalender Gemeinde Schmalfeld**  
Version: 1.0 | Stand: März 2026

---

## 1. Überblick

EvMA ist ein webbasierter Veranstaltungskalender für die Gemeinde Schmalfeld. Die Anwendung ermöglicht Admins das Verwalten von Veranstaltungen und bietet der Öffentlichkeit eine übersichtliche Kalenderansicht.

**Produktiv-URL:** `https://www.gemeinde24640.de`  
**Repository:** lokal unter `~/dev/evmastro`

---

## 2. Technischer Stack

| Komponente | Technologie | Version |
|---|---|---|
| Framework | Astro (SSR) | 5.18.1 |
| UI-Komponenten | React | 18.3.1 |
| Sprache | TypeScript | – |
| Styling | TailwindCSS + DaisyUI | 4.x / 5.x |
| Datenbank | PostgreSQL (Neon) | – |
| ORM | Drizzle ORM | 0.45.x |
| Authentifizierung | Better Auth | 1.5.x |
| E-Mail | Resend | 4.5.x |
| Deployment | Vercel | – |

> **Wichtig:** Versions-Pins in `package.json` nicht mit `^` erhöhen — insbesondere Astro nicht über 5.18 und React nicht über 18.3.1.

---

## 3. Projektstruktur

```
evmastro/
├── scripts/
│   └── reset-passwords.ts       # Admin-Passwörter zurücksetzen
├── src/
│   ├── components/
│   │   ├── admin/               # ImportsTable, UsersTable
│   │   ├── dashboard/           # CalendarWidget, DashboardApp, Widgets
│   │   ├── events/              # EventForm, EventsTable, EventsAdminPage
│   │   ├── import/              # ImportFlow, DuplicatesStep, MappingMask
│   │   ├── lookups/             # LookupsTable
│   │   └── utils/               # LookupCombobox, LookupLabel
│   ├── db/
│   │   ├── index.ts             # Drizzle-Verbindung
│   │   └── schema.ts            # Datenbankschema
│   ├── layouts/
│   │   └── BaseLayout.astro     # Navigation, Footer
│   ├── lib/
│   │   ├── auth.ts              # Better Auth Konfiguration
│   │   └── email.ts             # Resend E-Mail-Versand
│   ├── middleware.ts            # Admin-Schutz
│   ├── pages/
│   │   ├── admin/               # Geschützte Admin-Seiten
│   │   ├── api/                 # API-Endpunkte
│   │   └── events/              # Öffentliche Detailseite
│   ├── store/                   # Zustand für Import-Workflow
│   └── utils/                   # calendar.ts, eventDisplay.ts, recurrence.ts
└── package.json
```

---

## 4. Datenbank

### Verbindung
Die Datenbank läuft bei **Neon** (serverless PostgreSQL).  
Verbindungsstring in `.env.local` / Vercel:

```
DATABASE_URL=postgresql://neondb_owner:PASSWORT@ep-....neon.tech/event_manager?sslmode=verify-full
```

> **Wichtig:** Die Datenbank heißt `event_manager`, nicht `neondb`!

### Schema-Übersicht

| Tabelle | Inhalt |
|---|---|
| `events` | Veranstaltungen (startDate, endDate, organizerId, locationId, typeId, timeId, notes, recurrence, importId) |
| `organizers` | Veranstalter-Lookup |
| `locations` | Orte-Lookup |
| `event_types` | Veranstaltungsarten-Lookup |
| `time_slots` | Zeitfenster-Lookup |
| `import_log` | Import-Protokoll |
| `user` | Admin-Benutzer (inkl. `notify`-Flag für E-Mail-Benachrichtigungen) |
| `session` | Better Auth Sessions |
| `account` | Better Auth Accounts (inkl. Passwort-Hash) |
| `verification` | Better Auth Verifikations-Tokens |

### Migration nach Schemaänderung
```bash
npm run db:push
```

---

## 5. Authentifizierung

Better Auth übernimmt Login, Session-Management und Passwort-Hashing.

### Konfiguration (`src/lib/auth.ts`)
- `trustedOrigins`: Alle erlaubten Ursprungs-URLs (localhost + Produktiv-Domain)
- `baseURL`: Muss exakt mit der URL im Browser übereinstimmen
- `secret`: Zufälliger Secret-String

### Admin-Schutz
Die Middleware (`src/middleware.ts`) schützt alle Routen unter `/admin`. Nicht eingeloggte Benutzer werden zu `/login` weitergeleitet.

### Passwörter zurücksetzen
Falls Admins sich nicht mehr einloggen können:

```bash
# 1. In Neon alle User löschen
DELETE FROM session;
DELETE FROM account WHERE "userId" IN (SELECT id FROM "user");
DELETE FROM "user";

# 2. Script ausführen
npx tsx scripts/reset-passwords.ts
```

> Die Passwörter in `scripts/reset-passwords.ts` vorher anpassen!

---

## 6. E-Mail-Benachrichtigungen (Resend)

### Funktionsweise
Bei folgenden Ereignissen wird automatisch eine E-Mail verschickt:
- Neues Event anlegen
- Event bearbeiten
- Event löschen
- CSV/Excel-Import

Empfänger sind alle Admin-User mit aktiviertem `notify`-Flag (einstellbar in der Admin-Verwaltung).

### Konfiguration
| Variable | Wert |
|---|---|
| `RESEND_API_KEY` | API-Key von resend.com |
| `NOTIFY_FROM_EMAIL` | `EvMA Schmalfeld <noreply@gemeinde24640.de>` |
| `PUBLIC_BASE_URL` | `https://www.gemeinde24640.de` |

### DNS-Einträge (Strato / gemeinde24640.de)
| Typ | Name | Wert |
|---|---|---|
| TXT | `resend._domainkey` | DKIM-Wert von Resend |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| MX (Subdomain `send`) | – | `feedback-smtp.eu-west-1.amazonses.com` |

---

## 7. Deployment

### Vercel Environment Variables
Folgende Variablen müssen in Vercel gesetzt sein:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://www.gemeinde24640.de
RESEND_API_KEY=re_...
NOTIFY_FROM_EMAIL=EvMA Schmalfeld <noreply@gemeinde24640.de>
PUBLIC_BASE_URL=https://www.gemeinde24640.de
```

### Deploy-Prozess
```bash
git add .
git commit -m "beschreibung"
git push
```
Vercel deployed automatisch nach jedem Push auf `main`.

### Lokale Entwicklung
```bash
npm run dev
# → http://localhost:4321
```

`.env.local` für lokale Entwicklung:
```
DATABASE_URL=postgresql://...event_manager?sslmode=verify-full
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:4321
RESEND_API_KEY=re_...
NOTIFY_FROM_EMAIL=EvMA Schmalfeld <noreply@gemeinde24640.de>
PUBLIC_BASE_URL=http://localhost:4321
```

---

## 8. Öffentliche API

Externe Websites können Events ohne Login abrufen:

```
GET /api/public/events
```

**Parameter:**
| Parameter | Beschreibung | Beispiel |
|---|---|---|
| `from` | Startdatum (Standard: heute) | `2025-01-01` |
| `to` | Enddatum | `2025-12-31` |
| `search` | Freitextsuche | `Feuerwehr` |
| `organizer` | Filter Veranstalter | `Sportverein` |
| `location` | Filter Ort | `Gemeindehaus` |
| `type` | Filter Veranstaltungsart | `Vortrag` |
| `limit` | Max. Ergebnisse (Standard: 50, max: 200) | `100` |

**iCal-Feed:**
```
GET /api/events-ical
```

---

## 9. Bekannte Einschränkungen / Offene Punkte

- **Recurrence-UI:** Das `recurrence`-Feld existiert in der Datenbank und wird angezeigt, aber die Eingabe-Maske im EventForm ist noch nicht implementiert.
- **notes-Spalte:** Das `notes`-Feld ist in der Datenbank vorhanden und wird in der Detailansicht angezeigt, aber bewusst nicht in der EventsTable-Spaltenansicht.

---

## 10. Wichtige npm-Befehle

```bash
npm run dev          # Lokaler Entwicklungsserver
npm run build        # Production-Build
npm run db:push      # Datenbankschema synchronisieren

# Bei npm install immer:
npm install PAKET --legacy-peer-deps
```
