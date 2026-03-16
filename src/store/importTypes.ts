// -----------------------------
// Grundtypen
// -----------------------------

export type ImportStep = 1 | 2 | 3 | 4 | 5 | 6;

export type Row = string[];

export interface Event {
    startDate: string;
    endDate: string;
    timeSlot: string;
    location: string;
    eventType: string;
    notes?: string | null;
    recurrence?: any;
    organizerId: number;
}

export interface ResolvedEvent extends Event {
    timeId: number;
    locationId: number;
    typeId: number;
}

export type Mapping = Record<number, string | null>;

// -----------------------------
// Zustand des Stores
// -----------------------------

export interface ImportStoreState {
    step: ImportStep;

    organizerId: number | null;

    rows: Row[];
    hasHeader: boolean;

    mapping: Mapping;

    events: Event[];
    resolvedEvents: ResolvedEvent[];

    saving: boolean;
    saveError: string | null;

    organizers: { id: number; name: string }[];
    success: boolean;

}

// -----------------------------
// Aktionen des Stores
// -----------------------------

export interface ImportStoreActions {
    nextStep: () => void;
    prevStep: () => void;

    setOrganizerId: (id: number) => void;

    setRows: (rows: Row[]) => void;
    setHasHeader: (flag: boolean) => void;

    setMapping: (mapping: Mapping) => void;
    initializeMapping: (columnCount: number) => void;

    setEvents: (events: Event[]) => void;
    setResolvedEvents: (events: ResolvedEvent[]) => void;

    setSaving: (flag: boolean) => void;
    setSaveError: (msg: string | null) => void;

    setOrganizers: (list: { id: number; name: string }[]) => void;
    setSuccess: (flag: boolean) => void;

}
