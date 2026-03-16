import React from "react";

type DashboardCardProps = {
    title: string;
    children: React.ReactNode;
};

export function DashboardCard({ title, children }: DashboardCardProps) {
    return (
        <div className="card bg-base-300 shadow w-96 p-4 space-y-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="flex items-center gap-4">
                {children}
            </div>
        </div>
    );
}
