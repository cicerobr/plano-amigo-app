import React from 'react';

export interface InvoiceFiltersValue {
  status?: string;
  paid?: 'pago' | 'nao_pago' | '';
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export function InvoiceFilters({ value, onChange }: { value: InvoiceFiltersValue; onChange: (v: InvoiceFiltersValue) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
        <select
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={value.status || ''}
          onChange={(e) => onChange({ ...value, status: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="pago">Pago</option>
          <option value="em aberto">Em aberto</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Pagamento</label>
        <select
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={value.paid || ''}
          onChange={(e) => onChange({ ...value, paid: e.target.value as any })}
        >
          <option value="">Todos</option>
          <option value="pago">Pago</option>
          <option value="nao_pago">Não pago</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">De</label>
        <input
          type="date"
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={value.from || ''}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Até</label>
        <input
          type="date"
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={value.to || ''}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </div>
    </div>
  );
}

