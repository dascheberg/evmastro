import React, { useEffect, useState } from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";

export default function UpcomingEventsWidget() {
    const [data, setData] = useState<{
        today: DisplayEvent[];
        nextWeek: DisplayEvent[];
        nextMonth: DisplayEvent[];
    } | null>(null);

    const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");

    useEffect(() => {
        fetch("/api/events-upcoming")
            .then((res) => res.json())
            .then((d) => setData(d));
    }, []);

    if (!data) {
        return <div className="p-4 bg-white rounded shadow">Lade…</div>;
    }

    const items =
        activeTab === "today" ? data.today :
            activeTab === "week" ? data.nextWeek :
                data.nextMonth;

    return (
        <div className="p-4 bg-white rounded shadow space-y-4">

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {(["today", "week", "month"] as const).map((tab) => (
                    <button
                        key={tab}
                        className={`px-3 py-1 rounded ${activeTab === tab ? "bg-green-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "today" ? "Heute" : tab === "week" ? "7 Tage" : "Monat"}
                    </button>
                ))}
            </div>

            {/* Inhalt */}
            <div className="space-y-2">
                {items.length === 0 && (
                    <p className="text-sm text-gray-500">Keine Veranstaltungen</p>
                )}

                {items.map((ev) => (
                    <a
                        key={ev.id}
                        href={`/events/${ev.id}`}
                        className="block p-2 border rounded bg-gray-50 text-sm hover:bg-green-50 hover:border-green-300 transition-colors"
                    >
                        <div className="font-semibold">
                            {ev.dateLabel}, {ev.timeLabel}
                        </div>
                        <div className="text-gray-600">{ev.typeLabel}</div>
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
        </div>
    );
}
