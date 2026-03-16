
// Hilfsfunktion: String normalisieren für Vergleiche
function norm(value) {
    return value?.trim().toLowerCase() ?? "";
}

// Lookup für timeSlot
export function lookupTimeSlotId(timeSlotName, timeSlots) {
    const n = norm(timeSlotName);

    const match = timeSlots.find(
        (ts) => norm(ts.name) === n
    );

    return match ? match.id : null;
}

// Lookup für location
export function lookupLocationId(locationName, locations) {
    const n = norm(locationName);

    const match = locations.find(
        (loc) => norm(loc.name) === n
    );

    return match ? match.id : null;
}

// Lookup für eventType
export function lookupEventTypeId(eventTypeName, eventTypes) {
    const n = norm(eventTypeName);

    const match = eventTypes.find(
        (et) => norm(et.name) === n
    );

    return match ? match.id : null;
}

// Ein Event komplett auflösen
export function resolveEventIds(event, { timeSlots, locations, eventTypes }) {
    return {
        ...event,
        timeId: lookupTimeSlotId(event.timeSlot, timeSlots),
        locationId: lookupLocationId(event.location, locations),
        typeId: lookupEventTypeId(event.eventType, eventTypes)
    };
}


