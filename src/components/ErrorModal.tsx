import React from "react";

type Props = {
    message: string;
    onClose: () => void;
};

export function ErrorModal({ message, onClose }: Props) {
    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-semibold mb-3 text-red-700">Fehler</h2>
                <p className="mb-4 text-gray-800">{message}</p>

                <div className="text-right">
                    <button className="btn btn-sm" onClick={onClose}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
