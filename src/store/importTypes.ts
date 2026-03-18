// -----------------------------
// Grundtypen
// -----------------------------

export type ImportStep = 1 | 2 | 3 | 4 | 5 | "5a" | "5b" | 6;

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

// NEU: Unbekannte Lookup-Werte
export type UnresolvedItem = {
    value: string;
    field: "timeSlot" | "location" | "eventType";
    affectedRows: number[];
};

// Entscheidung des Nutzers pro unbekanntem Wert
export type UnresolvedDecision = "add" | "discard";

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

    // NEU
    unresolvedItems: UnresolvedItem[];
    discardedRows: number[];     // Zeilen-Indizes die verworfen wurden
    discardedDetails: string[];  // Lesbare Beschreibung für den ErrorLog

    saving: boolean;
    saveError: string | null;

    organizers: { id: number; name: string }[];
    success: boolean;
    importSummary: { inserted: number; discarded: string[] } | null;
}

// -----------------------------
// Aktionen des Stores
// -----------------------------

export interface ImportStoreActions {
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: ImportStep) => void;

    setOrganizerId: (id: number) => void;

    setRows: (rows: Row[]) => void;
    setHasHeader: (flag: boolean) => void;

    setMapping: (mapping: Mapping) => void;
    initializeMapping: (columnCount: number) => void;

    setEvents: (events: Event[]) => void;
    setResolvedEvents: (events: ResolvedEvent[]) => void;

    // NEU
    setUnresolvedItems: (items: UnresolvedItem[]) => void;
    setDiscardedRows: (rows: number[]) => void;
    setDiscardedDetails: (details: string[]) => void;
    setImportSummary: (summary: { inserted: number; discarded: string[] } | null) => void;

    setSaving: (flag: boolean) => void;
    setSaveError: (msg: string | null) => void;

    setOrganizers: (list: { id: number; name: string }[]) => void;
    setSuccess: (flag: boolean) => void;
}
