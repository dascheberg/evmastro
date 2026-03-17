import React, { useEffect, useState } from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ListView({ filters, onSelectEvent }: {
    filters: any;
    onSelectEvent: (ev: DisplayEvent) => void;
}) {
    const [events, setEvents] = useState<DisplayEvent[]>([]);
    const [loading, setLoading] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? "");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search ?? ""), 300);
        return () => clearTimeout(timer);
    }, [filters.search]);

    function buildParams(): URLSearchParams {
        return new URLSearchParams({
            organizerId: filters.organizerId ? String(filters.organizerId) : "",
            locationId: filters.locationId ? String(filters.locationId) : "",
            typeId: filters.typeId ? String(filters.typeId) : "",
            month: filters.month ? String(filters.month) : "",
            year: filters.year ? String(filters.year) : "",
            search: debouncedSearch,
        });
    }

    useEffect(() => {
        setLoading(true);
        fetch(`/api/events-list?${buildParams()}`)
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .finally(() => setLoading(false));
    }, [
        filters.organizerId,
        filters.locationId,
        filters.typeId,
        filters.month,
        filters.year,
        debouncedSearch,
    ]);

    // ── iCal Export ───────────────────────────────────────────────────────────

    function exportICal() {
        window.location.href = `/api/events-ical?${buildParams()}`;
    }

    // ── CSV Export ────────────────────────────────────────────────────────────

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

    // ── PDF Export ────────────────────────────────────────────────────────────

    function exportPDF(data: DisplayEvent[]) {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Veranstaltungsliste", 14, 15);

        const grouped = data.reduce((acc, ev) => {
            const [day, month, year] = ev.dateLabel.split(".");
            const key = `${year}-${month.padStart(2, "0")}`;
            const label = new Date(Number(year), Number(month) - 1, 1)
                .toLocaleDateString("de-DE", { month: "long", year: "numeric" });
            if (!acc[key]) acc[key] = { label, rows: [] };
            acc[key].rows.push(ev);
            return acc;
        }, {} as Record<string, { label: string; rows: DisplayEvent[] }>);

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
                body: rows.map((ev) => [ev.dateLabel, ev.timeLabel, ev.organizerLabel, ev.locationLabel, ev.typeLabel]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [22, 101, 52] },
                margin: { top: 10 },
            });
            currentY = (doc as any).lastAutoTable.finalY + 10;
        });
        doc.save("veranstaltungen.pdf");
    }

    // ── Print ────────────────────────────────────────────────────────────────

    function openPrint() {
        window.open(`/print?${buildParams()}`, "_blank");
    }


    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">

            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => exportCSV(events)}
                        disabled={events.length === 0}
                    >
                        📄 CSV
                    </button>
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => exportPDF(events)}
                        disabled={events.length === 0}
                    >
                        📑 PDF
                    </button>
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={openPrint}
                        disabled={events.length === 0}
                        title="Druckansicht öffnen"
                    >
                        🖨️ Drucken
                    </button>
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={exportICal}
                        disabled={events.length === 0}
                        title="In Kalender-App importieren (.ics)"
                    >
                        📅 Kalender (.ics)
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {loading && <span className="text-sm text-gray-400">Suche…</span>}
                    <span className="text-sm text-gray-500">
                        {events.length} Veranstaltung{events.length !== 1 ? "en" : ""}
                    </span>
                </div>
            </div>

            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Uhrzeit</th>
                        <th>Veranstalter</th>
                        <th>Ort</th>
                        <th>Typ</th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 && !loading && (
                        <tr>
                            <td colSpan={5} className="text-center py-6 text-gray-400">
                                Keine Veranstaltungen gefunden.
                            </td>
                        </tr>
                    )}
                    {events.map((ev) => (
                        <tr
                            key={ev.id}
                            className="hover cursor-pointer"
                            onClick={() => onSelectEvent(ev)}
                        >
                            <td>{ev.dateLabel}</td>
                            <td>{ev.timeLabel}</td>
                            <td>{ev.organizerLabel}</td>
                            <td>{ev.locationLabel}</td>
                            <td>{ev.typeLabel}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
