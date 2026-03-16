import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Row } from "../../store/importTypes";

// CSV einlesen
function parseCSV(file: File): Promise<Row[]> {
    return new Promise((resolve) => {
        Papa.parse(file, {
            complete: (results) => resolve(results.data as Row[]),
            delimiter: ";",
            skipEmptyLines: true,
        });
    });
}

// Excel einlesen
function parseExcel(file: File): Promise<Row[]> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target!.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Row[];
            resolve(rows);
        };

        reader.readAsArrayBuffer(file);
    });
}

function excelTimeToString(value: number): string {
    // Excel-Zeit: Bruchteil eines Tages
    const totalMinutes = Math.round(value * 24 * 60);

    // Auf 15-Minuten runden
    const rounded = Math.round(totalMinutes / 15) * 15;

    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function cleanRows(rows: any[][]): string[][] {
    return rows
        .map((row) =>
            row.map((cell) => {
                if (cell == null) return "";

                // Excel-Zeitwert?
                if (typeof cell === "number" && cell > 0 && cell < 1) {
                    return excelTimeToString(cell);
                }

                // Alles andere als String
                return String(cell).replace(/^\uFEFF/, "").trim();
            })
        )
        .filter((row) => row.some((cell) => cell !== ""));
}

// Leere Spalten entfernen
function removeEmptyColumns(rows: Row[]): Row[] {
    const maxCols = Math.max(...rows.map((r) => r.length));
    const nonEmptyCols: number[] = [];

    for (let col = 0; col < maxCols; col++) {
        const hasData = rows.some(
            (row) => row[col] && row[col].toString().trim() !== ""
        );
        if (hasData) nonEmptyCols.push(col);
    }

    return rows.map((row) => nonEmptyCols.map((col) => row[col] ?? ""));
}

// Hauptfunktion
export async function handleFile(file: File): Promise<Row[]> {
    const ext = file.name.split(".").pop()?.toLowerCase();

    let rows: Row[] =
        ext === "csv" ? await parseCSV(file) : await parseExcel(file);

    rows = cleanRows(rows);
    rows = removeEmptyColumns(rows);

    return rows;
}
