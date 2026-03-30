import React, { useEffect, useState } from "react";
import { DashboardCard } from "../DashboardCard";

/*
SELECT
  l.id,
  l.name,
  COUNT(e.id) AS event_count
FROM events e
JOIN locations l ON e.location_id = l.id
GROUP BY l.id, l.name
ORDER BY event_count DESC
LIMIT 5;
*/

const msgText = (limit: number) => `Die Top ${limit} Veranstaltungsorte`;


export function EventsPerLocation() {
  const [limit, setLimit] = useState("1");
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch(`/api/stats/dashboard/events-per-location?limit=${limit}`)
      .then((res) => res.json())
      .then((json) => setLocations(json))
      .catch(() => setLocations([]));
  }, [limit]);

  return (
    <DashboardCard title={msgText(Number(limit))}>
      <select
        className="select select-bordered w-24 mt-4"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
      >
        <option value="1">Top 1</option>
        <option value="3">Top 3</option>
        <option value="5">Top 5</option>
      </select>

      <ul className="mt-4 space-y-2">
        {locations.map((loc) => (
          <li
            key={loc.id}
            className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2"
          >
            <span className="text-lg font-semibold mr-8">{loc.name}</span>
            <span className="bg-blue-500 text-white font-bold px-3 py-1 rounded-full">
              {loc.event_count}
            </span>
          </li>
        ))}
      </ul>


    </DashboardCard>
  );
};
