'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DataTableProps<TData> {
  columns: {
    accessorKey: keyof TData;
    header: string;
    cell?: (row: TData) => React.ReactNode;
  }[];
  data: TData[];
  actions?: (row: TData) => React.ReactNode;
}

export function DataTable<TData extends { id: string }>({
  columns,
  data,
  actions,
}: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey as string}>
                {column.header}
              </TableHead>
            ))}
            {actions && <TableHead className="text-right">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length ? (
            data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.accessorKey as string}>
                    {column.cell
                      ? column.cell(row)
                      : (row[column.accessorKey] as React.ReactNode)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {actions(row)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
