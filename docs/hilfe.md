# Hilfe & Anleitung

Verwaltung von Veranstaltungen am Beispiel der Gemeinde Schmalfeld.

## Kalender nutzen: Dashboard

Der öffentliche Veranstaltungskalender ist ohne Login erreichbar. Hier sehen Sie alle geplanten Veranstaltungen der Gemeinde Schmalfeld auf einen Blick.

- Im Mittelpunkt steht der Kalender mit den Daten des aktuellen Monats.
- Mit den Pfeilen links und rechts können Sie zwischen den Monaten wechseln.
- Tage mit Veranstaltungen sind farblich hervorgehoben.
- Ein Klick auf einen Tag zeigt die Veranstaltungen dieses Tages rechts neben dem Kalender an.
- Auf der Startseite gibt es zusätzlich Zusammenfassungen für heute, die nächsten 7 Tage und die nächsten 30 Tage.
- Über einen blauen Button können Benutzer sich bei neuen Einträgen sowie bei Änderungen oder Löschungen per E-Mail benachrichtigen lassen. Die Benachrichtigungen lassen sich pro Veranstalter und oder Veranstaltungsort steuern.

Unterhalb des Kalenders befinden sich vier Karten mit allgemeinen Informationen über die vorhandenen Veranstaltungen:

- Anzahl an Veranstaltungen pro Zeitraum: Alle, Woche, Monat, Quartal, Halbjahr, Jahr. Gemeint sind jeweils die nächsten Tage und nicht Kalendermonate.
- Der Veranstalter mit den meisten Veranstaltungen.
- Die meist genutzten Veranstaltungsorte.
- Die am häufigsten benannte Veranstaltungsart.

## Veranstaltungen

Unter dem Menüpunkt Veranstaltungen gibt es mehrere Ansichten auf die vorhandenen Termine.

- Kalenderansichten für Monate und Wochen.
- Eine Listenansicht mit Filtern nach Veranstalter, Ort, Typ und Zeitraum.
- In der Listenansicht können die angezeigten Veranstaltungen als PDF oder Excel-Datei heruntergeladen werden.
- Über den iCal-Button lassen sich Termine in Outlook, Google Calendar oder Apple Kalender übernehmen.

#### Alle anderen Funktionen sind nur als Admin zugänglich.

---

## Admin-Login

Der Administrationsbereich ist passwortgeschützt und nur für berechtigte Personen zugänglich. Der Zugang erfolgt

1. oben rechts auf Admin-Login klicken.
2. E-Mail-Adresse und Passwort eingeben.
3. Auf Einloggen klicken.

(Der Zugang als Admin wird durch den SuperUser angelegt.)

Nach dem Login steht dem Admin folgendes Menü zur Verfügung:

- Veranstaltungen verwalten
- Lookup-Tabellen
- Daten-Import
- Import-Übersicht
- API-Informationen
- Admin-Verwaltung
- Abonnenten
- Dokumentation

> Bei Problemen mit dem Login oder bei vergessenem Passwort bitte an [progdieter@dascheberg.de](mailto:progdieter@dascheberg.de) (webmaster) wenden.

---

## Veranstaltungen verwalten

Hier können Veranstaltungen angelegt, bearbeitet, gelöscht, gesucht, gefiltert und exportiert werden.

Nach der Auswahl von "Veranstaltungen verwalten" kommt man sofort auf die Seite mit einer Liste aller Veranstaltungen - linke Seite - und einem Eingabeformular für neue Veranstaltungen - rechte Seite.

#### Neue Veranstaltung anlegen

Auswahl rechte Seite: "Neue Veranstaltung anlegen"
Bei der Eingabe sind die Felder Startdatum, Veranstalter, Veranstaltungsort, Veranstaltungsart und Zeitfenster Pflichtfelder. Da für die Felder Veranstalter, Veranstaltungsort, Veranstaötungsart und Zeitfenster eigene Tabellen hinterlegt sind, werden hier in einem Dropdown Werte vorgegeben. Sollte ein Wert noch nicht vorhanden sein, kann über das ![Pluszeichen](./img/PlusFrm.png) neben dem Dropdown direkt ein neuer Eintrag angelegt werden, ohne die Seite verlassen zu müssen. Nach der Eingabe der Daten: Haken klicken um den neuen Wert zu speichern, X klicken um die Eingabe abzubrechen.

Nach Eingabe aller Werte auf Speichern klicken oder Abbrechen, wenn das Speichern abgebrochen werden soll.

#### Veranstaltung bearbeiten

1. In der Tabelle die gewünschte Veranstaltung suchen.
2. Auf das Stift-Symbol in der Zeile klicken.
3. Daten im Formular anpassen und auf Speichern klicken.

