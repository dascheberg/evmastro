import React, { useState } from "react";
import { CalendarView } from "./CalendarView"
import { EventDetails } from "./EventDetails";
import { Filters } from "./Filters";

export function EventsUserPage() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [view, setView] = useState<"month" | "week" | "list">("month");
    const [filters, setFilters] = useState({});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Linke Spalte (2/3) */}
            <div className="lg:col-span-2 space-y-4">

                {/* Filterleiste */}
                <Filters mode={view} onChange={(f) => setFilters(f)} />

                {/* Tabs */}
                <div className="flex gap-2 border-b pb-2">
                    <button
                        className={`px-3 py-1 rounded ${view === "month" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setView("month")}
                    >
                        Monat
                    </button>

                    <button
                        className={`px-3 py-1 rounded ${view === "week" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setView("week")}
                    >
                        Woche
                    </button>

                    <button
                        className={`px-3 py-1 rounded ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setView("list")}
                    >
                        Liste
                    </button>
                </div>

                {/* Ansicht */}
                <CalendarView
                    mode={view}
                    filters={filters}
                    onSelectEvent={setSelectedEvent}
                />
            </div>

            {/* Rechte Spalte (1/3) */}
            <div>
                <EventDetails event={selectedEvent} />
            </div>
        </div>
    );
}
