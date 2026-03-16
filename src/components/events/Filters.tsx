import React, { useEffect, useState } from "react";

interface Props {
    mode: "month" | "week" | "list";
    onChange: (filters: Filters) => void;
}

export type Filters = {
    organizerId?: number;
    locationId?: number;
    typeId?: number;
    month?: number;
    year: number;
    search?: string;
};

export function Filters({ mode, onChange }: Props) {
    const [organizers, setOrganizers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [types, setTypes] = useState([]);

    const now = new Date();

    const [filters, setFilters] = useState<Filters>({
        organizerId: undefined,
        locationId: undefined,
        typeId: undefined,
        month: undefined,
        year: now.getFullYear(),
        search: "",
    });

    useEffect(() => {
        fetch("/api/lookups-central")
            .then((r) => r.json())
            .then((d) => {
                setOrganizers(d.organizers);
                setLocations(d.locations);
                setTypes(d.types);
            });
    }, []);

    useEffect(() => {
        onChange(filters);
    }, [filters]);

    const disabled = mode !== "list";

    return (
        <div
            className={`flex flex-wrap gap-4 bg-white p-3 rounded shadow ${disabled ? "opacity-50 pointer-events-none" : ""
                }`}
        >
            {/* Veranstalter */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Veranstalter</label>
                <select
                    className="select select-sm select-bordered"
                    value={filters.organizerId ?? ""}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            organizerId: e.target.value ? Number(e.target.value) : undefined,
                        }))
                    }
                >
                    <option value="">Alle</option>
                    {organizers.map((o: any) => (
                        <option key={o.id} value={o.id}>
                            {o.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ort */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Ort</label>
                <select
                    className="select select-sm select-bordered"
                    value={filters.locationId ?? ""}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            locationId: e.target.value ? Number(e.target.value) : undefined,
                        }))
                    }
                >
                    <option value="">Alle</option>
                    {locations.map((l: any) => (
                        <option key={l.id} value={l.id}>
                            {l.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Typ */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Typ</label>
                <select
                    className="select select-sm select-bordered"
                    value={filters.typeId ?? ""}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            typeId: e.target.value ? Number(e.target.value) : undefined,
                        }))
                    }
                >
                    <option value="">Alle</option>
                    {types.map((t: any) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Monat */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Monat</label>
                <select
                    value={filters.month ?? ""}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            month: e.target.value ? Number(e.target.value) : undefined,
                        }))
                    }
                >
                    <option value="">Alle Monate</option>   {/* ← NEU */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(2024, i, 1).toLocaleDateString("de-DE", { month: "long" })}
                        </option>
                    ))}
                </select>
            </div>

            {/* Jahr */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Jahr</label>
                <select
                    className="select select-sm select-bordered"
                    value={filters.year}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, year: Number(e.target.value) }))
                    }
                >
                    {Array.from({ length: 5 }).map((_, i) => {
                        const y = now.getFullYear() - 2 + i;
                        return (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Suche */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500">Suche</label>
                <input
                    className="input input-sm input-bordered"
                    value={filters.search}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                />
            </div>

            {/* Reset */}
            <button
                className="btn btn-sm"
                onClick={() =>
                    setFilters({
                        organizerId: undefined,
                        locationId: undefined,
                        typeId: undefined,
                        month: undefined,
                        year: now.getFullYear(),
                        search: "",
                    })
                }
            >
                Reset
            </button>
        </div>
    );
}
