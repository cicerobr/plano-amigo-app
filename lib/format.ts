export function formatCurrencyBRL(value?: number | string): string {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num as number)) return String(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num as number);
}

export function formatDateBR(input?: string | Date): string {
  if (!input) return '—';
  try {
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return String(input);
  }
}

export type StatusKind = 'pago' | 'em_aberto' | 'vencido' | 'outro';

export function normalizeStatus(status?: string): StatusKind {
  const s = (status || '').trim().toLowerCase();
  if (!s) return 'outro';
  if (s.includes('pago')) return 'pago';
  if (s.includes('venc')) return 'vencido';
  if (s.includes('aberto')) return 'em_aberto';
  return 'outro';
}

