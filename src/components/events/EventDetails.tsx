import React from "react";
import type { DisplayEvent } from "../../utils/eventDisplay";
import { recurrenceToText, recurrenceIcon } from "../../utils/recurrence";
import {
    CalendarDaysIcon,
    ClockIcon,
    MapPinIcon,
    UserGroupIcon,
    TagIcon,
    DocumentTextIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ── Hilfsfunktion: Zeile in der Detailansicht ─────────────────────────────────

function DetailRow({
    icon,
    label,
    value,
    className = "",
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    if (!value) return null;

    return (
        <div className={`flex gap-3 ${className}`}>
            <div className="mt-0.5 text-green-700 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {label}
                </div>
                <div className="text-gray-800 font-medium">
                    {value}
                </div>
            </div>
        </div>
    );
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────

export function EventDetails({ event }: { event: DisplayEvent | null }) {

    if (!event) {
        return (
            <div className="p-6 bg-white rounded-xl shadow text-center space-y-2">
                <CalendarDaysIcon className="h-10 w-10 text-gray-200 mx-auto" />
                <p className="text-gray-400 text-sm">
                    Klicke auf eine Veranstaltung<br />um die Details zu sehen
                </p>
            </div>
        );
    }

    // recurrence aus raw-Objekt lesen falls vorhanden
    const raw = (event as any).raw ?? null;
    const recurrence = raw?.recurrence ?? null;
    const notes = raw?.notes ?? null;
    const endDate = raw?.endDate ?? null;
    const startDate = raw?.startDate ?? null;

    // Enddatum nur anzeigen wenn es sich vom Startdatum unterscheidet
    const showEndDate = endDate && endDate !== startDate;

    const recurrenceText = recurrenceToText(recurrence);
    const recurrenceIco = recurrenceIcon(recurrence);

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">

            {/* Farbiger Header */}
            <div className="bg-green-700 px-5 py-4">
                <h2 className="text-white font-bold text-lg leading-tight">
                    {event.typeLabel ?? "Veranstaltung"}
                </h2>
                <p className="text-green-200 text-sm mt-0.5">
                    {event.organizerLabel}
                </p>
            </div>

            {/* Detailfelder */}
            <div className="p-5 space-y-4">

                {/* Datum */}
                <DetailRow
                    icon={<CalendarDaysIcon className="h-5 w-5" />}
                    label="Datum"
                    value={
                        showEndDate
                            ? `${event.dateLabel} – ${new Date(endDate).toLocaleDateString("de-DE")}`
                            : event.dateLabel
                    }
                />

                {/* Uhrzeit */}
                {event.timeLabel && (
                    <DetailRow
                        icon={<ClockIcon className="h-5 w-5" />}
                        label="Uhrzeit"
                        value={event.timeLabel}
                    />
                )}

                {/* Veranstaltungsart */}
                <DetailRow
                    icon={<TagIcon className="h-5 w-5" />}
                    label="Veranstaltungsart"
                    value={event.typeLabel}
                />

                {/* Veranstalter */}
                <DetailRow
                    icon={<UserGroupIcon className="h-5 w-5" />}
                    label="Veranstalter"
                    value={event.organizerLabel}
                />

                {/* Ort */}
                <DetailRow
                    icon={<MapPinIcon className="h-5 w-5" />}
                    label="Veranstaltungsort"
                    value={event.locationLabel}
                />

                {/* Bemerkungen */}
                {notes && (
                    <DetailRow
                        icon={<DocumentTextIcon className="h-5 w-5" />}
                        label="Bemerkungen"
                        value={
                            <span className="text-gray-600 font-normal whitespace-pre-line">
                                {notes}
                            </span>
                        }
                    />
                )}

                {/* Wiederholung */}
                {recurrenceText && (
                    <DetailRow
                        icon={<ArrowPathIcon className="h-5 w-5" />}
                        label="Wiederholung"
                        value={
                            <span>
                                {recurrenceIco} {recurrenceText}
                            </span>
                        }
                    />
                )}

            </div>

            {/* Link zur Detailseite */}
            <div className="px-5 pb-4">
                <a
                    href={`/events/${event.id}`}
                    className="text-sm text-green-700 hover:text-green-900 hover:underline"
                >
                    → Vollständige Detailseite öffnen
                </a>
            </div>
        </div>
    );
}
