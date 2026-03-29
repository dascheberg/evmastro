# EvMA – Technische Dokumentation

**Veranstaltungskalender Gemeinde Schmalfeld**
Version: 1.1 | Stand: März 2026

---

## 1. Überblick

EvMA ist ein webbasierter Veranstaltungskalender für die Gemeinde Schmalfeld. Die Anwendung ermöglicht Admins das Verwalten von Veranstaltungen und bietet der Öffentlichkeit eine übersichtliche Kalenderansicht.

**Produktiv-URL:** `https://www.gemeinde24640.de`
**Repository:** lokal unter `~/dev/evmastro`
<!-- liste dir die sinnvollsten Optionen auf:
Empfehlungen nach Anwendungsfall
1. VS Code (du hast es schon!) — für Entwickler ideal
Du brauchst gar nichts neues installieren. VS Code hat eingebaut:

Ctrl+Shift+V → Live-Vorschau in separatem Tab
Ctrl+K V → Vorschau neben dem Editor (Split View)
Extension "Markdown All in One" empfohlen: TOC, Shortcuts, Lint

Für deine Projektdokumentation (EvMA, scschmalfeld etc.) ist das die naheliegendste Wahl, weil alles im selben Fenster bleibt.
 -->
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

> **Wichtig:** Versions-Pins in `package.json` nicht erhöhen — insbesondere Astro nicht über 5.18 und React nicht über 18.3.1. Immer `--legacy-peer-deps` bei `npm install` verwenden.

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

### Wichtige Regeln
- Passwörter **niemals** mit `bcryptjs` direkt hashen — immer über Better Auth's eigenen Mechanismus (`auth.$context` → `ctx.password.hash`)
- Alle fetch-Aufrufe (POST, PUT, DELETE) müssen den Header `Content-Type: application/json` setzen, sonst blockt Better Auth den Request mit 403
- Login-Formular als JavaScript-fetch statt HTML-Form-Submit, da Better Auth Form-POSTs als CSRF blockiert

### Admin-Schutz
Die Middleware (`src/middleware.ts`) schützt alle Routen unter `/admin`. Nicht eingeloggte Benutzer werden zu `/login` weitergeleitet.

### Passwörter zurücksetzen
Falls Admins sich nicht mehr einloggen können:

```bash
# 1. In Neon alle User löschen
DELETE FROM session;
DELETE FROM account WHERE "userId" IN (SELECT id FROM "user");
DELETE FROM "user";

# 2. Script ausführen (liest .env.local)
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

Empfänger sind alle Admin-User mit aktiviertem `notify`-Flag (einstellbar in der Admin-Verwaltung unter Verwaltung → Benutzer).

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
| MX (Subdomain `send.gemeinde24640.de`) | – | `feedback-smtp.eu-west-1.amazonses.com` |

> **Wichtig:** Der MX-Eintrag gehört auf die Subdomain `send.gemeinde24640.de`, nicht auf die Hauptdomain. Bei Strato: neue Subdomain `send` anlegen, dort den MX-Eintrag setzen.

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

## 8. Import-System

### Dateiverarbeitung (`src/lib/import/readFile.ts`)
- Unterstützt CSV (Semikolon-getrennt) und Excel (.xlsx)
- Excel-Zeitwerte (Bruchteil eines Tages, z.B. `0.75` für 18:00) werden automatisch in Zeitstrings umgewandelt
- Excel-Datumsseriennummern (z.B. `46023` für 01.01.2026) werden automatisch in ISO-Datumsstrings umgewandelt (Bereich 40000–60000 = ca. 2009–2064)
- Leere Spalten und leere Zeilen werden automatisch entfernt

### Veranstalter-Modi
Der Import unterstützt zwei Modi:

**Ein Veranstalter:** Alle Events in der Datei gehören zum selben Veranstalter, der vor dem Upload ausgewählt wird.

**Mehrere Veranstalter:** Die Datei enthält eine Spalte mit Veranstalternamen. Diese wird beim Mapping als Pflichtfeld zugeordnet. Unbekannte Veranstalternamen können im Schritt "Unbekannte Werte" neu angelegt oder verworfen werden.

### Normalisierung (`src/lib/import/normalize.ts`)
- Deutsches Datumsformat (`01.04.2025`) → ISO (`2025-04-01`)
- ISO-Format wird direkt übernommen
- Ungültige Datumswerte → Zeile wird verworfen

---

## 9. Öffentliche API

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

## 10. Bekannte Einschränkungen / Offene Punkte

- **Recurrence-UI:** Das `recurrence`-Feld existiert in der Datenbank und wird angezeigt, aber die Eingabe-Maske im EventForm ist noch nicht implementiert.
- **notes-Spalte:** Das `notes`-Feld ist in der Datenbank vorhanden und wird in der Detailansicht angezeigt, aber bewusst nicht in der EventsTable-Spaltenansicht.

---

## 11. Wichtige npm-Befehle

```bash
npm run dev          # Lokaler Entwicklungsserver
npm run build        # Production-Build
npm run db:push      # Datenbankschema synchronisieren

# Bei npm install immer:
npm install PAKET --legacy-peer-deps
```
