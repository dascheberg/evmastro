import React, { useEffect, useState, useRef } from "react";
import { LookupCombobox } from "../utils/lookup/LookupCombobox";
import { LookupLabel } from "../utils/lookup/LookupLabel";
import { RecurrenceForm } from "./RecurrenceForm";
import { type Recurrence } from "../../utils/recurrence";

type EventFormState = {
    startDate: string;
    endDate: string;
    organizerId: number | null;
    eventTypeId: number | null;
    locationId: number | null;
    timeSlotsId: number | null;
    notes: string;
    recurrence: Recurrence | null;
};

type EventFormProps = {
    event: any | null;
    onSaved: () => void;
    handleCancel: () => void;
};

type DuplicateInfo = {
    existingEvent: {
        id: number;
        startDate: string;
        organizerName: string;
        locationName: string;
        typeName: string;
        timeSlotName: string | null;
    };
};

async function fetchName(api: string, id: number | null): Promise<string> {
    if (!id) return "";
    try {
        const res = await fetch(api);
        if (!res.ok) return "";
        const items: { id: number; name: string }[] = await res.json();
        return items.find((i) => i.id === id)?.name ?? "";
    } catch {
        return "";
    }
}

const EMPTY_FORM: EventFormState = {
    startDate: "",
    endDate: "",
    organizerId: null,
    eventTypeId: null,
    locationId: null,
    timeSlotsId: null,
    notes: "",
    recurrence: null,
};

