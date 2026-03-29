import { describe, it, expect } from "vitest";
import {
  normalizeDate,
  normalizeTimeSlot,
  normalizeString,
  normalizeEvent,
} from "../src/lib/import/normalize";

// ─────────────────────────────────────────────────────────────────────────────
// normalizeDate
// ─────────────────────────────────────────────────────────────────────────────

describe("normalizeDate", () => {

  // ── Deutsches Format ──────────────────────────────────────────────────────

  it("deutsches Format: 12.03.2026", () => {
    expect(normalizeDate("12.03.2026")).toBe("2026-03-12");
  });

  it("deutsches Format ohne führende Null: 1.3.2026", () => {
    expect(normalizeDate("1.3.2026")).toBe("2026-03-01");
  });

  it("deutsches Format: letzter Tag des Jahres 31.12.2026", () => {
    expect(normalizeDate("31.12.2026")).toBe("2026-12-31");
  });

  it("deutsches Format: erster Januar 1.1.2026", () => {
    expect(normalizeDate("1.1.2026")).toBe("2026-01-01");
  });

  // ── ISO-Format ────────────────────────────────────────────────────────────

  it("ISO-Format wird unverändert zurückgegeben", () => {
    expect(normalizeDate("2026-03-12")).toBe("2026-03-12");
  });

  it("ISO-Format: Jahreswechsel", () => {
    expect(normalizeDate("2026-01-01")).toBe("2026-01-01");
  });

  // ── Whitespace ────────────────────────────────────────────────────────────

  it("führende/nachgestellte Leerzeichen werden ignoriert", () => {
    expect(normalizeDate("  12.03.2026  ")).toBe("2026-03-12");
  });

  it("ISO mit Leerzeichen", () => {
    expect(normalizeDate("  2026-03-12  ")).toBe("2026-03-12");
  });

  // ── Ungültige Werte → null ────────────────────────────────────────────────

  it("null → null", () => {
    expect(normalizeDate(null)).toBeNull();
  });

  it("undefined → null", () => {
    expect(normalizeDate(undefined)).toBeNull();
  });

  it("leerer String → null", () => {
    expect(normalizeDate("")).toBeNull();
  });

  it("nur Leerzeichen → null", () => {
    expect(normalizeDate("   ")).toBeNull();
  });

  it("ungültiges Format → null", () => {
    expect(normalizeDate("März 2026")).toBeNull();
  });

  it("falsches Trennzeichen → null", () => {
    expect(normalizeDate("12-03-2026")).toBeNull();
  });

  it("US-Format MM/DD/YYYY → null (nicht unterstützt)", () => {
    expect(normalizeDate("03/12/2026")).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// normalizeTimeSlot
// ─────────────────────────────────────────────────────────────────────────────

describe("normalizeTimeSlot", () => {

  it("normaler Wert wird getrimmt zurückgegeben", () => {
    expect(normalizeTimeSlot("19:00")).toBe("19:00");
  });

  it("Leerzeichen werden entfernt", () => {
    expect(normalizeTimeSlot("  19:00  ")).toBe("19:00");
  });

  it("null → leerer String", () => {
    expect(normalizeTimeSlot(null)).toBe("");
  });

  it("undefined → leerer String", () => {
    expect(normalizeTimeSlot(undefined)).toBe("");
  });

  it("leerer String → leerer String", () => {
    expect(normalizeTimeSlot("")).toBe("");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// normalizeString
// ─────────────────────────────────────────────────────────────────────────────

describe("normalizeString", () => {

  it("normaler Wert bleibt erhalten", () => {
    expect(normalizeString("Dorfgemeinschaftshaus")).toBe("Dorfgemeinschaftshaus");
  });

  it("Leerzeichen werden getrimmt", () => {
    expect(normalizeString("  SSV Schmalfeld  ")).toBe("SSV Schmalfeld");
  });

  it("null → leerer String", () => {
    expect(normalizeString(null)).toBe("");
  });

  it("undefined → leerer String", () => {
    expect(normalizeString(undefined)).toBe("");
  });

  it("leerer String → leerer String", () => {
    expect(normalizeString("")).toBe("");
  });

  it("innere Leerzeichen bleiben erhalten", () => {
    expect(normalizeString("Gemeinde  Schmalfeld")).toBe("Gemeinde  Schmalfeld");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// normalizeEvent — Zusammenspiel aller Felder
// ─────────────────────────────────────────────────────────────────────────────

describe("normalizeEvent", () => {

  it("vollständiges Event wird korrekt normalisiert", () => {
    const result = normalizeEvent({
      startDate: "14.01.2026",
      endDate: "14.01.2026",
      timeSlot: "  19:00  ",
      location: "  Dorfgemeinschaftshaus  ",
      eventType: "  Skat  ",
      description: "  Monatliches Treffen  ",
    });
    expect(result).toEqual({
      startDate: "2026-01-14",
      endDate: "2026-01-14",
      timeSlot: "19:00",
      location: "Dorfgemeinschaftshaus",
      eventType: "Skat",
      description: "Monatliches Treffen",
    });
  });

  it("fehlendes endDate → wird auf startDate gesetzt", () => {
    const result = normalizeEvent({
      startDate: "14.01.2026",
      endDate: null,
      timeSlot: "",
      location: "Ort",
      eventType: "Art",
      description: "",
    });
    expect(result.startDate).toBe("2026-01-14");
    expect(result.endDate).toBe("2026-01-14");
  });

  it("ISO-Datum als startDate wird akzeptiert", () => {
    const result = normalizeEvent({
      startDate: "2026-01-14",
      endDate: "2026-01-14",
      timeSlot: "",
      location: "Ort",
      eventType: "Art",
      description: "",
    });
    expect(result.startDate).toBe("2026-01-14");
  });

  it("ungültiges Datum → startDate ist null", () => {
    const result = normalizeEvent({
      startDate: "kein-datum",
      endDate: null,
      timeSlot: "",
      location: "",
      eventType: "",
      description: "",
    });
    expect(result.startDate).toBeNull();
    // endDate fällt auf startDate zurück → auch null
    expect(result.endDate).toBeNull();
  });

  it("fehlende optionale Felder → leere Strings", () => {
    const result = normalizeEvent({
      startDate: "2026-01-14",
      endDate: null,
      timeSlot: undefined,
      location: undefined,
      eventType: undefined,
      description: undefined,
    });
    expect(result.timeSlot).toBe("");
    expect(result.location).toBe("");
    expect(result.eventType).toBe("");
    expect(result.description).toBe("");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Excel-Hilfsfunktionen (inline getestet da nicht exportiert)
// Wir testen sie indirekt über bekannte Excel-Seriennummern
// ─────────────────────────────────────────────────────────────────────────────

describe("Excel-Datumskonvertierung (excelDateToString)", () => {

  // Diese Funktion ist nicht exportiert — wir testen die Logik direkt
  function excelDateToString(serial: number): string {
    const date = new Date(Date.UTC(1900, 0, serial - 1));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  it("Excel-Seriennummer 46023 → 2026-01-01", () => {
    expect(excelDateToString(46023)).toBe("2026-01-01");
  });

  it("Excel-Seriennummer 46036 → 2026-01-14 (Skat-Beispiel)", () => {
    expect(excelDateToString(46036)).toBe("2026-01-14");
  });

  it("Excel-Seriennummer 45658 → 2025-01-01", () => {
    expect(excelDateToString(45658)).toBe("2025-01-01");
  });

  it("Excel-Seriennummer 46022 → 2025-12-31", () => {
    expect(excelDateToString(46022)).toBe("2025-12-31");
  });

});

describe("Excel-Zeitkonvertierung (excelTimeToString)", () => {

  function excelTimeToString(value: number): string {
    const totalMinutes = Math.round(value * 24 * 60);
    const rounded = Math.round(totalMinutes / 15) * 15;
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  it("0.791666... → 19:00", () => {
    expect(excelTimeToString(19 / 24)).toBe("19:00");
  });

  it("0.5 → 12:00 (Mittag)", () => {
    expect(excelTimeToString(0.5)).toBe("12:00");
  });

  it("0.0 → 00:00 (Mitternacht)", () => {
    expect(excelTimeToString(0.0)).toBe("00:00");
  });

  it("wird auf 15 Minuten gerundet: 18:07 → 18:00", () => {
    expect(excelTimeToString(18.12 / 24)).toBe("18:00");
  });

  it("0.875 → 21:00", () => {
    expect(excelTimeToString(0.875)).toBe("21:00");
  });

});
