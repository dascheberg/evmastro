import React, { useEffect, useState } from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";

export default function EventListForDay({
    date,
    onClose,
}: {
    date: string | null;
    onClose: () => void;
}) {
    const [events, setEvents] = useState<DisplayEvent[]>([]);

    useEffect(() => {
        if (!date) return;
        fetch(`/api/events-by-day?date=${date}`)
            .then((res) => res.json())
            .then((data) => setEvents(data));
    }, [date]);

    if (!date) {
        return (
            <div className="p-4 bg-white rounded shadow">
                Bitte einen Tag wählen
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded shadow space-y-3">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">
                    Events am {new Date(date).toLocaleDateString("de-DE")}
                </h3>
                <button
                    className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    onClick={onClose}
                >
                    Schließen
                </button>
            </div>

            {events.length === 0 && (
                <p className="text-gray-500 text-sm">Keine Events an diesem Tag</p>
            )}

            {events.map((ev) => (
                <a
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className="block p-3 border rounded bg-gray-50 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                    <div className="font-semibold">
                        {ev.dateLabel}, {ev.timeLabel}
                    </div>
                    <div className="text-gray-600 text-sm">{ev.typeLabel}</div>
                    <div className="text-gray-500 text-xs">
                        {ev.locationLabel} · {ev.organizerLabel}
                    </div>
                    {/* Notes anzeigen falls vorhanden */}
                    {ev.raw?.notes && (
                        <div className="text-gray-400 text-xs mt-1 italic truncate">
                            {ev.raw.notes}
                        </div>
                    )}
                </a>
            ))}
        </div>
    );
}
