import React, { useEffect, useState } from "react";
import type { EventFilters } from "./filterTypes";

type Props = {
    mode: "month" | "week" | "list";
    onChange: (filters: EventFilters) => void;
};

type LookupItem = { id: number; name: string };

export function Filters({ mode, onChange }: Props) {
    const [organizers, setOrganizers] = useState<LookupItem[]>([]);
    const [locations, setLocations] = useState<LookupItem[]>([]);
    const [types, setTypes] = useState<LookupItem[]>([]);

    const now = new Date();

    const defaultFilters: EventFilters = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        quarter: 1,
        half: 1,
        periodPreset: "month",
        from: "",
        to: "",
        organizerId: undefined,
        locationId: undefined,
        typeId: undefined,
    };

    const [filters, setFilters] = useState<EventFilters>(defaultFilters);

    const setField = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => {
        setFilters((prev) => {
            const next = { ...prev, [key]: value };
            onChange(next);
            return next;
        });
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
        onChange(defaultFilters);
    };

    useEffect(() => {
        fetch("/api/lookups-central")
            .then((r) => r.json())
            .then((d) => {
                setOrganizers(d.organizers ?? []);
                setLocations(d.locations ?? []);
                setTypes(d.types ?? []);
            });
    }, []);

    // Wenn nicht Listenansicht, "custom" automatisch auf "month" zurücksetzen
    useEffect(() => {
        if (mode !== "list" && filters.periodPreset === "custom") {
            const next = { ...filters, periodPreset: "month" as const };
            setFilters(next);
            onChange(next);
        }
    }, [mode]); // absichtlich nur mode

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <select
                className="border rounded px-2 py-1"
                value={filters.periodPreset}
                onChange={(e) => setField("periodPreset", e.target.value as EventFilters["periodPreset"])}
            >
                <option value="month">Monat</option>
                <option value="quarter">Quartal</option>
                <option value="half">Halbjahr</option>
                <option value="year">Jahr</option>
                {mode === "list" && <option value="custom">Von/Bis</option>}
            </select>

            {filters.periodPreset !== "custom" && (
                <input
                    type="number"
                    className="border rounded px-2 py-1"
                    value={filters.year}
                    onChange={(e) => setField("year", Number(e.target.value))}
                />
            )}

            {filters.periodPreset === "month" && (
                <select
                    className="border rounded px-2 py-1"
                    value={filters.month}
                    onChange={(e) => setField("month", Number(e.target.value))}
                >
                    {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1}. Monat
                        </option>
                    ))}
                </select>
            )}

            {filters.periodPreset === "quarter" && (
                <select
                    className="border rounded px-2 py-1"
                    value={filters.quarter}
                    onChange={(e) => setField("quarter", Number(e.target.value) as 1 | 2 | 3 | 4)}
                >
                    <option value={1}>1. Quartal</option>
                    <option value={2}>2. Quartal</option>
                    <option value={3}>3. Quartal</option>
                    <option value={4}>4. Quartal</option>
                </select>
            )}

            {filters.periodPreset === "half" && (
                <select
                    className="border rounded px-2 py-1"
                    value={filters.half}
                    onChange={(e) => setField("half", Number(e.target.value) as 1 | 2)}
                >
                    <option value={1}>1. Halbjahr</option>
                    <option value={2}>2. Halbjahr</option>
                </select>
            )}

            {mode === "list" && filters.periodPreset === "custom" && (
                <>
                    <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={filters.from ?? ""}
                        onChange={(e) => setField("from", e.target.value)}
                    />
                    <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={filters.to ?? ""}
                        onChange={(e) => setField("to", e.target.value)}
                    />
                </>
            )}

            <div className="flex flex-col">
                <label className="text-base text-gray-700">Veranstalter</label>
                <select
                    className="select select-sm select-bordered text-base"
                    value={filters.organizerId ?? ""}
                    onChange={(e) => setField("organizerId", e.target.value ? Number(e.target.value) : undefined)}
                >
                    <option value="">Alle</option>
                    {organizers.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col">
                <label className="text-base text-gray-700">Ort</label>
                <select
                    className="select select-sm select-bordered text-base"
                    value={filters.locationId ?? ""}
                    onChange={(e) => setField("locationId", e.target.value ? Number(e.target.value) : undefined)}
                >
                    <option value="">Alle</option>
                    {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col">
                <label className="text-base text-gray-700">Typ</label>
                <select
                    className="select select-sm select-bordered text-base"
                    value={filters.typeId ?? ""}
                    onChange={(e) => setField("typeId", e.target.value ? Number(e.target.value) : undefined)}
                >
                    <option value="">Alle</option>
                    {types.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            <button
                className="btn btn-base bg-green-300 text-black self-end rounded-lg text-base w-48 h-8"
                onClick={resetFilters}
                type="button"
            >
                Filter zurücksetzen
            </button>
        </div>
    );
}
