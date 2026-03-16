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

            {/* Stat Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <EventsPerPeriod />
                <EventsPerOrganizer />
                <EventsPerLocation />
                <EventsPerEventType />
            </div>

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


        </div>
    );
}
