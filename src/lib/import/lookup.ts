// Hilfsfunktion: String normalisieren für Vergleiche
function norm(value: any): string {
    return value?.trim().toLowerCase() ?? "";
}

// ── Einzelne Lookups ──────────────────────────────────────────────────────────

export function lookupTimeSlotId(timeSlotName: string, timeSlots: any[]) {
    const n = norm(timeSlotName);
    const match = timeSlots.find((ts) => norm(ts.name) === n);
    return match ? match.id : null;
}

export function lookupLocationId(locationName: string, locations: any[]) {
    const n = norm(locationName);
    const match = locations.find((loc) => norm(loc.name) === n);
    return match ? match.id : null;
}

export function lookupEventTypeId(eventTypeName: string, eventTypes: any[]) {
    const n = norm(eventTypeName);
    const match = eventTypes.find((et) => norm(et.name) === n);
    return match ? match.id : null;
}

// ── Unbekannte Werte erkennen ─────────────────────────────────────────────────

export type UnresolvedItem = {
    value: string;           // der unbekannte Wert, z.B. "Dorfgemeinschaftshaus"
    field: "timeSlot" | "location" | "eventType";
    affectedRows: number[];  // Zeilen-Indizes der betroffenen Events
};

export function findUnresolvedValues(
    events: any[],
    { timeSlots, locations, eventTypes }: { timeSlots: any[]; locations: any[]; eventTypes: any[] }
): UnresolvedItem[] {
    const map = new Map<string, UnresolvedItem>();

    events.forEach((ev, idx) => {
        // timeSlot prüfen
        if (ev.timeSlot && !lookupTimeSlotId(ev.timeSlot, timeSlots)) {
            const key = `timeSlot::${ev.timeSlot}`;
            if (!map.has(key)) {
                map.set(key, { value: ev.timeSlot, field: "timeSlot", affectedRows: [] });
            }
            map.get(key)!.affectedRows.push(idx);
        }

        // location prüfen
        if (ev.location && !lookupLocationId(ev.location, locations)) {
            const key = `location::${ev.location}`;
            if (!map.has(key)) {
                map.set(key, { value: ev.location, field: "location", affectedRows: [] });
            }
            map.get(key)!.affectedRows.push(idx);
        }

        // eventType prüfen
        if (ev.eventType && !lookupEventTypeId(ev.eventType, eventTypes)) {
            const key = `eventType::${ev.eventType}`;
            if (!map.has(key)) {
                map.set(key, { value: ev.eventType, field: "eventType", affectedRows: [] });
            }
            map.get(key)!.affectedRows.push(idx);
        }
    });

    return Array.from(map.values());
}

// ── Ein Event komplett auflösen ───────────────────────────────────────────────

export function resolveEventIds(
    event: any,
    { timeSlots, locations, eventTypes }: { timeSlots: any[]; locations: any[]; eventTypes: any[] }
) {
    return {
        ...event,
        timeId: lookupTimeSlotId(event.timeSlot, timeSlots),
        locationId: lookupLocationId(event.location, locations),
        typeId: lookupEventTypeId(event.eventType, eventTypes),
    };
}
