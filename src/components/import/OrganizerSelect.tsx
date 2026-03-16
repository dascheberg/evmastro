import React from "react";
import { useImportStore } from "../../store/useImportStore";
import StepButtons from "../utils/import/StepButtons";

export default function OrganizerSelect({ organizers }) {
    const organizerId = useImportStore((s) => s.organizerId);
    const setOrganizerId = useImportStore((s) => s.setOrganizerId);
    const nextStep = useImportStore((s) => s.nextStep);

    const isValid = organizerId !== null;

    return (
        <div className="space-y-6 w-2/3 mx-auto text-center">

            <h2 className="text-xl font-semibold">
                Wer hat die Veranstaltungen eingereicht?
            </h2>
            <div className="form-control w-full max-w-md mx-auto">
                <label className="label">
                    <span className="label-text font-medium">Organizer auswählen</span>
                </label>

                <select
                    className="select select-bordered w-full"
                    value={organizerId ?? ""}
                    onChange={(e) => setOrganizerId(Number(e.target.value))}
                >
                    <option value="" disabled>
                        Bitte auswählen…
                    </option>

                    {organizers.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.name}
                        </option>
                    ))}
                </select>
            </div>

            <StepButtons
                onBack={undefined}
                onNext={nextStep}
                nextEnabled={isValid} // Beispiel
            />

            {/* </div> */}
        </div>
    );
}
