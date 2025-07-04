'use client';

import { DataTable } from '@/components/data-table';
import { columns, cashFlowTableActions } from '@/components/cash-flow/columns';
import type { CashFlowEntry } from '@/types';

interface CashFlowTableProps {
  data: CashFlowEntry[];
  expenseDescriptions: string[];
}

export function CashFlowTable({ data, expenseDescriptions }: CashFlowTableProps) {
  // `cashFlowTableActions` is a function that returns another function (the actual actions renderer).
  // It's a client function and it's being called here in a client component, which is fine.
  const actions = cashFlowTableActions(expenseDescriptions);

  return <DataTable columns={columns} data={data} actions={actions} />;
}