export function EventForm({ event, onSaved, handleCancel }: EventFormProps) {

    const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
    const [formKey, setFormKey] = useState(0);
    const [isAddingOrganizer, setIsAddingOrganizer] = useState(false);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [isAddingType, setIsAddingType] = useState(false);
    const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
    const [dupChecking, setDupChecking] = useState(false);
    const dupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Namen für CSV-Export
    const [locationName, setLocationName] = useState("");
    const [eventTypeName, setEventTypeName] = useState("");
    const [timeSlotName, setTimeSlotName] = useState("");

    // ← NEU: Felder-behalten Toggle
    const [keepFields, setKeepFields] = useState(false);

    useEffect(() => {
        if (event) {
            setForm({
                startDate: event.startDate ?? "",
                endDate: event.endDate ?? "",
                timeSlotsId: event.timeId ?? null,
                organizerId: event.organizerId ?? null,
                eventTypeId: event.typeId ?? null,
                locationId: event.locationId ?? null,
                recurrence: event.recurrence ?? null,
                notes: event.notes ?? "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setSuccessMessage("");
        setErrorMessage("");
        setDuplicate(null);
    }, [event]);

    useEffect(() => {
        fetchName("/api/lookups/locations", form.locationId).then(setLocationName);
    }, [form.locationId]);

    useEffect(() => {
        fetchName("/api/lookups/eventTypes", form.eventTypeId).then(setEventTypeName);
    }, [form.eventTypeId]);

    useEffect(() => {
        fetchName("/api/lookups/timeSlots", form.timeSlotsId).then(setTimeSlotName);
    }, [form.timeSlotsId]);

    // Duplikat-Prüfung mit 500ms Debounce
    useEffect(() => {
        if (!form.startDate || !form.organizerId || !form.locationId || !form.eventTypeId) {
            setDuplicate(null);
            return;
        }
        if (dupTimerRef.current) clearTimeout(dupTimerRef.current);
        dupTimerRef.current = setTimeout(async () => {
            setDupChecking(true);
            try {
                const res = await fetch("/api/check-duplicates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify([{
                        startDate: form.startDate,
                        organizerId: form.organizerId,
                        locationId: form.locationId,
                        typeId: form.eventTypeId,
                        excludeId: event?.id,
                    }]),
                });
                const duplicates = await res.json();
                setDuplicate(duplicates.length > 0 ? duplicates[0] : null);
            } catch {
                setDuplicate(null);
            } finally {
                setDupChecking(false);
            }
        }, 500);
        return () => { if (dupTimerRef.current) clearTimeout(dupTimerRef.current); };
    }, [form.startDate, form.organizerId, form.locationId, form.eventTypeId]);

    function update(field: string, value: any) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    function updateStartDate(value: string) {
        // endDate wird immer still auf startDate gesetzt (Feld ist versteckt)
        setForm(f => ({ ...f, startDate: value, endDate: value }));
    }

    function resetAndCancel() {
        setForm(EMPTY_FORM);
        setFormKey(k => k + 1);
        setDuplicate(null);
        setErrorMessage("");
        setSuccessMessage("");
        handleCancel();
    }

    async function save(ignoreDuplicate = false) {
        if (!form.startDate) { setErrorMessage("Bitte ein Beginndatum eingeben."); return; }
        if (!form.organizerId) { setErrorMessage("Bitte einen Veranstalter auswählen."); return; }
        if (!form.locationId) { setErrorMessage("Bitte einen Veranstaltungsort auswählen."); return; }
        if (!form.eventTypeId) { setErrorMessage("Bitte eine Veranstaltungsart auswählen."); return; }
        if (duplicate && !ignoreDuplicate) {
            setErrorMessage("Bitte bestätige dass du das Duplikat trotzdem speichern möchtest.");
            return;
        }

        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const method = event ? "PUT" : "POST";
            const url = event ? `/api/events/${event.id}` : `/api/events`;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Fehler beim Speichern");

            setSuccessMessage(event ? "Veranstaltung gespeichert!" : "Veranstaltung hinzugefügt!");

            if (!event) {
                if (keepFields) {
                    // ← Nur Datum und Wiederholung zurücksetzen, Rest behalten
                    setForm(f => ({ ...f, startDate: "", endDate: "", recurrence: null }));
                    setFormKey(k => k + 1);  // RecurrenceForm zurücksetzen
                } else {
                    // Alles leeren wie bisher
                    setForm(EMPTY_FORM);
                    setFormKey(k => k + 1);
                }
                setDuplicate(null);
            }

            onSaved();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch {
            setErrorMessage("Fehler beim Speichern. Bitte erneut versuchen.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="bg-green-200 p-4 rounded-lg shadow space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    {event ? "Veranstaltung bearbeiten" : "Neue Veranstaltung eingeben"}
                </h2>

                {/* ← NEU: Felder-behalten Toggle — nur bei Neuanlage sinnvoll */}
                {!event && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={keepFields}
                            onChange={(e) => setKeepFields(e.target.checked)}
                        />
                        <span className="text-xs font-medium text-gray-700">
                            Felder nach Speichern behalten
                        </span>
                    </label>
                )}
            </div>

            {successMessage && (
                <div className="alert alert-success text-sm py-2">✅ {successMessage}</div>
            )}
            {errorMessage && (
                <div className="alert alert-error text-sm py-2">❌ {errorMessage}</div>
            )}

            {dupChecking && (
                <div className="text-xs text-gray-500 italic">Prüfe auf Duplikate…</div>
            )}
            {duplicate && !dupChecking && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-semibold text-yellow-800">⚠️ Mögliches Duplikat gefunden!</p>
                    <p className="text-sm text-yellow-700">Es existiert bereits ein ähnliches Event:</p>
                    <div className="text-sm text-yellow-800 bg-yellow-100 rounded p-2 space-y-0.5">
                        <div className="font-medium">
                            {new Date(duplicate.existingEvent.startDate).toLocaleDateString("de-DE")}
                            {duplicate.existingEvent.timeSlotName && ` · ${duplicate.existingEvent.timeSlotName} Uhr`}
                        </div>
                        <div>{duplicate.existingEvent.typeName}</div>
                        <div className="text-xs text-yellow-600">
                            {duplicate.existingEvent.organizerName} · {duplicate.existingEvent.locationName}
                        </div>
                        <a href={`/events/${duplicate.existingEvent.id}`} target="_blank"
                            className="text-xs text-yellow-700 underline">
                            → Event #{duplicate.existingEvent.id} ansehen
                        </a>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button className="btn btn-sm bg-yellow-600 text-white"
                            onClick={() => save(true)} disabled={isSaving}>
                            Trotzdem speichern
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => {
                            setDuplicate(null); setForm(EMPTY_FORM);
                            setFormKey(k => k + 1);
                            setErrorMessage(""); setSuccessMessage("");
                        }}>
                            Warnung schließen
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Beginndatum + Uhrzeit — endDate ist versteckt, wird intern = startDate gesetzt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">
                            <span className="px-2 py-1 text-black rounded text-sm font-bold">Beginndatum</span>
                        </label>
                        <input type="date" className="input input-bordered w-full"
                            value={form.startDate} onChange={(e) => updateStartDate(e.target.value)} />
                    </div>
                    <div>
                        <LookupLabel label="Beginn-Uhrzeit" isAdding={isAddingTimeSlot} />
                        <LookupCombobox api="/api/lookups/timeSlots" value={form.timeSlotsId}
                            onChange={(id) => update("timeSlotsId", id)}
                            onAddModeChange={setIsAddingTimeSlot} />
                    </div>
                </div>

                <LookupLabel label="Veranstalter" isAdding={isAddingOrganizer} />
                <LookupCombobox api="/api/lookups/organizers" value={form.organizerId}
                    onChange={(id) => update("organizerId", id)}
                    onAddModeChange={setIsAddingOrganizer} />

                <LookupLabel label="Veranstaltungsart" isAdding={isAddingType} />
                <LookupCombobox api="/api/lookups/eventTypes" value={form.eventTypeId}
                    onChange={(id) => update("eventTypeId", id)}
                    onAddModeChange={setIsAddingType} />

                <LookupLabel label="Veranstaltungsort" isAdding={isAddingLocation} />
                <LookupCombobox api="/api/lookups/locations" value={form.locationId}
                    onChange={(id) => update("locationId", id)}
                    onAddModeChange={setIsAddingLocation} />

                <div>
                    <label className="label">
                        <span className="px-2 py-1 rounded text-sm font-bold text-black">Bemerkungen</span>
                    </label>
                    <textarea className="textarea textarea-bordered w-full" rows={3}
                        value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                </div>

                <RecurrenceForm
                    key={formKey}
                    startDate={form.startDate}
                    value={form.recurrence}
                    onChange={(r) => update("recurrence", r)}
                    locationName={locationName}
                    eventTypeName={eventTypeName}
                    timeSlotName={timeSlotName}
                />
            </div>

            <div className="flex gap-2 justify-center pt-4">
                {!duplicate && (
                    <button
                        className="btn bg-green-800 text-white font-bold text-base rounded-lg w-48 h-12"
                        onClick={() => save(false)} disabled={isSaving}>
                        {isSaving ? "Speichere..." : event ? "Speichern" : "Hinzufügen"}
                    </button>
                )}
                <button
                    className="btn bg-red-800 text-white font-bold text-base rounded-lg w-48 h-12"
                    onClick={resetAndCancel} disabled={isSaving}>
                    Abbrechen
                </button>
            </div>
        </div>
    );
}
