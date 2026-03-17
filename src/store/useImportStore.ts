import { create } from "zustand";
import type {
    ImportStep,
    Row,
    Event,
    ResolvedEvent,
    Mapping,
    UnresolvedItem,
    ImportStoreState,
    ImportStoreActions,
} from "./importTypes";

export const useImportStore = create<ImportStoreState & ImportStoreActions>(
    (set, get) => ({
        step: 1,

        // Organizer
        organizerId: null,
        organizers: [],

        currentOrganizer: () => {
            const id = get().organizerId;
            return get().organizers.find(o => o.id === id) ?? null;
        },

        rows: [],
        hasHeader: false,
        mapping: {},

        events: [],
        resolvedEvents: [],

        // NEU
        unresolvedItems: [],
        discardedRows: [],
        discardedDetails: [],
        importSummary: null,

        saving: false,
        saveError: null,
        success: false,

        // Navigation
        nextStep: () =>
            set((state) => ({
                step: (Math.min(
                    typeof state.step === "number" ? state.step + 1 : 6,
                    6
                ) as ImportStep),
            })),

        prevStep: () =>
            set((state) => ({
                step: (Math.max(
                    typeof state.step === "number" ? state.step - 1 : 1,
                    1
                ) as ImportStep),
            })),

        goToStep: (step) => set({ step }),

        // Setter
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

        // NEU
        setUnresolvedItems: (items) => set({ unresolvedItems: items }),
        setDiscardedRows: (rows) => set({ discardedRows: rows }),
        setDiscardedDetails: (details) => set({ discardedDetails: details }),
        setImportSummary: (summary) => set({ importSummary: summary }),

        setSaving: (flag) => set({ saving: flag }),
        setSaveError: (msg) => set({ saveError: msg }),
        setSuccess: (flag) => set({ success: flag }),
    })
);
