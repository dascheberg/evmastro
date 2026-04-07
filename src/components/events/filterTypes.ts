export type PeriodPreset = "month" | "quarter" | "half" | "year" | "custom";

export interface EventFilters {
  year: number;
  month: number;          // 1-12
  quarter: 1 | 2 | 3 | 4;
  half: 1 | 2;
  periodPreset: PeriodPreset;
  from?: string;          // YYYY-MM-DD
  to?: string;            // YYYY-MM-DD
  organizerId?: number;
  locationId?: number;
  typeId?: number;
}
