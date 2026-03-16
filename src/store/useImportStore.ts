import { create } from "zustand";
import type {
    ImportStep,
    Row,
    Event,
    ResolvedEvent,
    Mapping,
    ImportStoreState,
    ImportStoreActions,
} from "./importTypes";

export const useImportStore = create<ImportStoreState & ImportStoreActions>(
    (set, get) => ({
        step: 1,

        // Organizer
        organizerId: null,
        organizers: [],

        // ❌ Getter entfernt
        // ✔ Stattdessen: Selector-Funktion
        currentOrganizer: () => {
            const id = get().organizerId;
            return get().organizers.find(o => o.id === id) ?? null;
        },

        rows: [],
        hasHeader: false,

        mapping: {},

        events: [],
        resolvedEvents: [],

        saving: false,
        saveError: null,

        nextStep: () =>
            set((state) => ({
                step: (Math.min(state.step + 1, 6) as ImportStep),
            })),

        prevStep: () =>
            set((state) => ({
                step: (Math.max(state.step - 1, 1) as ImportStep),
            })),

        setOrganizerId: (id) => set({ organizerId: id }),
        setOrganizers: (list) => set({ organizers: list }),

        setRows: (rows) => set({ rows }),
        setHasHeader: (flag) => set({ hasHeader: flag }),

        setMapping: (mapping) => set({ mapping }),

        initializeMapping: (columnCount: number) =>
            set({
                mapping: Object.fromEntries(
                    Array.from({ length: columnCount }, (_, i) => [i, null])
                ),
            }),

        setEvents: (events) => set({ events }),
        setResolvedEvents: (resolvedEvents) => set({ resolvedEvents }),

        setSaving: (flag) => set({ saving: flag }),
        setSaveError: (msg) => set({ saveError: msg }),

        success: false,
        setSuccess: (flag) => set({ success: flag }),

    })
);
