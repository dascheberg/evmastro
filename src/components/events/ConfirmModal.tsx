import { useState } from "react";

export function useConfirm() {
    const [options, setOptions] = useState<{
        message: string;
        resolve: (value: boolean) => void;
    } | null>(null);

    function confirm(message: string): Promise<boolean> {
        return new Promise((resolve) => {
            setOptions({ message, resolve });
        });
    }

    function ConfirmModal() {
        if (!options) return null;

        return (
            <dialog open className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Bestätigung</h3>
                    <p className="mb-6 whitespace-pre-line">{options.message}</p>

                    <div className="modal-action">
                        <button
                            className="btn btn-error"
                            onClick={() => {
                                options.resolve(true);
                                setOptions(null);
                            }}
                        >
                            OK
                        </button>

                        <button
                            className="btn"
                            onClick={() => {
                                options.resolve(false);
                                setOptions(null);
                            }}
                        >
                            Abbrechen
                        </button>
                    </div>
                </div>
            </dialog>
        );
    }

    return { confirm, ConfirmModal };
}
