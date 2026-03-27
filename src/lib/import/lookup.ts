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

// NEU: Veranstalter-Lookup
export function lookupOrganizerId(organizerName: string, organizers: any[]) {
    const n = norm(organizerName);
    const match = organizers.find((o) => norm(o.name) === n);
    return match ? match.id : null;
}

// ── Unbekannte Werte erkennen ─────────────────────────────────────────────────

export type UnresolvedItem = {
    value: string;
    field: "timeSlot" | "location" | "eventType" | "organizer";
    affectedRows: number[];
};

export function findUnresolvedValues(
    events: any[],
    {
        timeSlots,
        locations,
        eventTypes,
        organizers,
        multiMode,
    }: {
        timeSlots: any[];
        locations: any[];
        eventTypes: any[];
        organizers?: any[];
        multiMode?: boolean;
    }
): UnresolvedItem[] {
    const map = new Map<string, UnresolvedItem>();

    events.forEach((ev, idx) => {
        // timeSlot prüfen
        if (ev.timeSlot && !lookupTimeSlotId(ev.timeSlot, timeSlots)) {
            const key = `timeSlot::${ev.timeSlot}`;
            if (!map.has(key)) map.set(key, { value: ev.timeSlot, field: "timeSlot", affectedRows: [] });
            map.get(key)!.affectedRows.push(idx);
        }

        // location prüfen
        if (ev.location && !lookupLocationId(ev.location, locations)) {
            const key = `location::${ev.location}`;
            if (!map.has(key)) map.set(key, { value: ev.location, field: "location", affectedRows: [] });
            map.get(key)!.affectedRows.push(idx);
        }

        // eventType prüfen
        if (ev.eventType && !lookupEventTypeId(ev.eventType, eventTypes)) {
            const key = `eventType::${ev.eventType}`;
            if (!map.has(key)) map.set(key, { value: ev.eventType, field: "eventType", affectedRows: [] });
            map.get(key)!.affectedRows.push(idx);
        }

        // NEU: Veranstalter prüfen (nur im Multi-Modus)
        if (multiMode && organizers && ev.organizer && !lookupOrganizerId(ev.organizer, organizers)) {
            const key = `organizer::${ev.organizer}`;
            if (!map.has(key)) map.set(key, { value: ev.organizer, field: "organizer", affectedRows: [] });
            map.get(key)!.affectedRows.push(idx);
        }
    });

    return Array.from(map.values());
}

// ── Ein Event komplett auflösen ───────────────────────────────────────────────

export function resolveEventIds(
    event: any,
    {
        timeSlots,
        locations,
        eventTypes,
        organizers,
        multiMode,
    }: {
        timeSlots: any[];
        locations: any[];
        eventTypes: any[];
        organizers?: any[];
        multiMode?: boolean;
    }
) {
    const resolved: any = {
        ...event,
        timeId: lookupTimeSlotId(event.timeSlot, timeSlots),
        locationId: lookupLocationId(event.location, locations),
        typeId: lookupEventTypeId(event.eventType, eventTypes),
    };

    // Im Multi-Modus: organizerId aus dem Veranstalternamen auflösen
    if (multiMode && organizers && event.organizer) {
        resolved.organizerId = lookupOrganizerId(event.organizer, organizers);
    }

    return resolved;
}
