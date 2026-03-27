# EvMA – Admin-Handbuch

**Veranstaltungskalender Gemeinde Schmalfeld**
Version: 1.1 | Stand: März 2026

---

## 1. Zugang

Die Anwendung ist erreichbar unter:
**https://www.gemeinde24640.de**

Der Admin-Bereich ist passwortgeschützt. Der Login erfolgt unter:
**https://www.gemeinde24640.de/login**

---

## 2. Login

1. Seite `https://www.gemeinde24640.de/login` aufrufen
2. E-Mail-Adresse und Passwort eingeben
3. Auf **Einloggen** klicken

Nach erfolgreichem Login landet man automatisch im Admin-Dashboard.

> **Hinweis:** Bei falschem Passwort erscheint eine Fehlermeldung. Bei Problemen bitte den Administrator kontaktieren.

### Passwort vergessen?
Das Zurücksetzen erfolgt durch den technischen Administrator. Bitte eine E-Mail an `progdieter@dascheberg.de` senden.

### Ausloggen
Oben rechts in der Navigation auf **Logout** klicken.

---

## 3. Navigation

Nach dem Login stehen folgende Bereiche zur Verfügung:

| Menüpunkt | Beschreibung |
|---|---|
| **Dashboard** | Übersicht mit Statistiken und Kalender |
| **Veranstaltungen** | Veranstaltungen anlegen, bearbeiten, löschen |
| **Import** | CSV/Excel-Dateien importieren |
| **Stammdaten** | Veranstalter, Orte, Typen, Zeitfenster verwalten |
| **Verwaltung** | Benutzer und Import-Protokolle |

---

## 4. Dashboard

Das Dashboard zeigt auf einen Blick:
- Anzahl aller Veranstaltungen
- Veranstaltungen pro Veranstalter / Ort / Typ
- Monatskalender mit Veranstaltungstagen
- Nächste anstehende Veranstaltungen

---

## 5. Veranstaltungen verwalten

### 5.1 Veranstaltung anlegen

1. Im Menü **Veranstaltungen** auswählen
2. Rechts erscheint das Eingabeformular
3. Pflichtfelder ausfüllen:
   - **Startdatum** (Pflicht)
   - **Enddatum** (optional)
   - **Veranstalter** (Pflicht)
   - **Ort** (Pflicht)
   - **Typ** (Pflicht)
   - **Zeitfenster** (Pflicht)
   - **Bemerkung** (optional)
4. Auf **Speichern** klicken

> **Hinweis:** Veranstalter, Orte, Typen und Zeitfenster können direkt im Formular neu angelegt werden — einfach den gewünschten Namen eintippen und auf **Neu anlegen** klicken.

### 5.2 Veranstaltung bearbeiten

1. In der Tabelle links die gewünschte Veranstaltung suchen
2. Auf das **Stift-Symbol** (🖊) in der Zeile klicken
3. Daten im Formular rechts anpassen
4. Auf **Speichern** klicken

### 5.3 Veranstaltung löschen

1. In der Tabelle links die gewünschte Veranstaltung suchen
2. Auf das **Papierkorb-Symbol** (🗑) in der Zeile klicken
3. Im Bestätigungsdialog die Angaben prüfen
4. Auf **OK** klicken

> **Achtung:** Das Löschen kann nicht rückgängig gemacht werden!

### 5.4 Suchen und Filtern

Die Tabelle bietet folgende Filtermöglichkeiten:
- **Freitextsuche:** Sucht in Veranstalter, Ort, Typ und Bemerkung
- **Veranstalter-Filter:** Dropdown zur Auswahl
- **Ort-Filter:** Dropdown zur Auswahl
- **Typ-Filter:** Dropdown zur Auswahl
- **Datum von/bis:** Zeitraum einschränken
- **Alle Filter zurücksetzen:** Setzt alle Filter auf einmal zurück

---

## 6. Import

Mit der Import-Funktion können Veranstaltungen aus CSV- oder Excel-Dateien massenweise importiert werden.

### 6.1 Datei vorbereiten

Die Datei muss folgende Spalten enthalten (Bezeichnungen können variieren, werden beim Import zugeordnet):

| Spalte | Beschreibung |
|---|---|
| Startdatum | Datum der Veranstaltung (z.B. `01.04.2025`) |
| Enddatum | Ende der Veranstaltung (optional) |
| Veranstalter | Name des Veranstalters (bei Mehrfach-Modus Pflicht) |
| Ort | Veranstaltungsort |
| Typ | Art der Veranstaltung |
| Zeitfenster | z.B. `Vormittag`, `Nachmittag` |
| Bemerkung | Optionaler Freitext |

