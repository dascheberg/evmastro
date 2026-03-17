import React, { useEffect, useState } from "react";
import { useImportStore } from "../../store/useImportStore";

import OrganizerSelect from "./OrganizerSelect";
import FileUpload from "./FileUpload";
import HeaderChoice from "./HeaderChoice";
import MappingMask from "./MappingMask";
import PreviewTable from "./PreviewTable";
import UnresolvedValuesStep from "./UnresolvedValuesStep";
import StepButtons from "../utils/import/StepButtons";
import ImportHeader from "../utils/import/ImportHeader";

import { applyMapping } from "../../lib/import/mapping";
import { normalizeEvent } from "../../lib/import/normalize";
import { resolveEventIds, findUnresolvedValues } from "../../lib/import/lookup";

type Row = string[];

export default function ImportFlow({
    organizers,
    timeSlots,
    locations,
    eventTypes,
}) {
    const {
        step, nextStep, prevStep, goToStep,
        organizerId, setOrganizerId,
        rows, setRows, setHasHeader,
        mapping, setMapping,
        events, setEvents,
        resolvedEvents, setResolvedEvents,
        unresolvedItems, setUnresolvedItems,
        setDiscardedRows, setDiscardedDetails,
        setImportSummary,
        saving, saveError, setSaving, setSaveError,
        initializeMapping,
        setOrganizers,
        success, setSuccess,
    } = useImportStore();

    const [fileSelected, setFileSelected] = useState(false);

    // Lookup-Listen als State damit wir sie nach "Anlegen" aktualisieren können
    const [currentTimeSlots, setCurrentTimeSlots] = useState(timeSlots);
    const [currentLocations, setCurrentLocations] = useState(locations);
    const [currentEventTypes, setCurrentEventTypes] = useState(eventTypes);

    useEffect(() => {
        setOrganizers(organizers);
    }, [organizers, setOrganizers]);

    // ── Schritt 5 → 5b oder 6 ────────────────────────────────────────────────

    function handlePreviewConfirm() {
        const unresolved = findUnresolvedValues(events, {
            timeSlots: currentTimeSlots,
            locations: currentLocations,
            eventTypes: currentEventTypes,
        });

        if (unresolved.length > 0) {
            // Es gibt unbekannte Werte → Schritt 5b
            setUnresolvedItems(unresolved);
            goToStep("5b");
        } else {
            // Alles bekannt → direkt zu Schritt 6
            const resolved = events.map((ev) =>
                resolveEventIds(ev, {
                    timeSlots: currentTimeSlots,
                    locations: currentLocations,
                    eventTypes: currentEventTypes,
                })
            );
            setResolvedEvents(resolved);
            goToStep(6);
        }
    }

    // ── Schritt 5b abgeschlossen ──────────────────────────────────────────────

    async function handleUnresolvedComplete(
        decisions: Record<string, "add" | "discard" | null>,
        newIds: Record<string, number>
    ) {
        // Lookup-Listen mit neu angelegten Werten aktualisieren
        const updatedTimeSlots = [...currentTimeSlots];
        const updatedLocations = [...currentLocations];
        const updatedEventTypes = [...currentEventTypes];

        for (const [key, id] of Object.entries(newIds)) {
            const [field, value] = key.split("::");
            if (field === "timeSlot") updatedTimeSlots.push({ id, name: value });
            if (field === "location") updatedLocations.push({ id, name: value });
            if (field === "eventType") updatedEventTypes.push({ id, name: value });
        }

        setCurrentTimeSlots(updatedTimeSlots);
        setCurrentLocations(updatedLocations);
        setCurrentEventTypes(updatedEventTypes);

        // Zeilen die verworfen werden sammeln
        const discardedIndices = new Set<number>();
        const discardedDetails: string[] = [];

        for (const [key, decision] of Object.entries(decisions)) {
            if (decision === "discard") {
                const [field, value] = key.split("::");
                const item = unresolvedItems.find(
                    (i) => i.field === field && i.value === value
                );
                if (item) {
                    item.affectedRows.forEach((idx) => discardedIndices.add(idx));
                    item.affectedRows.forEach((idx) =>
                        discardedDetails.push(
                            `Event #${idx + 1}: ${field === "timeSlot" ? "Uhrzeit" : field === "location" ? "Veranstaltungsort" : "Veranstaltungsart"} „${value}" nicht gefunden`
                        )
                    );
                }
            }
        }

        setDiscardedRows(Array.from(discardedIndices));
        setDiscardedDetails(discardedDetails);

        // Events ohne verworfene Zeilen auflösen
        const filteredEvents = events.filter((_, idx) => !discardedIndices.has(idx));

        const resolved = filteredEvents.map((ev) =>
            resolveEventIds(ev, {
                timeSlots: updatedTimeSlots,
                locations: updatedLocations,
                eventTypes: updatedEventTypes,
            })
        );

        setResolvedEvents(resolved);
        goToStep(6);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <ImportHeader />

            {/* STEP 1 – Organizer wählen */}
            {step === 1 && (
                <div className="p-6 space-y-6">
                    <OrganizerSelect
                        organizers={organizers}
                        selectedId={organizerId}
                        setSelectedId={(id) => { setOrganizerId(id); nextStep(); }}
                    />
                </div>
            )}

            {/* STEP 2 – Datei hochladen */}
            {step === 2 && (
                <div className="p-6 space-y-6 w-2/3 mx-auto">
                    <FileUpload
                        onLoaded={(loadedRows: Row[]) => {
                            setRows(loadedRows);
                            if (loadedRows[0]) initializeMapping(loadedRows[0].length);
                        }}
                        onFileSelected={setFileSelected}
                    />
                    <StepButtons onBack={prevStep} onNext={nextStep} nextEnabled={fileSelected} />
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
                    <StepButtons onBack={prevStep} onNext={nextStep} nextEnabled={true} />
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

                            const rawEvents = applyMapping(rows, mappingResult, organizerId);
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
                        onConfirm={handlePreviewConfirm}
                    />
                </div>
            )}

            {/* STEP 5b – Unbekannte Werte klären */}
            {step === "5b" && (
                <div className="p-6 space-y-6">
                    <UnresolvedValuesStep
                        unresolvedItems={unresolvedItems}
                        onComplete={handleUnresolvedComplete}
                        onBack={() => goToStep(5)}
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
                        <p className="text-red-600 w-2/3 mx-auto text-center">{saveError}</p>
                    )}

                    {success && useImportStore.getState().importSummary && (() => {
                        const summary = useImportStore.getState().importSummary!;
                        return (
                            <div className="w-2/3 mx-auto space-y-3">
                                <p className="text-green-600 text-center text-lg font-semibold">
                                    ✅ {summary.inserted} Veranstaltungen erfolgreich importiert!
                                </p>
                                {summary.discarded.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                                        <p className="font-semibold text-yellow-800 mb-2">
                                            ⚠️ {summary.discarded.length} Event(s) wurden verworfen:
                                        </p>
                                        <ul className="text-sm text-yellow-700 space-y-1">
                                            {summary.discarded.map((d, i) => (
                                                <li key={i}>• {d}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div className="flex gap-4 justify-center">
                        <button
                            className="btn"
                            onClick={() => goToStep(5)}
                            disabled={saving}
                        >
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

                                    if (!response.ok) throw new Error("Fehler beim Speichern");

                                    const discardedDetails = useImportStore.getState().discardedDetails;

                                    setImportSummary({
                                        inserted: resolvedEvents.length,
                                        discarded: discardedDetails,
                                    });

                                    setSuccess(true);

                                    // Nach 4 Sekunden zurück zum Dashboard
                                    setTimeout(() => {
                                        window.location.href = "/";
                                    }, 4000);

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
