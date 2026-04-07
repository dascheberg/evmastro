import React, { useEffect, useState } from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";

export default function UpcomingEventsWidget() {
    const [data, setData] = useState<{
        today: DisplayEvent[];
        nextWeek: DisplayEvent[];
        nextMonth: DisplayEvent[];
    } | null>(null);

    const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");

    const todayStr = new Date().toLocaleDateString("de-DE"); // NEU

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

                {items.map((ev) => {
                    const isToday = ev.dateLabel === todayStr; // NEU
                    return (
                        <a
                            key={ev.id}
                            href={`/events/${ev.id}`}
                            className={`block p-2 border rounded text-sm transition-colors ${isToday
                                ? "bg-green-50 border-green-500 ring-1 ring-green-400 hover:bg-green-100"
                                : "bg-gray-50 hover:bg-green-50 hover:border-green-300"
                                }`}
                        >
                            <div className="font-semibold flex items-center gap-2">
                                {isToday && (
                                    <span className="bg-green-600 text-white text-xs rounded px-1">
                                        Heute
                                    </span>
                                )}
                                {ev.dateLabel}, {ev.timeLabel}
                            </div>
                            <div className="text-gray-600">{ev.typeLabel}</div>
                            <div className="text-gray-500 text-xs">
                                {ev.locationLabel} · {ev.organizerLabel}
                            </div>
                            {ev.raw?.notes && (
                                <div className="text-gray-400 text-xs mt-1 italic truncate">
                                    {ev.raw.notes}
                                </div>
                            )}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
