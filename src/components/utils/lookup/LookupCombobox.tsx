import { useEffect, useState } from "react";
import { PlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

type LookupItem = {
    id: number;
    name: string;
};

export function LookupCombobox({
    api,
    value,
    onChange,
    placeholder,
    onAddModeChange,
}: {
    api: string;
    value: number | null;
    onChange: (id: number | null) => void;
    placeholder?: string;
    onAddModeChange?: (adding: boolean) => void;
}) {
    const [items, setItems] = useState<LookupItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const effectivePlaceholder = placeholder ?? "Bitte auswählen…";

    // 🔥 NEU: Add-Modus nach außen melden
    useEffect(() => {
        onAddModeChange?.(isAdding);
    }, [isAdding]);

    // Items laden
    useEffect(() => {
        async function loadItems() {
            try {
                setError(null);
                const response = await fetch(api);
                if (!response.ok) throw new Error("Fehler beim Laden");
                const data: LookupItem[] = await response.json();
                setItems(data);
            } catch {
                setError("Daten konnten nicht geladen werden");
            }
        }
        loadItems();
    }, [api]);

    // Auswahl synchronisieren
    useEffect(() => {
        if (value == null) {
            setSearchTerm("");
            return;
        }
        const selected = items.find((i) => i.id === value);
        if (selected) setSearchTerm(selected.name);
    }, [value, items]);

    // Validierung (nur im Normalmodus)
    useEffect(() => {
        if (isAdding) return;

        if (!searchTerm) {
            setError(null);
            onChange(null);
            return;
        }

        const match = items.find(
            (i) => i.name.toLowerCase() === searchTerm.toLowerCase()
        );

        if (match) {
            setError(null);
            onChange(match.id);
        } else {
            setError(`„${searchTerm}“ ist kein gültiger Wert.`);
            onChange(null);
        }
    }, [searchTerm, items, isAdding]);

    return (
        <div className="form-control w-full">
            <div className="relative w-full">
                {/* Input + Buttons */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder={effectivePlaceholder}
                        value={isAdding ? newName : searchTerm}
                        onChange={(e) => {
                            if (isAdding) {
                                setNewName(e.target.value);
                            } else {
                                setSearchTerm(e.target.value);
                                setIsOpen(true);
                            }
                        }}
                        onClick={() => !isAdding && setIsOpen(!isOpen)}
                        onBlur={() => !isAdding && setIsOpen(false)}
                        onKeyDown={async (e) => {
                            if (isAdding && e.key === "Enter") {
                                e.preventDefault();
                                try {
                                    setError(null);
                                    const response = await fetch(api, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ name: newName }),
                                    });
                                    if (!response.ok) throw new Error("Fehler beim Speichern");
                                    const created: LookupItem = await response.json();
                                    setItems((prev) => [...prev, created]);
                                    onChange(created.id);
                                    setSearchTerm(created.name);
                                    setIsAdding(false);
                                    setNewName("");
                                } catch {
                                    setError("Eintrag konnte nicht gespeichert werden");
                                }
                            }
                        }}
                    />

                    {/* Normalmodus → Plus */}
                    {!isAdding && (
                        <button
                            type="button"
                            className="btn btn-square bg-green-900 text-white text-2xl font-bold rounded-lg"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsAdding(true);
                                setIsOpen(false);
                                setNewName("");
                            }}
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    )}

                    {/* Add-Modus → X + Check */}
                    {isAdding && (
                        <>
                            <button
                                type="button"
                                className="btn btn-square bg-red-600"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsAdding(false);
                                    setNewName("");
                                }}
                            >
                                <XMarkIcon className="h-5 w-5 font-bold text-white" />
                            </button>

                            <button
                                type="button"
                                className="btn btn-square bg-green-900"
                                onMouseDown={async (e) => {
                                    e.preventDefault();
                                    try {
                                        setError(null);
                                        const response = await fetch(api, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ name: newName }),
                                        });
                                        if (!response.ok) throw new Error("Fehler beim Speichern");
                                        const created: LookupItem = await response.json();
                                        setItems((prev) => [...prev, created]);
                                        onChange(created.id);
                                        setSearchTerm(created.name);
                                        setIsAdding(false);
                                        setNewName("");
                                    } catch {
                                        setError("Eintrag konnte nicht gespeichert werden");
                                    }
                                }}
                            >
                                <CheckIcon className="h-5 w-5 font-bold text-white" />
                            </button>
                        </>
                    )}
                </div>

                {/* Dropdown */}
                {!isAdding && isOpen && (
                    <ul
                        className="menu menu-compact bg-base-100 rounded-box shadow absolute z-10 w-full mt-1 max-h-60 overflow-auto"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {items
                            .filter((item) =>
                                item.name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(item.id);
                                            setSearchTerm(item.name);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ))}

                        {items.length === 0 && (
                            <li className="disabled">
                                <span>Keine Einträge gefunden</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {error && <p className="text-error text-sm mt-1">{error}</p>}
        </div>
    );
}
