import type { Row, Mapping } from "../../store/importTypes";

export function applyMapping(
    rows: Row[],
    mapping: Mapping,
    organizerId: number | null,
    multiMode: boolean = false,
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

            // Im Single-Modus: organizerId fest setzen
            // Im Multi-Modus: organizer-Name aus der Spalte lesen (raw.organizer)
            if (!multiMode) {
                raw.organizerId = organizerId;
            }

            return raw;
        });
}

function isHeaderRow(row: Row): boolean {
    const headerKeywords = [
        "beginn", "start", "datum", "enddatum", "ende",
        "zeit", "uhrzeit", "ort", "location",
        "art", "event", "veranstaltung", "typ", "type",
        "veranstalter", "organizer",
    ];

    return row.some((cell) => {
        if (!cell) return false;
        const lower = cell.toLowerCase().trim();
        return headerKeywords.includes(lower);
    });
}

function isValidDataRow(row: Row, mapping: Mapping): boolean {
    const startDateCol = Object.entries(mapping).find(
        ([, fieldName]) => fieldName === "startDate"
    );

    if (!startDateCol) return true;

    const [colIndex] = startDateCol;
    const value = row[Number(colIndex)];

    if (!value || value.trim() === "") return false;

    const trimmed = value.trim();

    // ISO-Format (kommt aus excelDateToString)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return true;

    // Deutsches Format
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(trimmed)) return true;

    return false;
}
