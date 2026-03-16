import React, { useEffect, useState } from "react";
import { LookupCombobox } from "../utils/lookup/LookupCombobox";
import { LookupLabel } from "../utils/lookup/LookupLabel";

// ⬆️ HIER kommt die Typdefinition hin
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

export function EventForm({ event, onSaved, onCancel }: EventFormProps) {

    const [form, setForm] = useState<EventFormState>({
        startDate: "",
        endDate: "",
        organizerId: null,
        eventTypeId: null,
        locationId: null,
        timeSlotsId: null,
        notes: "",
    });

    const [isAddingOrganizer, setIsAddingOrganizer] = useState(false);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [isAddingType, setIsAddingType] = useState(false);
    const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);
    const [isEndDateSynced, setIsEndDateSynced] = useState(true);


    // Formular füllen, wenn ein Event bearbeitet wird
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
            // Neu-Modus → leeres Formular
            setForm({
                startDate: "",
                endDate: "",
                organizerId: null,
                eventTypeId: null,
                locationId: null,
                timeSlotsId: null,
                notes: "",
            });
        }
    }, [event]);

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function save() {
        const method = event ? "PUT" : "POST";
        const url = event ? `/api/events/${event.id}` : `/api/events`;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        onSaved();
    }

    function updateStartDate(value: string) {
        setForm(f => {
            const updated = { ...f, startDate: value };

            if (isEndDateSynced) {
                updated.endDate = value;
            }

            return updated;
        });
    }

    function updateEndDate(value: string) {
        setForm(f => ({ ...f, endDate: value }));

        if (value === form.startDate) {
            setIsEndDateSynced(true);
        } else {
            setIsEndDateSynced(false);
        }
    }

    return (
        <div className="bg-green-200 p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-bold">
                {event ? "Veranstaltung bearbeiten" : "Neue Veranstaltung eingeben"}
            </h2>

            {/* Hier kommen gleich die Felder rein */}
            <div className="space-y-4">

                {/* Datum */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>

                        <label className="label">
                            <span className="px-2 py-1 text-black rounded text-sm font-bold">Beginndatum</span>
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
                            <span className="px-2 py-1 text-black rounded text-sm font-bold">Enddatum</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={form.endDate}
                            onChange={(e) => updateEndDate(e.target.value)}
                        />
                    </div>
                    {/* Uhrzeit */}
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
                        <span className="px-2 py-1 rounded text-sm font-bold text-black">Bemerkungen</span>
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
                <button className="btn bg-green-800 text-white font-bold text-base rounded-lg w-48 h-12" onClick={save}>
                    {event ? "Speichern" : "Hinzufügen"}
                </button>

                <button className="btn bg-red-800 text-white font-bold text-base rounded-lg w-48 h-12" onClick={onCancel}>
                    Abbrechen
                </button>
            </div>

        </div>
    );
}
