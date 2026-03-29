import { describe, it, expect } from "vitest";
import { expandRecurrence, recurrenceToText } from "../src/utils/recurrence";
import type { Recurrence } from "../src/utils/recurrence";

// ─────────────────────────────────────────────────────────────────────────────
// expandRecurrence — Datumsberechnung
// ─────────────────────────────────────────────────────────────────────────────

describe("expandRecurrence – täglich", () => {

  it("täglich, 5 Termine", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "daily", interval: 1, count: 5,
    });
    expect(dates).toEqual([
      "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05",
    ]);
  });

  it("alle 3 Tage, 4 Termine", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "daily", interval: 3, count: 4,
    });
    expect(dates).toEqual([
      "2026-01-01", "2026-01-04", "2026-01-07", "2026-01-10",
    ]);
  });

  it("täglich bis Datum", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "daily", interval: 1, endDate: "2026-01-05",
    });
    expect(dates).toEqual([
      "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05",
    ]);
  });

  it("Enddatum wird nicht überschritten", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "daily", interval: 2, endDate: "2026-01-04",
    });
    expect(dates).toEqual(["2026-01-01", "2026-01-03"]);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe("expandRecurrence – wöchentlich", () => {

  it("jeden Dienstag, 4 Termine", () => {
    // 2026-01-06 ist ein Dienstag
    const dates = expandRecurrence("2026-01-06", {
      type: "weekly", interval: 1, count: 4,
    });
    expect(dates).toEqual([
      "2026-01-06", "2026-01-13", "2026-01-20", "2026-01-27",
    ]);
  });

  it("alle 2 Wochen, 3 Termine", () => {
    const dates = expandRecurrence("2026-01-06", {
      type: "weekly", interval: 2, count: 3,
    });
    expect(dates).toEqual([
      "2026-01-06", "2026-01-20", "2026-02-03",
    ]);
  });

  it("mehrere Wochentage: Mo + Mi + Fr", () => {
    // 2026-01-05 ist Montag
    const dates = expandRecurrence("2026-01-05", {
      type: "weekly", interval: 1, weekdays: [0, 2, 4], count: 6,
    });
    // Mo 05, Mi 07, Fr 09, Mo 12, Mi 14, Fr 16
    expect(dates).toEqual([
      "2026-01-05", "2026-01-07", "2026-01-09",
      "2026-01-12", "2026-01-14", "2026-01-16",
    ]);
  });

  it("Jahreswechsel wird korrekt überbrückt", () => {
    // 2025-12-29 ist Montag
    const dates = expandRecurrence("2025-12-29", {
      type: "weekly", interval: 1, count: 3,
    });
    expect(dates).toEqual([
      "2025-12-29", "2026-01-05", "2026-01-12",
    ]);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe("expandRecurrence – monatlich am Wochentag", () => {

  it("jeden 3. Mittwoch, 12 Termine — Skat-Beispiel", () => {
    // 2026-01-14 ist der 3. Mittwoch im Januar
    const dates = expandRecurrence("2026-01-14", {
      type: "monthly", interval: 1, weekday: 2, weekOfMonth: 3, count: 12,
    });
    expect(dates).toHaveLength(12);
    expect(dates[0]).toBe("2026-01-14");
    expect(dates[1]).toBe("2026-02-18");
    expect(dates[2]).toBe("2026-03-18");
    expect(dates[11]).toBe("2026-12-16");
  });

  it("jeden 1. Montag, 3 Termine", () => {
    // 2026-01-05 ist der 1. Montag im Januar
    const dates = expandRecurrence("2026-01-05", {
      type: "monthly", interval: 1, weekday: 0, weekOfMonth: 1, count: 3,
    });
    expect(dates).toEqual([
      "2026-01-05", "2026-02-02", "2026-03-02",
    ]);
  });

  it("jeden letzten Freitag (weekOfMonth: 5), 3 Termine", () => {
    // 2026-01-30 ist der letzte Freitag im Januar
    const dates = expandRecurrence("2026-01-30", {
      type: "monthly", interval: 1, weekday: 4, weekOfMonth: 5, count: 3,
    });
    expect(dates[0]).toBe("2026-01-30");
    expect(dates[1]).toBe("2026-02-27");
    expect(dates[2]).toBe("2026-03-27");
  });

  it("jeden 4. Dienstag, Monatswechsel über Jahresende", () => {
    const dates = expandRecurrence("2025-11-25", {
      type: "monthly", interval: 1, weekday: 1, weekOfMonth: 4, count: 3,
    });
    expect(dates[0]).toBe("2025-11-25");
    expect(dates[1]).toBe("2025-12-23");
    expect(dates[2]).toBe("2026-01-27");
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe("expandRecurrence – monatlich am festen Tag", () => {

  it("am 15. des Monats, 3 Termine", () => {
    const dates = expandRecurrence("2026-01-15", {
      type: "monthly", interval: 1, dayOfMonth: 15, count: 3,
    });
    expect(dates).toEqual([
      "2026-01-15", "2026-02-15", "2026-03-15",
    ]);
  });

  it("am 1. des Monats, Jahreswechsel", () => {
    const dates = expandRecurrence("2025-11-01", {
      type: "monthly", interval: 1, dayOfMonth: 1, count: 4,
    });
    expect(dates).toEqual([
      "2025-11-01", "2025-12-01", "2026-01-01", "2026-02-01",
    ]);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe("expandRecurrence – jährlich", () => {

  it("jährlich, 3 Termine", () => {
    const dates = expandRecurrence("2026-03-15", {
      type: "yearly", interval: 1, count: 3,
    });
    expect(dates).toEqual([
      "2026-03-15", "2027-03-15", "2028-03-15",
    ]);
  });

  it("alle 2 Jahre, 3 Termine", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "yearly", interval: 2, count: 3,
    });
    expect(dates).toEqual([
      "2026-01-01", "2028-01-01", "2030-01-01",
    ]);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe("expandRecurrence – Sicherheitsbremse & Randwerte", () => {

  it("immer mindestens 1 Termin (das Startdatum selbst)", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "daily", interval: 1, count: 1,
    });
    expect(dates).toHaveLength(1);
    expect(dates[0]).toBe("2026-01-01");
  });

  it("Enddatum = Startdatum → nur 1 Termin", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "daily", interval: 1, endDate: "2026-01-01",
    });
    expect(dates).toHaveLength(1);
  });

  it("ohne count und ohne endDate → max 365 Termine", () => {
    const dates = expandRecurrence("2026-01-01", {
      type: "daily", interval: 1,
    });
    expect(dates.length).toBeLessThanOrEqual(365);
    expect(dates.length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// recurrenceToText — lesbare Texte
// ─────────────────────────────────────────────────────────────────────────────

describe("recurrenceToText", () => {

  it("null → leerer String", () => {
    expect(recurrenceToText(null)).toBe("");
    expect(recurrenceToText(undefined)).toBe("");
  });

  it("täglich", () => {
    expect(recurrenceToText({ type: "daily", interval: 1 })).toBe("Täglich");
    expect(recurrenceToText({ type: "daily", interval: 3 })).toBe("Alle 3 Tage");
  });

  it("wöchentlich", () => {
    expect(recurrenceToText({ type: "weekly", interval: 1 })).toBe("Wöchentlich");
    expect(recurrenceToText({ type: "weekly", interval: 2 })).toBe("Alle 2 Wochen");
    expect(recurrenceToText({ type: "weekly", interval: 1, weekday: 1 })).toBe("Jeden Dienstag");
  });

  it("monatlich am Wochentag", () => {
    const r: Recurrence = { type: "monthly", interval: 1, weekday: 2, weekOfMonth: 3 };
    expect(recurrenceToText(r)).toBe("Monatlich am dritten Mittwoch");
  });

  it("monatlich am festen Tag", () => {
    expect(recurrenceToText({ type: "monthly", interval: 1, dayOfMonth: 15 }))
      .toBe("Monatlich am 15.");
  });

  it("jährlich", () => {
    expect(recurrenceToText({ type: "yearly", interval: 1 })).toBe("Jährlich");
    expect(recurrenceToText({ type: "yearly", interval: 2 })).toBe("Alle 2 Jahre");
  });

  it("mit Anzahl", () => {
    expect(recurrenceToText({ type: "daily", interval: 1, count: 10 }))
      .toBe("Täglich (10× insgesamt)");
  });

  it("mit Enddatum", () => {
    const r: Recurrence = { type: "weekly", interval: 1, endDate: "2026-12-31" };
    const text = recurrenceToText(r);
    expect(text).toContain("Wöchentlich");
    expect(text).toContain("31. Dezember 2026");
  });

});
