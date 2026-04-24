import { X, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Transaction {
  id: string;
  invoice_no: string;
  resident_name: string;
  document_type: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  processed_by: string;
}

interface TransactionHistoryProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  processorName: string;
}

export function TransactionHistory({ open, onClose, transactions, processorName }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const resetSearch = () => {
    setSearchTerm('');
    setQuery('');
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((t) =>
      t.resident_name.toLowerCase().includes(term)
    );
  }, [transactions, query]);

  const totalAmount = useMemo(() => filtered.reduce((acc, t) => acc + t.amount, 0), [filtered]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900">{t('Transaction History', 'Kasaysayan ng Transaksyon')}</h3>
            <p className="text-xs text-indigo-700 uppercase tracking-[0.2em]">{t('Logged in as', 'Naka-log in bilang')}: {processorName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetSearch}
              className="px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs uppercase font-semibold"
            >
              {t('View all', 'Tingnan lahat')}
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="w-full pl-9 pr-20 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                placeholder={t('Search resident name', 'Maghanap ng pangalan ng residente')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setQuery(searchTerm)}
              />
            </div>
            <button
              onClick={() => setQuery(searchTerm)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider"
            >
              {t('Search', 'Hanapin')}
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-full border border-gray-100 rounded-xl text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3 py-3 border-b border-gray-100">{t('Invoice', 'Invoice')}</th>
                  <th className="px-3 py-3 border-b border-gray-100">{t('Resident', 'Residente')}</th>
                  <th className="px-3 py-3 border-b border-gray-100">{t('Document', 'Dokumento')}</th>
                  <th className="px-3 py-3 border-b border-gray-100">{t('Amount', 'Halaga')}</th>
                  <th className="px-3 py-3 border-b border-gray-100">{t('Date & Time', 'Petsa at Oras')}</th>
                  <th className="px-3 py-3 border-b border-gray-100">{t('Processed By', 'Pinroseso ni')}</th>
                  <th className="px-3 py-3 border-b border-gray-100">{t('Status', 'Katayuan')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 font-bold text-blue-600">{t.invoice_no}</td>
                    <td className="px-3 py-3">{t.resident_name}</td>
                    <td className="px-3 py-3">{t.document_type}</td>
                    <td className="px-3 py-3">₱{t.amount.toFixed(2)}</td>
                    <td className="px-3 py-3">{t.date} {t.time}</td>
                    <td className="px-3 py-3">{t.processed_by}</td>
                    <td className="px-3 py-3"><span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">{t.status}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-400">{t('No transactions match your search.', 'Walang transaksiyon na tumutugma sa iyong paghahanap.')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-bold text-gray-500">
            <p>{t('Total records', 'Kabuuang talaan')}: {filtered.length}</p>
            <p>{t('Total amount', 'Kabuuang halaga')}: ₱{totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
