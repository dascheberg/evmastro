import React, { useEffect, useState } from "react";
import { useImportStore } from "../../store/useImportStore";

import OrganizerSelect from "./OrganizerSelect";
import FileUpload from "./FileUpload";
import HeaderChoice from "./HeaderChoice";
import MappingMask from "./MappingMask";
import PreviewTable from "./PreviewTable";
import StepButtons from "../utils/import/StepButtons";
import ImportHeader from "../utils/import/ImportHeader";

import { applyMapping } from "../../lib/import/mapping";
import { normalizeEvent } from "../../lib/import/normalize";
import { resolveEventIds } from "../../lib/import/lookup";

type Row = string[];

export default function ImportFlow({
    organizers,
    timeSlots,
    locations,
    eventTypes,
}) {
    const {
        step,
        nextStep,
        prevStep,
        organizerId,
        setOrganizerId,
        rows,
        setRows,
        setHasHeader,
        mapping,
        setMapping,
        events,
        setEvents,
        resolvedEvents,
        setResolvedEvents,
        saving,
        saveError,
        setSaving,
        setSaveError,
        initializeMapping,
        setOrganizers,
        success,
        setSuccess,
    } = useImportStore();

    const [fileSelected, setFileSelected] = useState(false);

    // Organizerliste in den Store übernehmen
    useEffect(() => {
        setOrganizers(organizers);
    }, [organizers, setOrganizers]);

    return (
        <>
            {/* GLOBALER HEADER */}
            <ImportHeader />

            {/* STEP 1 – Organizer wählen */}
            {step === 1 && (
                <div className="p-6 space-y-6">
                    <OrganizerSelect
                        organizers={organizers}
                        selectedId={organizerId}
                        setSelectedId={(id) => {
                            setOrganizerId(id);
                            nextStep();
                        }}
                    />
                </div>
            )}

            {/* STEP 2 – Datei hochladen */}
            {step === 2 && (
                <div className="p-6 space-y-6 w-2/3 mx-auto">
                    <FileUpload
                        onLoaded={(loadedRows: Row[]) => {
                            setRows(loadedRows);
                            if (loadedRows[0]) {
                                initializeMapping(loadedRows[0].length);
                            }
                        }}
                        onFileSelected={setFileSelected}
                    />

                    <StepButtons
                        onBack={prevStep}
                        onNext={nextStep}
                        nextEnabled={fileSelected}
                    />
                </div>
            )}

            {/* STEP 3 – Kopfzeile */}
            {step === 3 && (
                <div className="p-6 space-y-6">
                    <HeaderChoice
                        rows={rows}
                        onContinue={(cleanedRows, headerFlag) => {
                            setRows(cleanedRows);
                            setHasHeader(headerFlag);
                            setTimeout(() => nextStep(), 0);
                        }}
                    />

                    <StepButtons
                        onBack={prevStep}
                        onNext={nextStep}
                        nextEnabled={true}
                    />
                </div>
            )}

            {/* STEP 4 – Mapping */}
            {step === 4 && (
                <div className="p-6 space-y-6">
                    <MappingMask
                        rows={rows}
                        onBack={prevStep}
                        onComplete={(mappingResult) => {
                            setMapping(mappingResult);

                            const rawEvents = applyMapping(
                                rows,
                                mappingResult,
                                organizerId
                            );

                            const normalized = rawEvents.map((raw) => ({
                                ...normalizeEvent(raw),
                                organizerId,
                            }));

                            setEvents(normalized);
                            nextStep();
                        }}
                    />
                </div>
            )}

            {/* STEP 5 – Vorschau */}
            {step === 5 && (
                <div className="p-6 space-y-6 max-w-5xl mx-auto">
                    <h2 className="text-xl font-bold text-center">
                        {events.length} Veranstaltungen gefunden
                    </h2>

                    <PreviewTable
                        events={events}
                        onBack={prevStep}
                        onConfirm={() => {
                            const resolved = events.map((ev) =>
                                resolveEventIds(ev, {
                                    timeSlots,
                                    locations,
                                    eventTypes,
                                })
                            );

                            setResolvedEvents(resolved);
                            nextStep();
                        }}
                    />
                </div>
            )}

            {/* STEP 6 – Speichern */}
            {step === 6 && (
                <div className="p-6 space-y-6">

                    <h2 className="text-xl font-bold text-center">
                        {resolvedEvents.length} Veranstaltungen importieren
                    </h2>

                    {saveError && (
                        <p className="text-red-600 w-2/3 mx-auto text-center">
                            {saveError}
                        </p>
                    )}

                    {success && (
                        <p className="text-green-600 text-center text-lg font-semibold">
                            {resolvedEvents.length} Veranstaltungen erfolgreich importiert!
                        </p>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button className="btn" onClick={prevStep} disabled={saving}>
                            Zurück
                        </button>

                        <button
                            className="btn btn-primary"
                            disabled={saving || success}
                            onClick={async () => {
                                setSaving(true);
                                setSaveError(null);

                                try {
                                    const response = await fetch("/api/import-events", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ events: resolvedEvents }),
                                    });

                                    if (!response.ok) {
                                        throw new Error("Fehler beim Speichern");
                                    }

                                    // Erfolg
                                    setSuccess(true);

                                    // Nach 2 Sekunden zurück zum Dashboard
                                    setTimeout(() => {
                                        window.location.href = "/";
                                    }, 2000);

                                } catch (err) {
                                    console.error(err);
                                    setSaveError("Fehler beim Speichern der Events.");
                                    setSaving(false);
                                }
                            }}
                        >
                            {saving ? "Speichere ..." : "Import starten"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
