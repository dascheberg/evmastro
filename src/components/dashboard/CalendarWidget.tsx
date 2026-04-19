import React, { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

interface DayInfo {
    date: string;
    count: number;
}

export default function CalendarWidget({ onSelectDate }: { onSelectDate: (date: string) => void }) {
    const [eventsByDate, setEventsByDate] = useState<DayInfo[]>([]);
    const [current, setCurrent] = useState(new Date());

    const year = current.getFullYear();
    const month = current.getMonth();

    // NEU: heutiges Datum als YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];

    useEffect(() => {
        fetch(`/api/events-calendar?year=${year}&month=${month + 1}`)
            .then((res) => res.json())
            .then((data) => setEventsByDate(data));
    }, [year, month]);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

    const days = [];

    // Leere Felder vor dem 1.
    for (let i = 1; i < startWeekday; i++) {
        days.push(<div key={"empty-" + i}></div>);
    }

    // Tage rendern
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const info = eventsByDate.find((d) => d.date === dateStr);
        const count = info?.count ?? 0;
        const isToday = dateStr === todayStr; // NEU

        // NEU: Heute hat Vorrang vor der normalen Farblogik
        const bg = isToday
            ? "bg-green-500 text-white ring-2 ring-green-700"
            : count === 0
                ? "bg-gray-100"
                : count < 3
                    ? "bg-blue-200"
                    : count < 7
                        ? "bg-blue-400 text-white"
                        : "bg-blue-600 text-white";

        days.push(
            <div
                key={day}
                className={`p-2 rounded text-center cursor-pointer ${bg}`}
                onClick={() => onSelectDate(dateStr)}
            >
                <div className="font-semibold flex items-center justify-center gap-1">
                    {day}
                    {isToday && ( // NEU
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                </div>
                {count > 0 && <div className="text-xs">{count} Einträge</div>}
            </div>
        );
    }

    const goToday = () => {
        const now = new Date();
        setCurrent(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    return (
        <div className="p-4 bg-white rounded-xl border border-2 border-gray-200 shadow space-y-4">
            <div className="flex justify-between items-center">
                <button
                    className="btn btn-sm"
                    onClick={() =>
                        setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))
                    }
                >
                    <ArrowLeftIcon className="h-6 w-6 font-bold" />
                </button>

                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">
                        {current.toLocaleString("de-DE", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h2>
                    <button
                        className="btn btn-xs bg-green-600 text-white border-green-600 hover:bg-green-700"
                        onClick={goToday}
                        type="button"
                    >
                        Heute
                    </button>
                </div>

                <button
                    className="btn btn-sm"
                    onClick={() =>
                        setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))
                    }
                >
                    <ArrowRightIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
                <div>Mo</div>
                <div>Di</div>
                <div>Mi</div>
                <div>Do</div>
                <div>Fr</div>
                <div>Sa</div>
                <div>So</div>
            </div>

            <div className="grid grid-cols-7 gap-2">{days}</div>
        </div>
    );
}
