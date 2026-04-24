export interface TransactionEntry {
  id: string;
  order_no: string;
  invoice_no: string;
  resident_name: string;
  document_type: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  processed_by: string;
}

const STORAGE_KEY = 'barangay_transactions';
const COUNTER_KEY = 'barangay_invoice_counter';

export function getStoredTransactions(): TransactionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTransaction(entry: TransactionEntry) {
  const all = getStoredTransactions();
  const next = [...all, entry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function getInvoiceCounter(): number {
  const raw = localStorage.getItem(COUNTER_KEY);
  if (raw) {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  const all = getStoredTransactions();
  const max = all
    .map((t) => {
      const match = t.invoice_no.match(/INV-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);

  return Math.max(max, 1000);
}

export function getNextInvoiceNumber(): string {
  const current = getInvoiceCounter();
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return `INV-${String(next).padStart(5, '0')}`;
}

export function clearTransactionDB() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COUNTER_KEY);
}
