import React, { useState } from "react";
import { EventsTable } from "./EventsTable";
import { EventForm } from "./EventForm";
import { useConfirm } from "./ConfirmModal";

export function EventsAdminPage() {
    const [editingEvent, setEditingEvent] = useState(null);
    const [reload, setReload] = useState(0);
    const { confirm, ConfirmModal } = useConfirm();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <EventsTable
                    reload={reload}
                    onEdit={async (ev) => {
                        const res = await fetch(`/api/events/${ev.id}`);
                        const fullEvent = await res.json();
                        setEditingEvent(fullEvent);
                    }}
                    onDelete={async (ev) => {
                        const ok = await confirm(
                            `Soll das Event wirklich gelöscht werden?\n\n` +
                            `ID: ${ev.id}\n` +
                            `Datum: ${ev.startDate} – ${ev.endDate ?? ""}\n` +
                            `Organisator: ${ev.organizer ?? "-"}\n` +
                            `Ort: ${ev.location ?? "-"}\n` +
                            `Typ: ${ev.type ?? "-"}\n` +
                            `Zeit: ${ev.timeSlot ?? "-"}`
                        );

                        if (!ok) return;

                        const res = await fetch(`/api/events/${ev.id}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        });
                        if (!res.ok) {
                            console.error("DELETE fehlgeschlagen:", res.status);
                            return;
                        }
                        setReload(r => r + 1);
                    }}
                />
            </div>

            <div>
                <EventForm
                    event={editingEvent}
                    onSaved={() => {
                        setEditingEvent(null);
                        setReload((r) => r + 1);
                    }}
                    handleCancel={() => setEditingEvent(null)}
                />
            </div>

            <ConfirmModal />
        </div>
    );
}
