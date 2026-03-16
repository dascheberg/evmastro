import React, { useEffect, useState } from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // npm install jspdf-autotable

export function ListView({ filters, onSelectEvent }: {
    filters: any;
    onSelectEvent: (ev: DisplayEvent) => void;
}) {
    const [events, setEvents] = useState<DisplayEvent[]>([]);

    useEffect(() => {
        const params = new URLSearchParams({
            organizerId: filters.organizerId ? String(filters.organizerId) : "",
            locationId: filters.locationId ? String(filters.locationId) : "",
            typeId: filters.typeId ? String(filters.typeId) : "",
            month: filters.month ? String(filters.month) : "",
            year: filters.year ? String(filters.year) : "",
            search: filters.search ?? "",
        });

        fetch(`/api/events-list?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => setEvents(data));
    }, [filters]);

    // ── CSV ────────────────────────────────────────────────────────
    function exportCSV(data: DisplayEvent[]) {
        const header = ["Datum", "Uhrzeit", "Veranstalter", "Ort", "Typ"];

        const rows = data.map((ev) => [
            ev.dateLabel ?? "",
            ev.timeLabel ?? "",
            ev.organizerLabel ?? "",
            ev.locationLabel ?? "",
            ev.typeLabel ?? "",
            // ← hier aufhören, kein weiteres Feld!
        ]);

        const csv = [header, ...rows]
            .map((row) =>
                row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")
            )
            .join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "veranstaltungen.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    // ── PDF ────────────────────────────────────────────────────────
    function exportPDF(data: DisplayEvent[]) {
        const doc = new jsPDF();

        doc.setFontSize(14);
        doc.text("Veranstaltungsliste", 14, 15);

        // ── nach Monat gruppieren ──────────────────────────────────
        const grouped = data.reduce((acc, ev) => {
            // dateLabel ist "1.3.2026" → parsen
            const [day, month, year] = ev.dateLabel.split(".");
            const key = `${year}-${month.padStart(2, "0")}`; // "2026-03"
            const label = new Date(Number(year), Number(month) - 1, 1)
                .toLocaleDateString("de-DE", { month: "long", year: "numeric" });

            if (!acc[key]) acc[key] = { label, rows: [] };
            acc[key].rows.push(ev);
            return acc;
        }, {} as Record<string, { label: string; rows: DisplayEvent[] }>);

        // ── sortiert nach Datum ausgeben ──────────────────────────
        let currentY = 22;

        Object.keys(grouped).sort().forEach((key) => {
            const { label, rows } = grouped[key];

            // Monatsüberschrift
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

            // Y-Position für nächsten Block aktualisieren
            currentY = (doc as any).lastAutoTable.finalY + 10;
        });

        doc.save("veranstaltungen.pdf");
    }
    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button
                    className="btn btn-sm btn-outline"
                    onClick={() => exportCSV(events)}
                    disabled={events.length === 0}
                >
                    CSV exportieren
                </button>
                <button
                    className="btn btn-sm btn-outline"
                    onClick={() => exportPDF(events)}
                    disabled={events.length === 0}
                >
                    PDF exportieren
                </button>
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
