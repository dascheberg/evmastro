import React from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";

export function EventDetails({ event }: { event: DisplayEvent | null }) {
    if (!event) {
        return (
            <div className="p-4 bg-white rounded shadow text-gray-500">
                Bitte ein Event auswählen
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded shadow space-y-4">
            <h2 className="text-xl font-bold">Event Details</h2>

            <div className="text-lg font-semibold">
                {event.dateLabel} – {event.timeLabel}
            </div>

            <div className="text-gray-700">
                <div className="font-semibold">{event.typeLabel}</div>
                <div>{event.organizerLabel}</div>
            </div>

            <div className="text-gray-700">
                <strong>Ort:</strong> {event.locationLabel}
            </div>

            {/* Optional: Beschreibung, falls du später ein Feld dafür hast */}
            {/* <div>
        <strong>Beschreibung:</strong>
        <p className="text-gray-600">{event.description}</p>
      </div> */}
        </div>
    );
}
