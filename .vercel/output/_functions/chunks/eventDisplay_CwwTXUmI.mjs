function toDisplayEvent(ev) {
  const date = new Date(ev.startDate);
  return {
    id: ev.id,
    dateLabel: date.toLocaleDateString("de-DE"),
    timeLabel: ev.timeSlotStart,
    locationLabel: ev.locationName,
    typeLabel: ev.eventTypeName,
    organizerLabel: ev.organizerName,
    raw: ev
    // alles mitgeben inkl. notes + recurrence
  };
}

export { toDisplayEvent as t };
