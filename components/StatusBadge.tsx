import React from 'react';
import { normalizeStatus, StatusKind } from '@/lib/format';

export function StatusBadge({ status }: { status?: string }) {
  const kind: StatusKind = normalizeStatus(status);
  const classes = {
    pago: 'bg-green-100 text-green-700',
    em_aberto: 'bg-yellow-100 text-yellow-800',
    vencido: 'bg-red-100 text-red-700',
    outro: 'bg-gray-100 text-gray-700',
  }[kind];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {status || '—'}
    </span>
  );
}

