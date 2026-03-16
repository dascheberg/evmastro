import React, { useState } from "react";
import type { Row } from "../../store/importTypes";
import { handleFile as parseFile } from "../../lib/import/readFile";
import { useImportStore } from "../../store/useImportStore";

export default function FileUpload({ onLoaded, onFileSelected }) {
  const organizerId = useImportStore((s) => s.organizerId);
  const organizers = useImportStore((s) => s.organizers); // falls du sie im Store hast
  const organizer = organizers?.find((o) => o.id === organizerId);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelected(true);
    setError("");
    setLoading(true);

    try {
      const rows = await parseFile(file);
      onLoaded(rows);
    } catch (err) {
      console.error(err);
      setError("Fehler beim Einlesen der Datei.");
      onFileSelected(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 w-2/3 mx-auto text-center">
      <h2 className="text-xl font-bold">
        Datei für {organizer?.name ?? "…"} hochladen
      </h2>

      <input
        type="file"
        accept=".csv, .xlsx"
        className="border px-2 py-1"
        onChange={handleFile}
      />

      {loading && <p>Einlesen…</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
