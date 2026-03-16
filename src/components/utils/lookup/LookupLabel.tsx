type LookupLabelProps = {
    label: string;
    isAdding: boolean;
};

export function LookupLabel({ label, isAdding }: LookupLabelProps) {
    const text = isAdding ? `Neue(r) ${label}` : label;
    const bg = isAdding ? "bg-red-300" : "bg-green-200";

    return (
        <span className={`px-2 py-1 rounded text-sm font-bold ${bg}`}>
            {text}
        </span>
    );
}
