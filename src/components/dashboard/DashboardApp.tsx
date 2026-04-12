import React, { useState } from "react";
import CalendarWidget from "./CalendarWidget";
import EventListForDay from "./EventListForDay";
import UpcomingEventsWidget from "./UpcomingEventsWidget";
import { EventsPerPeriod } from "./widgets/EventsPerPeriod";
import { EventsPerLocation } from "./widgets/EventsPerLocation";
import { EventsPerOrganizer } from "./widgets/EventsPerOrganizer";
import { EventsPerEventType } from "./widgets/EventsPerEventType";

export default function DashboardApp() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {/* ── NEU: Abo-Banner ─────────────────────────────────────────────── */}
            <div className="w-1/2 mr-12 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                        <p className="font-semibold text-blue-900 text-sm">
                            Terminbenachrichtigungen
                        </p>
                        <p className="text-xs text-blue-700">
                            Erhalte automatisch eine E-Mail, wenn Veranstaltungen deiner Wahl neu eingetragen oder geändert werden.
                        </p>
                    </div>
                </div>
                <a
                    href="/abonnieren"
                    className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 border-none whitespace-nowrap"
                >
                    Jetzt anmelden
                </a>
            </div>
            {/* ── Ende Abo-Banner ─────────────────────────────────────────────── */}

            {/* Kalender + Tagesliste + Upcoming */}
            <div className={`grid gap-4 grid-cols-3`}>

                {/* Kalender */}
                <div className={selectedDate ? "col-span-1" : "col-span-2"}>
                    <CalendarWidget onSelectDate={setSelectedDate} />
                </div>

                {/* Eventliste nur anzeigen, wenn ein Tag gewählt wurde */}
                {selectedDate && (
                    <div className="col-span-1">
                        <EventListForDay
                            date={selectedDate}
                            onClose={() => setSelectedDate(null)}
                        />
                    </div>
                )}

                {/* Upcoming bleibt immer sichtbar */}
                <div className="col-span-1">
                    <UpcomingEventsWidget />
                </div>
            </div>

            {/* Stat Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <EventsPerPeriod />
                <EventsPerOrganizer />
                <EventsPerLocation />
                <EventsPerEventType />
            </div>

        </div>
    );
}