### Veranstaltung löschen

1. In der Tabelle die gewünschte Veranstaltung suchen.
2. Auf das Papierkorb-Symbol klicken.
3. Im Bestätigungsdialog auf OK klicken.

> Achtung: Das Löschen kann nicht rückgängig gemacht werden.

### Suchen und Filtern

- Freitextsuche durchsucht Veranstalter, Ort, Typ und Bemerkung.
- Dropdowns filtern nach Veranstalter, Ort oder Typ.
- Datum von bis grenzt den Zeitraum ein.
- Alle Filter zurücksetzen setzt alle Filter auf einmal zurück.

---

## Import

Mit der Import-Funktion können Veranstaltungen aus CSV- oder Excel-Dateien massenweise importiert werden.

### Veranstalter-Modus

- Ein Veranstalter: Alle Events in der Datei gehören zum selben Veranstalter. Dieser wird vorab aus dem Dropdown ausgewählt.
- Mehrere Veranstalter: Die Datei enthält eine Spalte mit verschiedenen Veranstalternamen. Diese Spalte wird beim Mapping der Spalten zugeordnet.

### Import-Ablauf

1. Im Menü Import auswählen.
2. Veranstalter-Modus wählen.
3. CSV- oder Excel-Datei hochladen.
4. Spalten der Datei den Feldern zuordnen.
5. Duplikate prüfen.
6. Nicht erkannte Werte zuordnen oder neu anlegen.
7. Import mit "Import starten" abschließen.

Hinweis zu Excel-Dateien: Datumsfelder, die intern als Zahlen gespeichert sind, werden automatisch korrekt umgewandelt.

Alle Importe werden protokolliert und können unter Import-Übersicht → Protokolle eingesehen und bei Bedarf rückgängig gemacht werden.

---

## Stammdaten-Tabellen

Unter Stammdaten-Tabellen können Veranstalter, Orte, Veranstaltungsarten und Zeitfenster angelegt, umbenannt und gelöscht werden.

Einträge, die noch bei Veranstaltungen verwendet werden, können nicht gelöscht werden. Umbenennen ist jederzeit möglich. Die Änderung wirkt sich automatisch auf alle verknüpften Veranstaltungen aus.

---

## E-Mail-Benachrichtigungen

Admins können automatische E-Mail-Benachrichtigungen aktivieren. Sie erhalten dann eine E-Mail, wenn Veranstaltungen angelegt, geändert, gelöscht oder importiert werden. Über diesen Weg bekommen die Admins bei **ALLEN** Veränderungen **ALLER** Veranstaltungen eine Nachricht. Sofern sie nur bei bestimmten Veranstaltern / Veranstaltungsorten eine Nachricht haben möchten, müssen sie den Weg über das Abo nehmen.

Die Einstellung für die Admins ist unter Admin-Verwaltung → Benutzer in der Spalte Mail-Info zu finden.

---

## Häufige Fragen

### Ich kann mich nicht einloggen.

Passwort prüfen. Bei vergessenem Passwort bitte [progdieter@dascheberg.de](mailto:progdieter@dascheberg.de) kontaktieren.

### Eine Veranstaltung taucht im Kalender nicht auf.

Prüfen, ob das Startdatum korrekt eingetragen ist. Der Kalender zeigt standardmäßig aktuelle und zukünftige Events.

### Ich Admin bekomme keine E-Mail-Benachrichtigungen.

Unter Verwaltung → Benutzer prüfen, ob die Mail-Info-Checkbox aktiviert ist.

### Beim Import werden Duplikate gemeldet.

Das ist normal. Der Import erkennt bereits vorhandene Veranstaltungen automatisch. Sie können wählen, ob diese übersprungen oder überschrieben werden sollen.

### Im Import erscheinen Zahlen statt Datumsangaben.

Das passiert bei Excel-Dateien, die Datumsfelder intern als Seriennummern speichern. Die Anwendung erkennt und wandelt diese normalerweise automatisch um.

### Wie kann ich den Kalender in Outlook oder Google Calendar einbinden?

Auf der Startseite gibt es einen iCal-Button. Die heruntergeladene Datei kann direkt in Outlook, Google Calendar oder Apple Kalender importiert werden. Für eine dauerhafte Einbindung kann die iCal-URL abonniert werden.

### Kann ich Events für mehrere Veranstalter auf einmal importieren?

Ja. Im ersten Import-Schritt Mehrere Veranstalter wählen. Die Datei muss dann eine Spalte mit den Veranstalternamen enthalten, die beim Mapping zugeordnet wird.

## Kontakt

Bei technischen Problemen oder Fragen zur Anwendung:

[progdieter@dascheberg.de](mailto:progdieter@dascheberg.de)
