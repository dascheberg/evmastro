import React, { useEffect, useState } from "react";
import {
    getDaysInMonth,
    getDaysInRange,
    getCalendarWeekFromDate,
} from "../../utils/calendar";
import type { DisplayEvent } from "../../utils/eventDisplay";
import { ListView } from "./ListView";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

interface Props {
    mode: "month" | "week" | "list";
    filters: any;                // <--- HIER
    onSelectEvent: (ev: DisplayEvent) => void;
}

export function CalendarView({ mode, onSelectEvent, filters }: Props) {
    const [events, setEvents] = useState<DisplayEvent[]>([]);
    const [days, setDays] = useState<Date[]>([]);
    const [baseDate, setBaseDate] = useState(new Date());

    //
    // Navigation
    //
    function goNext() {
        const d = new Date(baseDate);
        if (mode === "month") d.setMonth(d.getMonth() + 1);
        if (mode === "week") d.setDate(d.getDate() + 7);
        setBaseDate(d);
    }

    function goPrev() {
        const d = new Date(baseDate);
        if (mode === "month") d.setMonth(d.getMonth() - 1);
        if (mode === "week") d.setDate(d.getDate() - 7);
        setBaseDate(d);
    }

    //
    // Titel
    //
    let title = "";
    if (mode === "month") {
        title = baseDate.toLocaleDateString("de-DE", {
            month: "long",
            year: "numeric",
        });
    }
    if (mode === "week") {
        const { start, end, weekNumber } = getCalendarWeekFromDate(baseDate);
        title = `KW ${weekNumber} (${start.toLocaleDateString(
            "de-DE"
        )} – ${end.toLocaleDateString("de-DE")})`;
    }

    //
    // Daten laden: Monat
    //
    useEffect(() => {
        if (mode !== "month") return;

        // ← year und month hier definieren, nicht außerhalb
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();

        const monthDays = getDaysInMonth(year, month);
        setDays(monthDays);

        const params = new URLSearchParams({
            year: String(year),
            month: String(month + 1),
        });

        if (filters.organizerId) params.set("organizerId", String(filters.organizerId));
        if (filters.locationId) params.set("locationId", String(filters.locationId));
        if (filters.typeId) params.set("typeId", String(filters.typeId));

        fetch(`/api/events-by-month?${params}`)
            .then(res => res.json())
            .then(data => setEvents(data));

    }, [mode, baseDate, filters]);
    //
    // Daten laden: Woche
    //
    useEffect(() => {
        if (mode !== "week") return;
        const { start, end } = getCalendarWeekFromDate(baseDate);
        const weekDays = getDaysInRange(start, end);
        setDays(weekDays);

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        const params = new URLSearchParams({ start: startStr, end: endStr });
        if (filters.organizerId) params.set("organizerId", String(filters.organizerId));
        if (filters.locationId) params.set("locationId", String(filters.locationId));
        if (filters.typeId) params.set("typeId", String(filters.typeId));

        fetch(`/api/events-by-week?${params}`)
            .then(res => res.json())
            .then(data => setEvents(data));
    }, [mode, baseDate, filters]);
    //
    // Rendering
    //
    return (
        <div className="space-y-4">
            {(mode === "month" || mode === "week") && (
                <div className="flex items-center justify-between">
                    <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={goPrev}
                    >
                        <ArrowLeftIcon className="h-4 w-4" />

                    </button>

                    <div className="font-bold text-lg">{title}</div>

                    <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={goNext}
                    >
                        <ArrowRightIcon className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Monatsansicht */}
            {mode === "month" && (
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => {
                        const dateStr = day.toLocaleDateString("de-DE");

                        const dayEvents = events.filter((ev) => ev.dateLabel === dateStr);

                        return (
                            <div
                                key={dateStr}
                                className="border rounded p-2 bg-white min-h-[120px]"
                            >
                                <div className="font-bold text-sm mb-1">
                                    {day.getDate()}.{" "}
                                    {day.toLocaleDateString("de-DE", { month: "short" })}
                                </div>

                                <div className="space-y-1">
                                    {dayEvents.map((ev) => (
                                        <button
                                            key={ev.id}
                                            className="block w-full text-left text-xs p-1 rounded bg-blue-100 hover:bg-blue-200"
                                            onClick={() => onSelectEvent(ev)}
                                        >
                                            {ev.timeLabel} – {ev.typeLabel}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Wochenansicht */}
            {mode === "week" && (
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => {
                        const dateStr = day.toLocaleDateString("de-DE");

                        const dayEvents = events.filter((ev) => ev.dateLabel === dateStr);

                        return (
                            <div
                                key={dateStr}
                                className="border rounded p-2 bg-white min-h-[120px]"
                            >
                                <div className="font-bold text-sm mb-1">
                                    {day.toLocaleDateString("de-DE", { weekday: "short" })}{" "}
                                    {day.getDate()}.
                                </div>

                                <div className="space-y-1">
                                    {dayEvents.map((ev) => (
                                        <button
                                            key={ev.id}
                                            className="block w-full text-left text-xs p-1 rounded bg-blue-100 hover:bg-blue-200"
                                            onClick={() => onSelectEvent(ev)}
                                        >
                                            {ev.timeLabel} – {ev.typeLabel}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {mode === "list" && (
                <div className="p-4 bg-white rounded border text-sm text-gray-600">
                    <ListView
                        filters={filters}
                        onSelectEvent={onSelectEvent}
                    />

                </div>
            )}
        </div>
    );
}
