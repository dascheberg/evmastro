import React, { useEffect, useState } from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";

export default function UpcomingEventsWidget() {
    const [data, setData] = useState<{
        today: DisplayEvent[];
        nextWeek: DisplayEvent[];
        nextMonth: DisplayEvent[];
    } | null>(null);

    const [activeTab, setActiveTab] =
        useState<"today" | "week" | "month">("today");

    useEffect(() => {
        fetch("/api/events-upcoming")
            .then((res) => res.json())
            .then((d) => setData(d));
    }, []);

    if (!data) {
        return <div className="p-4 bg-white rounded shadow">Lade…</div>;
    }

    const items =
        activeTab === "today"
            ? data.today
            : activeTab === "week"
                ? data.nextWeek
                : data.nextMonth;

    return (
        <div className="p-4 bg-white rounded shadow space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2">
                <button
                    className={`px-3 py-1 rounded ${activeTab === "today" ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                    onClick={() => setActiveTab("today")}
                >
                    Heute
                </button>

                <button
                    className={`px-3 py-1 rounded ${activeTab === "week" ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                    onClick={() => setActiveTab("week")}
                >
                    7 Tage
                </button>

                <button
                    className={`px-3 py-1 rounded ${activeTab === "month" ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                    onClick={() => setActiveTab("month")}
                >
                    Monat
                </button>
            </div>

            {/* Inhalt */}
            <div className="space-y-2">
                {items.length === 0 && (
                    <p className="text-sm text-gray-500">Keine Veranstaltungen</p>
                )}

                {items.map((ev) => (
                    <div key={ev.id} className="p-2 border rounded bg-gray-50 text-sm">
                        <div className="font-semibold">
                            {ev.dateLabel}, {ev.timeLabel}
                        </div>
                        <div className="text-gray-500">{ev.locationLabel}</div>
                        <div className="text-xs text-gray-500">
                            {ev.typeLabel} – {ev.organizerLabel}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
