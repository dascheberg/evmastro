import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

function CalendarWidget({ onSelectDate }) {
  const [eventsByDate, setEventsByDate] = useState([]);
  const [current, setCurrent] = useState(/* @__PURE__ */ new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  useEffect(() => {
    fetch(`/api/events-calendar?year=${year}&month=${month + 1}`).then((res) => res.json()).then((data) => setEventsByDate(data));
  }, [year, month]);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const days = [];
  for (let i = 1; i < startWeekday; i++) {
    days.push(/* @__PURE__ */ jsx("div", {}, "empty-" + i));
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const info = eventsByDate.find((d) => d.date === dateStr);
    const count = info?.count ?? 0;
    const bg = count === 0 ? "bg-gray-100" : count < 3 ? "bg-blue-200" : count < 7 ? "bg-blue-400 text-white" : "bg-blue-600 text-white";
    days.push(
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `p-2 rounded text-center cursor-pointer ${bg}`,
          onClick: () => onSelectDate(dateStr),
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: day }),
            count > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
              count,
              " Einträge"
            ] })
          ]
        },
        day
      )
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white rounded shadow space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-sm",
          onClick: () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1)),
          children: "‹"
        }
      ),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: current.toLocaleString("de-DE", {
        month: "long",
        year: "numeric"
      }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-sm",
          onClick: () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1)),
          children: "›"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600", children: [
      /* @__PURE__ */ jsx("div", { children: "Mo" }),
      /* @__PURE__ */ jsx("div", { children: "Di" }),
      /* @__PURE__ */ jsx("div", { children: "Mi" }),
      /* @__PURE__ */ jsx("div", { children: "Do" }),
      /* @__PURE__ */ jsx("div", { children: "Fr" }),
      /* @__PURE__ */ jsx("div", { children: "Sa" }),
      /* @__PURE__ */ jsx("div", { children: "So" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2", children: days })
  ] });
}

function EventListForDay({
  date,
  onClose
}) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    if (!date) return;
    fetch(`/api/events-by-day?date=${date}`).then((res) => res.json()).then((data) => setEvents(data));
  }, [date]);
  if (!date) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 bg-white rounded shadow", children: "Bitte einen Tag wählen" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white rounded shadow space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold", children: [
        "Events am ",
        new Date(date).toLocaleDateString("de-DE")
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300",
          onClick: onClose,
          children: "Schließen"
        }
      )
    ] }),
    events.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Keine Events an diesem Tag" }),
    events.map((ev) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: `/events/${ev.id}`,
        className: "block p-3 border rounded bg-gray-50 hover:bg-green-50 hover:border-green-300 transition-colors",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "font-semibold", children: [
            ev.dateLabel,
            ", ",
            ev.timeLabel
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: ev.typeLabel }),
          /* @__PURE__ */ jsxs("div", { className: "text-gray-500 text-xs", children: [
            ev.locationLabel,
            " · ",
            ev.organizerLabel
          ] }),
          ev.raw?.notes && /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs mt-1 italic truncate", children: ev.raw.notes })
        ]
      },
      ev.id
    ))
  ] });
}

function UpcomingEventsWidget() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  useEffect(() => {
    fetch("/api/events-upcoming").then((res) => res.json()).then((d) => setData(d));
  }, []);
  if (!data) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 bg-white rounded shadow", children: "Lade…" });
  }
  const items = activeTab === "today" ? data.today : activeTab === "week" ? data.nextWeek : data.nextMonth;
  return /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white rounded shadow space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 border-b pb-2", children: ["today", "week", "month"].map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        className: `px-3 py-1 rounded ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"}`,
        onClick: () => setActiveTab(tab),
        children: tab === "today" ? "Heute" : tab === "week" ? "7 Tage" : "Monat"
      },
      tab
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      items.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Keine Veranstaltungen" }),
      items.map((ev) => /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/events/${ev.id}`,
          className: "block p-2 border rounded bg-gray-50 text-sm hover:bg-green-50 hover:border-green-300 transition-colors",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "font-semibold", children: [
              ev.dateLabel,
              ", ",
              ev.timeLabel
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-600", children: ev.typeLabel }),
            /* @__PURE__ */ jsxs("div", { className: "text-gray-500 text-xs", children: [
              ev.locationLabel,
              " · ",
              ev.organizerLabel
            ] }),
            ev.raw?.notes && /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs mt-1 italic truncate", children: ev.raw.notes })
          ]
        },
        ev.id
      ))
    ] })
  ] });
}

function DashboardCard({ title, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "card bg-base-300 shadow w-96 p-4 space-y-2", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: title }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children })
  ] });
}

