import React, { useEffect, useState } from "react";
import {
    getDaysInMonth,
    getDaysInRange,
    getCalendarWeekFromDate,
} from "../../utils/calendar";
import type { DisplayEvent } from "../../utils/eventDisplay";
import { ListView } from "./ListView";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import type { EventFilters } from "./filterTypes";

interface Props {
    mode: "month" | "week" | "list";
    filters: EventFilters;
    onSelectEvent: (ev: DisplayEvent) => void;
}

function toIsoLocal(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function getRangeFromFilters(filters: EventFilters): { from: string; to: string } {
    const year = filters.year;
    const month = filters.month;

    if (filters.periodPreset === "custom" && filters.from && filters.to) {
        return { from: filters.from, to: filters.to };
    }

    if (filters.periodPreset === "year") {
        return { from: `${year}-01-01`, to: `${year}-12-31` };
    }

    if (filters.periodPreset === "half") {
        return filters.half === 1
            ? { from: `${year}-01-01`, to: `${year}-06-30` }
            : { from: `${year}-07-01`, to: `${year}-12-31` };
    }

    if (filters.periodPreset === "quarter") {
        const q = filters.quarter;
        if (q === 1) return { from: `${year}-01-01`, to: `${year}-03-31` };
        if (q === 2) return { from: `${year}-04-01`, to: `${year}-06-30` };
        if (q === 3) return { from: `${year}-07-01`, to: `${year}-09-30` };
        return { from: `${year}-10-01`, to: `${year}-12-31` };
    }

    // month (default)
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { from: toIsoLocal(start), to: toIsoLocal(end) };
}

export function CalendarView({ mode, onSelectEvent, filters }: Props) {
    const [events, setEvents] = useState<DisplayEvent[]>([]);
    const [days, setDays] = useState<Date[]>([]);
    const [baseDate, setBaseDate] = useState(new Date());

    const todayStr = new Date().toLocaleDateString("de-DE");

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

    function goToday() {
        setBaseDate(new Date());
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
    // Daten laden: Monat (nur Monat, kein Range-Fetch hier)
    //
    useEffect(() => {
        if (mode !== "month") return;

        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();

        setDays(getDaysInMonth(year, month));

        const params = new URLSearchParams({
            year: String(year),
            month: String(month + 1),
        });

        if (filters.organizerId) params.set("organizerId", String(filters.organizerId));
        if (filters.locationId) params.set("locationId", String(filters.locationId));
        if (filters.typeId) params.set("typeId", String(filters.typeId));

        fetch(`/api/events-by-month?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => setEvents(data));
    }, [mode, baseDate, filters.organizerId, filters.locationId, filters.typeId]);

    //
    // Daten laden: Woche
    //
    useEffect(() => {
        if (mode !== "week") return;

        const { start, end } = getCalendarWeekFromDate(baseDate);
        setDays(getDaysInRange(start, end));

        const startStr = toIsoLocal(start); // statt toISOString()
        const endStr = toIsoLocal(end);     // statt toISOString()

        const params = new URLSearchParams({ start: startStr, end: endStr });
        if (filters.organizerId) params.set("organizerId", String(filters.organizerId));
        if (filters.locationId) params.set("locationId", String(filters.locationId));
        if (filters.typeId) params.set("typeId", String(filters.typeId));

        fetch(`/api/events-by-week?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => setEvents(data));
    }, [mode, baseDate, filters.organizerId, filters.locationId, filters.typeId]);

    //
    // Daten laden: Range (nur Liste)
    //
    useEffect(() => {
        if (mode !== "list") return;

        const { from, to } = getRangeFromFilters(filters);
        const q = new URLSearchParams({ from, to });

        if (filters.organizerId) q.set("organizerId", String(filters.organizerId));
        if (filters.locationId) q.set("locationId", String(filters.locationId));
        if (filters.typeId) q.set("typeId", String(filters.typeId));

        fetch(`/api/events-by-range?${q.toString()}`)
            .then((r) => r.json())
            .then((data) => setEvents(data));
    }, [mode, filters]);

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

                    <div className="flex items-center gap-2">
                        <div className="font-bold text-lg">{title}</div>
                        <button
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={goToday}
                            type="button"
                        >
                            Heute
                        </button>
                    </div>

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
                        const isToday = dateStr === todayStr; // NEU
                        const dayEvents = events.filter((ev) => ev.dateLabel === dateStr);

                        return (
                            <div
                                key={dateStr}
                                className={`border rounded p-2 min-h-[120px] ${isToday
                                    ? "bg-green-50 border-green-500 ring-2 ring-green-400"
                                    : "bg-white"
                                    }`}
                            >
                                <div className={`font-bold text-sm mb-1 flex items-center gap-1 ${isToday ? "text-green-700" : ""}`}>
                                    {day.getDate()}.{" "}
                                    {day.toLocaleDateString("de-DE", { month: "short" })}
                                    {isToday && (
                                        <span className="bg-green-600 text-white text-xs rounded px-1">
                                            Heute
                                        </span>
                                    )}
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
                        const isToday = dateStr === todayStr; // NEU
                        const dayEvents = events.filter((ev) => ev.dateLabel === dateStr);

                        return (
                            <div
                                key={dateStr}
                                className={`border rounded p-2 min-h-[120px] ${isToday
                                    ? "bg-green-50 border-green-500 ring-2 ring-green-400"
                                    : "bg-white"
                                    }`}
                            >
                                <div className={`font-bold text-sm mb-1 flex items-center gap-1 ${isToday ? "text-green-700" : ""}`}>
                                    {day.toLocaleDateString("de-DE", { weekday: "short" })}{" "}
                                    {day.getDate()}.
                                    {isToday && (
                                        <span className="bg-green-600 text-white text-xs rounded px-1">
                                            Heute
                                        </span>
                                    )}
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
