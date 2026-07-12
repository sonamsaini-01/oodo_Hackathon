
import React from 'react';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#F7F9FC]">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={`border-b border-[#E2E8F0] ${className}`}>{children}</tr>;
}

export function TableHead({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B]" {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-3 text-sm text-[#0F172A]" {...props}>{children}</td>;
}
