export function getNextCalendarMonth(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    const start = new Date(nextYear, nextMonth, 1);
    const end = new Date(nextYear, nextMonth + 1, 0);

    return { year: nextYear, month: nextMonth, start, end };
}

export function getDaysInMonth(year: number, month: number) {
    const days = [];
    const date = new Date(year, month, 1);

    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return days;
}

export function getNextCalendarWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sonntag, 1 = Montag, ...

    // Deutschland: Woche beginnt Montag
    const daysUntilNextMonday = (8 - day) % 7 || 7;

    const start = new Date(d);
    start.setDate(d.getDate() + daysUntilNextMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
}

export function getDaysInRange(start: Date, end: Date) {
    const days = [];
    const d = new Date(start);

    while (d <= end) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }

    return days;
}

export function getCalendarWeekFromDate(date: Date) {
    const d = new Date(date);
    const day = d.getDay();

    // Montag als Wochenstart
    const diff = (day === 0 ? -6 : 1) - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    // ISO-Kalenderwoche
    const temp = new Date(start);
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    const weekNumber =
        1 +
        Math.round(
            ((temp.getTime() - week1.getTime()) / 86400000 -
                3 +
                ((week1.getDay() + 6) % 7)) /
            7
        );

    return { start, end, weekNumber };
}
