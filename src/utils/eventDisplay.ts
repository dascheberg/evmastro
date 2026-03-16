export interface RawEvent {
    id: number;
    startDate: string;
    endDate: string;
    locationName: string;
    eventTypeName: string;
    organizerName: string;
    timeSlotStart: string;
}

export interface DisplayEvent {
    id: number;
    dateLabel: string;
    timeLabel: string;
    locationLabel: string;
    typeLabel: string;
    organizerLabel: string;
}

export function toDisplayEvent(ev: RawEvent): DisplayEvent {
    const date = new Date(ev.startDate);

    return {
        id: ev.id,
        dateLabel: date.toLocaleDateString("de-DE"),
        timeLabel: ev.timeSlotStart, // WICHTIG: NICHT aus startDate!
        locationLabel: ev.locationName,
        typeLabel: ev.eventTypeName,
        organizerLabel: ev.organizerName,
    };
}
