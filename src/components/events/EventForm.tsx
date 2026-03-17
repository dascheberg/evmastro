import React, { useEffect, useState } from "react";
import { LookupCombobox } from "../utils/lookup/LookupCombobox";
import { LookupLabel } from "../utils/lookup/LookupLabel";

type EventFormState = {
    startDate: string;
    endDate: string;
    organizerId: number | null;
    eventTypeId: number | null;
    locationId: number | null;
    timeSlotsId: number | null;
    notes: string;
};

type EventFormProps = {
    event: any | null;
    onSaved: () => void;
    onCancel: () => void;
};

const EMPTY_FORM: EventFormState = {
    startDate: "",
    endDate: "",
    organizerId: null,
    eventTypeId: null,
    locationId: null,
    timeSlotsId: null,
    notes: "",
};

export function EventForm({ event, onSaved, onCancel }: EventFormProps) {

    const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
    const [isEndDateSynced, setIsEndDateSynced] = useState(true);

    const [isAddingOrganizer, setIsAddingOrganizer] = useState(false);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [isAddingType, setIsAddingType] = useState(false);
    const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);

    // NEU: Status für Erfolgsmeldung und Fehler
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Formular füllen wenn ein Event bearbeitet wird
    useEffect(() => {
        if (event) {
            setForm({
                startDate: event.startDate ?? "",
                endDate: event.endDate ?? "",
                timeSlotsId: event.timeId ?? null,
                organizerId: event.organizerId ?? null,
                eventTypeId: event.typeId ?? null,
                locationId: event.locationId ?? null,
                notes: event.notes ?? "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
        // Meldungen zurücksetzen wenn ein anderes Event geladen wird
        setSuccessMessage("");
        setErrorMessage("");
    }, [event]);

    function update(field: string, value: any) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    function updateStartDate(value: string) {
        setForm(f => {
            const updated = { ...f, startDate: value };
            if (isEndDateSynced) updated.endDate = value;
            return updated;
        });
    }

    function updateEndDate(value: string) {
        setForm(f => ({ ...f, endDate: value }));
        setIsEndDateSynced(value === form.startDate);
    }

    async function save() {
        // Pflichtfeld-Validierung
        if (!form.startDate) {
            setErrorMessage("Bitte ein Beginndatum eingeben.");
            return;
        }
        if (!form.organizerId) {
            setErrorMessage("Bitte einen Veranstalter auswählen.");
            return;
        }
        if (!form.locationId) {
            setErrorMessage("Bitte einen Veranstaltungsort auswählen.");
            return;
        }
        if (!form.eventTypeId) {
            setErrorMessage("Bitte eine Veranstaltungsart auswählen.");
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

            if (!res.ok) {
                throw new Error("Fehler beim Speichern");
            }

            // Erfolgsmeldung anzeigen
            setSuccessMessage(event ? "Veranstaltung gespeichert!" : "Veranstaltung hinzugefügt!");

            // Bei Neu-Eingabe: Formular zurücksetzen
            if (!event) {
                setForm(EMPTY_FORM);
                setIsEndDateSynced(true);
            }

            // Eltern-Komponente informieren (Tabelle neu laden)
            onSaved();

            // Erfolgsmeldung nach 3 Sekunden ausblenden
            setTimeout(() => setSuccessMessage(""), 3000);

        } catch (err) {
            setErrorMessage("Fehler beim Speichern. Bitte erneut versuchen.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="bg-green-200 p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-bold">
                {event ? "Veranstaltung bearbeiten" : "Neue Veranstaltung eingeben"}
            </h2>

            {/* Erfolgsmeldung */}
            {successMessage && (
                <div className="alert alert-success text-sm py-2">
                    ✅ {successMessage}
                </div>
            )}

            {/* Fehlermeldung */}
            {errorMessage && (
                <div className="alert alert-error text-sm py-2">
                    ❌ {errorMessage}
                </div>
            )}

            <div className="space-y-4">

                {/* Datum + Uhrzeit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">
                            <span className="px-2 py-1 text-black rounded text-sm font-bold">
                                Beginndatum
                            </span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={form.startDate}
                            onChange={(e) => updateStartDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="px-2 py-1 text-black rounded text-sm font-bold">
                                Enddatum
                            </span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={form.endDate}
                            onChange={(e) => updateEndDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <LookupLabel label="Beginn-Uhrzeit" isAdding={isAddingTimeSlot} />
                        <LookupCombobox
                            api="/api/lookups/timeSlots"
                            value={form.timeSlotsId}
                            onChange={(id) => update("timeSlotsId", id)}
                            onAddModeChange={setIsAddingTimeSlot}
                        />
                    </div>
                </div>

                {/* Veranstalter */}
                <LookupLabel label="Veranstalter" isAdding={isAddingOrganizer} />
                <LookupCombobox
                    api="/api/lookups/organizers"
                    value={form.organizerId}
                    onChange={(id) => update("organizerId", id)}
                    onAddModeChange={setIsAddingOrganizer}
                />

                {/* Veranstaltungsart */}
                <LookupLabel label="Veranstaltungsart" isAdding={isAddingType} />
                <LookupCombobox
                    api="/api/lookups/eventTypes"
                    value={form.eventTypeId}
                    onChange={(id) => update("eventTypeId", id)}
                    onAddModeChange={setIsAddingType}
                />

                {/* Veranstaltungsort */}
                <LookupLabel label="Veranstaltungsort" isAdding={isAddingLocation} />
                <LookupCombobox
                    api="/api/lookups/locations"
                    value={form.locationId}
                    onChange={(id) => update("locationId", id)}
                    onAddModeChange={setIsAddingLocation}
                />

                {/* Bemerkungen */}
                <div>
                    <label className="label">
                        <span className="px-2 py-1 rounded text-sm font-bold text-black">
                            Bemerkungen
                        </span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        rows={3}
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                    />
                </div>

            </div>

            <div className="flex gap-2 justify-center pt-4">
                <button
                    className="btn bg-green-800 text-white font-bold text-base rounded-lg w-48 h-12"
                    onClick={save}
                    disabled={isSaving}
                >
                    {isSaving ? "Speichere..." : event ? "Speichern" : "Hinzufügen"}
                </button>

                <button
                    className="btn bg-red-800 text-white font-bold text-base rounded-lg w-48 h-12"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Abbrechen
                </button>
            </div>
        </div>
    );
}
