import React, { useState } from "react";
import { CalendarView } from "./CalendarView";
import { EventDetails } from "./EventDetails";
import { Filters } from "./Filters";
import type { DisplayEvent } from "../../utils/eventDisplay";
import type { EventFilters } from "./filterTypes";

export function EventsUserPage() {
    const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null);
    const [view, setView] = useState<"month" | "week" | "list">("month");

    const now = new Date();
    const [filters, setFilters] = useState<EventFilters>({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        quarter: 1,
        half: 1,
        periodPreset: "month",
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Linke Spalte (2/3) */}
            <div className="lg:col-span-2 space-y-4">

                {/* Filterleiste */}
                <Filters mode={view} onChange={(f) => setFilters(f)} />

                {/* Tabs */}
                <div className="flex gap-2 border-b pb-2">
                    <button
                        className={`px-3 py-1 rounded ${view === "list" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setView("list")}
                    >
                        Liste
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${view === "month" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setView("month")}
                    >
                        Monat
                    </button>

                    <button
                        className={`px-3 py-1 rounded ${view === "week" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setView("week")}
                    >
                        Woche
                    </button>

                </div>

                {/* Ansicht */}
                <CalendarView mode={view} filters={filters} onSelectEvent={setSelectedEvent} />
            </div>

            {/* Rechte Spalte (1/3) */}
            <div>
                <EventDetails event={selectedEvent} />
            </div>
        </div>
    );
}
