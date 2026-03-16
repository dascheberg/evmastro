import React from "react";

interface StepButtonsProps {
    onBack: () => void;
    onNext: () => void;
    nextEnabled?: boolean;
}

export default function StepButtons({
    onBack,
    onNext,
    nextEnabled = true,
}: StepButtonsProps) {
    return (
        <div className="w-1/2 mx-auto flex justify-between mt-4">
            <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
                Zurück
            </button>
            <button
                type="button"
                onClick={onNext}
                disabled={!nextEnabled}
                className={`px-6 py-2 rounded-md shadow transition ${nextEnabled
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
            >
                Weiter
            </button>
        </div>
    );
}
