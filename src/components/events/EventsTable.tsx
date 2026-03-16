import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";


type EventRow = {
  id: number;
  startDate: string;
  endDate: string | null;

  organizer: string | null;   // ← FEHLTE!
  location: string | null;
  type: string | null;
  timeSlot: string | null;

  recurrence: string | null;
  importId: string | null;
};

type EventsTableProps = {
  reload: number;
  onEdit: (ev: any) => void;
  onDelete: (ev: EventRow) => void;
};

type Lookups = {
  organizers: string[];
  locations: string[];
  types: string[];
  timeSlots: string[];
};

type EventsResponse = {
  data: EventRow[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  filters: Record<string, string | null>;
};

function buildQuery(params: {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  dateFilters: { startDateFrom: string; startDateTo: string };
}) {
  const search = new URLSearchParams();

  search.set("page", String(params.pagination.pageIndex + 1));
  search.set("pageSize", String(params.pagination.pageSize));

  if (params.sorting.length > 0) {
    const s = params.sorting[0];
    search.set("sortBy", s.id);
    search.set("sortDir", s.desc ? "desc" : "asc");
  }

  params.columnFilters.forEach((f) => {
    if (f.value) {
      search.set(f.id, String(f.value));
    }
  });

  if (params.dateFilters.startDateFrom) {
    search.set("startDateFrom", params.dateFilters.startDateFrom);
  }
  if (params.dateFilters.startDateTo) {
    search.set("startDateTo", params.dateFilters.startDateTo);
  }

  return search.toString();
}

export function EventsTable({ reload, onEdit, onDelete }: EventsTableProps) {
  const [data, setData] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [lookups, setLookups] = useState<Lookups>({
    organizers: [],
    locations: [],
    types: [],
    timeSlots: [],
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "startDate", desc: false },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [dateFilters, setDateFilters] = useState({
    startDateFrom: "",
    startDateTo: "",
  });

  // Lookups laden
  useEffect(() => {
    fetch("/api/lookups")
      .then((res) => res.json())
      .then((data: Lookups) => setLookups(data))
      .catch((err) => console.error("Lookup fetch error", err));
  }, []);

  // Events laden
  useEffect(() => {
    //console.log("Events useEffect läuft", { pagination, sorting, columnFilters, dateFilters });
    const query = buildQuery({ pagination, sorting, columnFilters, dateFilters });

    fetch(`/api/events?${query}`)
      .then((res) => res.json())
      .then((json: EventsResponse) => {
        //console.log("EventsResponse", json);
        setData(json.data);
        setTotal(json.total);
        setPageCount(json.pageCount);
      })
      .catch((err) => console.error("Events fetch error", err));
  }, [pagination, sorting, columnFilters, dateFilters, reload]);

  const columns = useMemo<ColumnDef<EventRow>[]>(
    () => [
      {
        accessorKey: "startDate",
        header: "Start",
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as string;
          return new Date(value).toLocaleDateString("de-DE");
        },
      },
      {
        accessorKey: "endDate",
        header: "Ende",
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as string | null;
          return value ? new Date(value).toLocaleDateString("de-DE") : "";
        },
      },
      {
        accessorKey: "organizer",
        header: "Veranstalter",
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "location",
        header: "Ort",
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "type",
        header: "Typ",
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "timeSlot",
        header: "Zeitfenster",
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-xs btn-ghost text-red-400"
              onClick={() => onEdit(row.original)}
            >
              <PencilIcon className="h-6 w-6" />
            </button>

            <button
              className="btn btn-xs btn-ghost text-error"
              onClick={() => onDelete(row.original)}
            >
              <TrashIcon className="h-6 w-6 text-blue-600 text-base" />
            </button>

          </div >
        ),
      },
    ],
    [onEdit],
  );

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="card bg-base-200 shadow border-1 p-4 space-y-6" >

        {/* Filterzeile 1 */}
        < div className="grid grid-cols-3 gap-4" >

          {/* Veranstalter */}
          <div>
            <label className="block text-sm font-bold mb-1">Veranstalter</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={(table.getColumn("organizer")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("organizer")?.setFilterValue(e.target.value || undefined)
              }
            >
              <option value="">Alle</option>
              {lookups.organizers.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div >

          {/* Ort */}
          <div>
            <label className="block text-sm font-bold mb-1">Ort</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={(table.getColumn("location")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("location")?.setFilterValue(e.target.value || undefined)
              }
            >
              <option value="">Alle</option>
              {lookups.locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div >

          {/* Typ */}
          <div>
            <label className="block text-sm font-medium mb-1">Typ</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("type")?.setFilterValue(e.target.value || undefined)
              }
            >
              <option value="">Alle</option>
              {lookups.types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div >

        </div >

        {/* Filterzeile 2 */}
        < div className="grid grid-cols-3 gap-4" >

          {/* Start ab */}
          <div>
            <label className="block text-sm font-medium mb-1">Start ab</label>
            <input
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={dateFilters.startDateFrom}
              onChange={(e) =>
                setDateFilters((old) => ({ ...old, startDateFrom: e.target.value }))
              }
            />
          </div >

          {/* Start bis */}
          <div>
            <label className="block text-sm font-medium mb-1">Start bis</label>
            <input
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={dateFilters.startDateTo}
              onChange={(e) =>
                setDateFilters((old) => ({ ...old, startDateTo: e.target.value }))
              }
            />
          </div >

          {/* Reset */}
          <div className="flex items-end" >
            <button
              className="border rounded px-3 py-1 text-1xl bg-teal-600 rounded-lg text-white w-full"
              onClick={() => setDateFilters({ startDateFrom: "", startDateTo: "" })}
            >
              Datum zurücksetzen
            </button>
          </div >

        </div >

      </div >

      {/* Tabelle */}
      <div className="overflow-x-auto border-1 rounded" >
        <table className="table-compact min-w-full text-sm">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left cursor-pointer select-none"
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}

                      {canSort && (
                        <span className="ml-1 text-xs">
                          {sortDir === "asc" && "▲"}
                          {sortDir === "desc" && "▼"}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-center" colSpan={columns.length}>
                  Keine Einträge gefunden.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t odd:bg-green-200 hover:bg-green-400  cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div >

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4" >
        <div className="flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            « Erste
          </button>
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ‹ Zurück
          </button>
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Weiter ›
          </button>
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            Letzte »
          </button>
        </div>

        <div>
          <span className="text-sm"> Anzahl Datensätze: {total} </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>
            Seite {pagination.pageIndex + 1} von {pageCount || 1}
          </span>
          <select
            className="border rounded px-2 py-1"
            value={pagination.pageSize}
            onChange={(e) =>
              setPagination((old) => ({
                ...old,
                pageSize: Number(e.target.value),
                pageIndex: 0,
              }))
            }
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / Seite
              </option>
            ))}
          </select>
        </div>
      </div >
    </div >
  );
}