function msgText$1(period) {
  switch (period) {
    case "all":
      return "Alle Veranstaltungen";
    case "week":
      return "Veranstaltungen in der nächsten Woche";
    case "month":
      return "Veranstaltungen im nächsten Monat";
    case "quarter":
      return "Veranstaltungen im nächsten Quartal";
    case "halfyear":
      return "Veranstaltungen im nächsten Halbjahr";
    case "year":
      return "Veranstaltungen im nächsten Jahr";
    default:
      return "";
  }
}
function EventsPerPeriod() {
  const [period, setPeriod] = useState("all");
  const [count, setCount] = useState(null);
  useEffect(() => {
    const url = period ? `/api/stats/dashboard/events-per-period?period=${period}` : `/api/stats/dashboard/events-per-period`;
    fetch(url).then((res) => res.json()).then((json) => setCount(json.count)).catch(() => setCount(null));
  }, [period]);
  return /* @__PURE__ */ jsxs(DashboardCard, { title: msgText$1(period), children: [
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "select select-bordered w-48",
        value: period,
        onChange: (e) => {
          setPeriod(e.target.value);
        },
        children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: " Alle" }),
          /* @__PURE__ */ jsx("option", { value: "week", children: "Woche (nächste 7 Tage)" }),
          /* @__PURE__ */ jsx("option", { value: "month", children: "Monat (nächste 30 Tage)" }),
          /* @__PURE__ */ jsx("option", { value: "quarter", children: "Quartal (nächste 90 Tage)" }),
          /* @__PURE__ */ jsx("option", { value: "halfyear", children: "Halbjahr (nächste 180 Tage)" }),
          /* @__PURE__ */ jsx("option", { value: "year", children: "Jahr (nächste 365 Tage)" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "rounded-lg bg-green-900 text-white text-4xl font-bold px-3 py-1", children: count === null ? "…" : count })
  ] });
}

const msgText = (limit) => `Die Top ${limit} Veranstaltungsorte`;
function EventsPerLocation() {
  const [limit, setLimit] = useState("1");
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    fetch(`/api/stats/dashboard/events-per-location?limit=${limit}`).then((res) => res.json()).then((json) => setLocations(json)).catch(() => setLocations([]));
  }, [limit]);
  return /* @__PURE__ */ jsxs(DashboardCard, { title: msgText(Number(limit)), children: [
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "select select-bordered w-24",
        value: limit,
        onChange: (e) => setLimit(e.target.value),
        children: [
          /* @__PURE__ */ jsx("option", { value: "1", children: "Top 1" }),
          /* @__PURE__ */ jsx("option", { value: "3", children: "Top 3" }),
          /* @__PURE__ */ jsx("option", { value: "5", children: "Top 5" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2", children: locations.map((loc) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold mr-8", children: loc.name }),
          /* @__PURE__ */ jsx("span", { className: "bg-blue-500 text-white font-bold px-3 py-1 rounded-full", children: loc.event_count })
        ]
      },
      loc.id
    )) })
  ] });
}

function EventsPerOrganizer() {
  const [limit, setLimit] = useState("1");
  const [organizers, setOrganizers] = useState([]);
  useEffect(() => {
    fetch(`/api/stats/dashboard/events-per-organizer?limit=${limit}`).then((res) => res.json()).then((json) => setOrganizers(json)).catch(() => setOrganizers([]));
  }, [limit]);
  return /* @__PURE__ */ jsxs(DashboardCard, { title: `Die Top ${limit} Veranstalter`, children: [
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "select select-bordered w-24",
        value: limit,
        onChange: (e) => setLimit(e.target.value),
        children: [
          /* @__PURE__ */ jsx("option", { value: "1", children: "Top 1" }),
          /* @__PURE__ */ jsx("option", { value: "3", children: "Top 3" }),
          /* @__PURE__ */ jsx("option", { value: "5", children: "Top 5" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2", children: organizers.map((org) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold mr-8", children: org.name }),
          /* @__PURE__ */ jsx("span", { className: "bg-blue-500 text-white font-bold px-3 py-1 rounded-full", children: org.event_count })
        ]
      },
      org.id
    )) })
  ] });
}

function EventsPerEventType() {
  const [limit, setLimit] = useState("1");
  const [eventtypes, setEventTypes] = useState([]);
  useEffect(() => {
    fetch(`/api/stats/dashboard/events-per-eventType?limit=${limit}`).then((res) => res.json()).then((json) => setEventTypes(json)).catch(() => setEventTypes([]));
  }, [limit]);
  return /* @__PURE__ */ jsxs(DashboardCard, { title: `Die Top ${limit} Veranstaltungsarten`, children: [
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "select select-bordered w-24",
        value: limit,
        onChange: (e) => setLimit(e.target.value),
        children: [
          /* @__PURE__ */ jsx("option", { value: "1", children: "Top 1" }),
          /* @__PURE__ */ jsx("option", { value: "3", children: "Top 3" }),
          /* @__PURE__ */ jsx("option", { value: "5", children: "Top 5" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2", children: eventtypes.map((evt) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold mr-8", children: evt.name }),
          /* @__PURE__ */ jsx("span", { className: "bg-blue-500 text-white font-bold px-3 py-1 rounded-full", children: evt.event_count })
        ]
      },
      evt.id
    )) })
  ] });
}

function DashboardApp() {
  const [selectedDate, setSelectedDate] = useState(null);
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsx(EventsPerPeriod, {}),
      /* @__PURE__ */ jsx(EventsPerOrganizer, {}),
      /* @__PURE__ */ jsx(EventsPerLocation, {}),
      /* @__PURE__ */ jsx(EventsPerEventType, {})
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `grid gap-4 grid-cols-3`, children: [
      /* @__PURE__ */ jsx("div", { className: selectedDate ? "col-span-1" : "col-span-2", children: /* @__PURE__ */ jsx(CalendarWidget, { onSelectDate: setSelectedDate }) }),
      selectedDate && /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(
        EventListForDay,
        {
          date: selectedDate,
          onClose: () => setSelectedDate(null)
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(UpcomingEventsWidget, {}) })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Dashboard" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "DashboardApp", DashboardApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/dieter/dev/evmastro/src/components/dashboard/DashboardApp", "client:component-export": "default" })} ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/index.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
