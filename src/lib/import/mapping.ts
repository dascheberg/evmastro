import type { Row, Mapping } from "../../store/importTypes";

export function applyMapping(
    rows: Row[],
    mapping: Mapping,
    organizerId: number
) {
    return rows
        // 1) Leere Zeilen ignorieren
        .filter((row) => row.some((cell) => cell && cell.trim() !== ""))

        // 2) Kopfzeilen automatisch erkennen
        .filter((row) => !isHeaderRow(row))

        // 3) Zeilen ignorieren, die KEIN gültiges Datum enthalten
        .filter((row) => isValidDataRow(row, mapping))

        // 4) Mapping anwenden
        .map((row) => {
            const raw: Record<string, any> = {};

            Object.entries(mapping).forEach(([colIndex, fieldName]) => {
                const index = Number(colIndex);
                raw[fieldName] = row[index] ?? null;
            });

            raw.organizerId = organizerId;
            return raw;
        });
}

function isHeaderRow(row: Row): boolean {
    const headerKeywords = [
        "beginn", "start", "datum", "enddatum", "ende",
        "zeit", "uhrzeit", "ort", "location",
        "art", "event", "veranstaltung", "typ", "type"
    ];

    return row.some((cell) => {
        if (!cell) return false;
        const lower = cell.toLowerCase().trim();
        return headerKeywords.includes(lower);
    });
}

function isValidDataRow(row: Row, mapping: Mapping): boolean {
    // Prüfen, ob die Spalte für startDate existiert
    const startDateCol = Object.entries(mapping).find(
        ([, fieldName]) => fieldName === "startDate"
    );

    if (!startDateCol) return true; // kein Mapping → nicht filtern

    const [colIndex] = startDateCol;
    const value = row[Number(colIndex)];

    // gültiges Datum?
    return Boolean(value && value.trim() !== "" && !isNaN(Date.parse(value)));
}
