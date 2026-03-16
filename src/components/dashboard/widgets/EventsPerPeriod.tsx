import React, { useEffect, useState } from "react";
import { DashboardCard } from "../DashboardCard";

function msgText(period: string) {
  switch (period) {
    case "all": return "Alle Veranstaltungen";
    case "week": return "Veranstaltungen in der nächsten Woche";
    case "month": return "Veranstaltungen im nächsten Monat";
    case "quarter": return "Veranstaltungen im nächsten Quartal";
    case "halfyear": return "Veranstaltungen im nächsten Halbjahr";
    case "year": return "Veranstaltungen im nächsten Jahr";
    default: return "";
  }
}

export function EventsPerPeriod() {
  const [period, setPeriod] = useState("all");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const url = period
      ? `/api/stats/dashboard/events-per-period?period=${period}`
      : `/api/stats/dashboard/events-per-period`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => setCount(json.count))
      .catch(() => setCount(null));
  }, [period]);

  return (
    <DashboardCard title={msgText(period)}>

      <select
        className="select select-bordered w-48"
        value={period}
        onChange={(e) => {
          setPeriod(e.target.value);
        }}

      >
        <option value="all"> Alle</option>
        <option value="week">Woche (nächste 7 Tage)</option>
        <option value="month">Monat (nächste 30 Tage)</option>
        <option value="quarter">Quartal (nächste 90 Tage)</option>
        <option value="halfyear">Halbjahr (nächste 180 Tage)</option>
        <option value="year">Jahr (nächste 365 Tage)</option>
      </select>

      <span className="rounded-lg bg-green-900 text-white text-4xl font-bold px-3 py-1">
        {count === null ? "…" : count}
      </span>

    </DashboardCard>
  );
}
