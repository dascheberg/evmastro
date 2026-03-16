// Datum normalisieren: 12.03.2026 → 2026-03-12
export function normalizeDate(value) {
    if (!value) return null;

    const trimmed = value.trim();

    // deutsches Format
    const match = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (match) {
        const [_, d, m, y] = match;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // bereits ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    return null; // ungültig
}

// timeSlot bleibt ein String
export function normalizeTimeSlot(value) {
    if (!value) return "";
    return value.trim();
}

// location, eventType, description: nur trimmen
export function normalizeString(value) {
    return value?.trim() ?? "";
}

// Ein Event normalisieren
export function normalizeEvent(raw) {
    const start = normalizeDate(raw.startDate);
    const end = normalizeDate(raw.endDate) ?? start;

    return {
        startDate: start,
        endDate: end,
        timeSlot: normalizeTimeSlot(raw.timeSlot),
        location: normalizeString(raw.location),
        eventType: normalizeString(raw.eventType),
        description: normalizeString(raw.description)
    };
}
