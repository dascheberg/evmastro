import React, { useEffect, useMemo, useState } from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";
import type { EventFilters } from "./filterTypes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    ClockIcon,
    MapPinIcon,
    DocumentArrowUpIcon,
    DocumentIcon,
    PrinterIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/solid";

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
        if (filters.quarter === 1) return { from: `${year}-01-01`, to: `${year}-03-31` };
        if (filters.quarter === 2) return { from: `${year}-04-01`, to: `${year}-06-30` };
        if (filters.quarter === 3) return { from: `${year}-07-01`, to: `${year}-09-30` };
        return { from: `${year}-10-01`, to: `${year}-12-31` };
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { from: toIsoLocal(start), to: toIsoLocal(end) };
}

export function ListView({
    filters,
    onSelectEvent,
}: {
    filters: EventFilters & { search?: string };
    onSelectEvent: (ev: DisplayEvent) => void;
}) {
    const [events, setEvents] = useState<DisplayEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? "");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search ?? ""), 300);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const params = useMemo(() => {
        const { from, to } = getRangeFromFilters(filters);
        const q = new URLSearchParams({ from, to });

        // Optionaler Fallback für ältere Endpunkte
        const fromDate = new Date(from);
        q.set("month", String(fromDate.getMonth() + 1));
        q.set("year", String(fromDate.getFullYear()));

        if (filters.organizerId) q.set("organizerId", String(filters.organizerId));
        if (filters.locationId) q.set("locationId", String(filters.locationId));
        if (filters.typeId) q.set("typeId", String(filters.typeId));
        if (debouncedSearch) q.set("search", debouncedSearch);

        return q;
    }, [filters, debouncedSearch]);

    const queryString = useMemo(() => params.toString(), [params]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/events-by-range?${queryString}`)
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .finally(() => setLoading(false));
    }, [queryString]);

    const grouped = events.reduce((acc, ev) => {
        const [, month, year] = ev.dateLabel.split(".");
        const key = `${year}-${month.padStart(2, "0")}`;
        const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("de-DE", {
            month: "long",
            year: "numeric",
        });
        if (!acc[key]) acc[key] = { label, rows: [] };
        acc[key].rows.push(ev);
        return acc;
    }, {} as Record<string, { label: string; rows: DisplayEvent[] }>);

    function exportICal() {
        window.location.href = `/api/events-ical?${queryString}`;
    }

    function exportCSV(data: DisplayEvent[]) {
        const header = ["Datum", "Uhrzeit", "Veranstalter", "Ort", "Typ"];
        const rows = data.map((ev) => [
            ev.dateLabel ?? "",
            ev.timeLabel ?? "",
            ev.organizerLabel ?? "",
            ev.locationLabel ?? "",
            ev.typeLabel ?? "",
        ]);
        const csv = [header, ...rows]
            .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
            .join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "veranstaltungen.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    function exportPDF() {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Veranstaltungsliste", 14, 15);

        let currentY = 22;
        Object.keys(grouped).sort().forEach((key) => {
            const { label, rows } = grouped[key];
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(label, 14, currentY);
            currentY += 2;
            autoTable(doc, {
                startY: currentY,
                head: [["Datum", "Uhrzeit", "Veranstalter", "Ort", "Typ"]],
                body: rows.map((ev) => [
                    ev.dateLabel,
                    ev.timeLabel,
                    ev.organizerLabel,
                    ev.locationLabel,
                    ev.typeLabel,
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [22, 101, 52] },
                margin: { top: 10 },
            });
            currentY = (doc as any).lastAutoTable.finalY + 10;
        });
        doc.save("veranstaltungen.pdf");
    }

    function openPrint() {
        window.open(`/print?${queryString}`, "_blank");
    }

    return (
        <div className="space-y-4">

            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                    <button
                        className="btn btn-sm btn-outline text-black gap-2"
                        onClick={() => exportCSV(events)}
                        disabled={events.length === 0}
                        title="Als CSV-Datei herunterladen"
                    >
                        <DocumentArrowUpIcon className="h-6 w-6 text-black" /> CSV
                    </button>
                    <button
                        className="btn btn-sm btn-outline gap-2"
                        onClick={exportPDF}
                        disabled={events.length === 0}
                        title="Als PDF herunterladen"
                    >
                        <DocumentIcon className="h-6 w-6 text-black" />  PDF
                    </button>
                    <button
                        className="btn btn-sm btn-outline text-black gap-2"
                        onClick={openPrint}
                        disabled={events.length === 0}
                        title="Druckansicht öffnen"
                    >
                        <PrinterIcon className="h-6 w-6 text-black" />  Drucken
                    </button>
                    <button
                        className="btn btn-sm btn-outline text-black gap-2"
                        onClick={exportICal}
                        disabled={events.length === 0}
                        title="In Kalender-App importieren (.ics)"
                    >
                        <CalendarDaysIcon className="h-6 w-6 text-black" />  Kalender (.ics)
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {loading && (
                        <span className="loading loading-spinner loading-sm text-gray-400"></span>
                    )}
                    <span className="text-sm text-gray-500 font-medium">
                        {events.length} Veranstaltung{events.length !== 1 ? "en" : ""}
                    </span>
                </div>
            </div>

            {/* Keine Ergebnisse */}
            {events.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-2">📭</div>
                    <div>Keine Veranstaltungen gefunden.</div>
                </div>
            )}

            {/* Gruppiert nach Monat */}
            {Object.keys(grouped).sort().map((key) => {
                const { label, rows } = grouped[key];
                return (
                    <div key={key} className="space-y-1">
                        {/* Monats-Header */}
                        <div className="flex items-center gap-3 py-2">
                            <span className="p-2 rounded-lg text-base font-bold text-white bg-green-800">{label}</span>
                            <div className="flex-1 border-t border-green-200"></div>
                            <span className="badge badge-sm bg-green-800 text-white border-0">
                                {rows.length} Termin{rows.length !== 1 ? "e" : ""}
                            </span>
                        </div>

                        {/* Events des Monats */}
                        <div className="space-y-1">
                            {rows.map((ev, idx) => (
                                <button
                                    key={ev.id}
                                    className={`w-full text-left rounded-lg px-4 py-3 transition-colors hover:bg-green-50 hover:shadow-sm border border-transparent hover:border-green-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        }`}
                                    onClick={() => onSelectEvent(ev)}
                                >
                                    <div className="flex items-center gap-4 flex-wrap">

                                        {/* Datum */}
                                        <div className="w-24 shrink-0">
                                            <span className="font-bold text-gray-800">{ev.dateLabel}</span>
                                        </div>

                                        {/* Zeitfenster */}
                                        {ev.timeLabel && (
                                            <div className="w-28 shrink-0 text-sm text-gray-500">
                                                <ClockIcon className="inline-block w-6 h-6 mr-1 text-orange-400" />
                                                {ev.timeLabel}
                                            </div>
                                        )}

                                        {/* Veranstalter */}
                                        <div className="w-48 shrink-0">
                                            <span className="font-medium text-gray-800 truncate">
                                                {ev.organizerLabel}
                                            </span>
                                        </div>

                                        {/* Ort */}
                                        {ev.locationLabel && (
                                            <div className="w-72 text-sm text-gray-500 shrink-0">
                                                <MapPinIcon className="inline-block w-4 h-4 ml-1 text-blue-600" />
                                                {ev.locationLabel}
                                            </div>
                                        )}

                                        {/* Typ als Badge */}
                                        {ev.typeLabel && (
                                            <div className="shrink-0">
                                                <span className="badge badge-default bg-green-100 text-green-800 border-green-200">
                                                    {ev.typeLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