> **Hinweis zu Excel-Dateien:** Datumsfelder die intern als Seriennummern gespeichert sind (z.B. `46023` statt `01.01.2026`) werden automatisch korrekt umgewandelt.

### 6.2 Import-Ablauf

1. Im Menü **Import** auswählen
2. **Veranstalter-Modus wählen:**
   - **Ein Veranstalter** — alle Events in der Datei gehören zum selben Veranstalter, der jetzt aus der Liste ausgewählt wird
   - **Mehrere Veranstalter** — die Datei enthält eine Spalte mit verschiedenen Veranstalternamen, die beim Mapping zugeordnet wird
3. CSV- oder Excel-Datei hochladen
4. Kopfzeile bestätigen
5. Spalten zuordnen (Mapping-Maske) — im Mehrfach-Modus muss die Veranstalter-Spalte zwingend zugeordnet werden
6. Vorschau prüfen
7. Duplikate behandeln (falls vorhanden)
8. Nicht erkannte Werte (Veranstalter, Orte etc.) zuordnen oder neu anlegen
9. Import mit **Import starten** abschließen

### 6.3 Import-Protokoll

Alle durchgeführten Importe werden protokolliert. Das Protokoll ist unter **Verwaltung → Import-Protokolle** einsehbar. Von dort aus können Importe auch rückgängig gemacht werden (alle importierten Events eines Durchlaufs werden gelöscht).

---

## 7. Stammdaten verwalten

Unter **Stammdaten** können folgende Listen gepflegt werden:
- **Veranstalter**
- **Orte**
- **Veranstaltungstypen**
- **Zeitfenster**

### Neuen Eintrag anlegen
1. Gewünschte Liste auswählen
2. Namen eingeben
3. Auf **Hinzufügen** klicken

### Eintrag umbenennen
1. Auf das **Stift-Symbol** klicken
2. Neuen Namen eingeben
3. Bestätigen

### Eintrag löschen
> **Achtung:** Einträge die noch bei Veranstaltungen verwendet werden, können nicht gelöscht werden.

---

## 8. Benutzerverwaltung

Unter **Verwaltung → Benutzer** können Admin-Accounts verwaltet werden.

### E-Mail-Benachrichtigungen aktivieren
In der Benutzerliste gibt es eine **Mail-Info**-Checkbox. Ist sie aktiviert, erhält dieser Benutzer automatisch E-Mails bei:
- Neu angelegten Veranstaltungen
- Geänderten Veranstaltungen
- Gelöschten Veranstaltungen
- Durchgeführten Importen

### Passwort ändern
1. In der Benutzerliste auf **Passwort ändern** klicken
2. Neues Passwort eingeben (mindestens 8 Zeichen)
3. Bestätigen

> **Wichtig:** Nach einer Passwortänderung muss man sich neu einloggen.

---

## 9. Öffentlicher Kalender

Die öffentliche Ansicht ist ohne Login erreichbar unter:
**https://www.gemeinde24640.de**

Besucher können:
- Den Monatskalender durchblättern
- Veranstaltungsdetails einsehen
- Events als iCal-Datei herunterladen (für Kalender-Apps)
- Die Listenansicht mit Filter nach Jahr, Monat, Veranstalter, Ort und Typ nutzen

---

## 10. Häufige Fragen

**Ich kann mich nicht einloggen.**
→ Passwort prüfen. Bei Vergessen: Dieter kontaktieren unter `progdieter@dascheberg.de`.

**Eine Veranstaltung taucht im öffentlichen Kalender nicht auf.**
→ Prüfen ob das Startdatum korrekt eingetragen ist. Der Kalender zeigt nur zukünftige Events.

**Ich bekomme keine E-Mail-Benachrichtigungen.**
→ Unter Verwaltung → Benutzer prüfen ob die Mail-Info-Checkbox aktiviert ist.

**Beim Import werden Duplikate gemeldet.**
→ Das ist normal — der Import erkennt bereits vorhandene Veranstaltungen. Man kann wählen ob die vorhandenen überschrieben oder übersprungen werden sollen.

**Eine Stammdaten-Bezeichnung soll geändert werden.**
→ Unter Stammdaten den Eintrag umbenennen. Die Änderung wirkt sich automatisch auf alle verknüpften Veranstaltungen aus.

**Im Import erscheinen Zahlen statt Datumsangaben.**
→ Das passiert bei Excel-Dateien die Datumsfelder als Seriennummern speichern. Die Anwendung erkennt und wandelt diese automatisch um — kein manueller Eingriff nötig.

**Ich möchte Events für mehrere Veranstalter auf einmal importieren.**
→ Im ersten Import-Schritt "Mehrere Veranstalter" wählen. Die Datei muss dann eine Spalte mit den Veranstalternamen enthalten, die beim Mapping zugeordnet wird.
