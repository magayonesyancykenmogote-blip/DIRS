import { X, Search, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Transaction {
  _id?: string;
  id?: string;
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
  onTransactionUpdate?: (updatedTransaction: Transaction) => void;
}

const ITEMS_PER_PAGE = 10;

export function TransactionHistory({ open, onClose, transactions, processorName, onTransactionUpdate }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const { t } = useLanguage();

  const resetSearch = () => {
    setSearchTerm('');
    setQuery('');
    setCurrentPage(1);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingId(transaction._id || transaction.id || '');
    setEditAmount(transaction.amount.toString());
    setUpdateError('');
  };

  const handleUpdatePrice = async () => {
    const docId = editingId;
    if (!docId || !editAmount) {
      setUpdateError('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      setUpdateError('Amount must be a valid non-negative number');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update document');
      }

      const updatedDoc = await response.json();
      
      // Notify parent component if callback provided
      if (onTransactionUpdate) {
        onTransactionUpdate({
          ...updatedDoc,
          id: updatedDoc._id,
        });
      }

      // Reset edit state
      setEditingId(null);
      setEditAmount('');
      setUpdateError('');
    } catch (error) {
      console.error('Error updating document:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to update document');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((t) =>
      t.resident_name.toLowerCase().includes(term)
    );
  }, [transactions, query]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage]);

  const totalAmount = useMemo(() => filtered.reduce((acc, t) => acc + t.amount, 0), [filtered]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900">{t('Transaction History', 'Kasaysayan ng Transaksyon')}</h3>
            <p className="text-xs text-indigo-700 uppercase tracking-[0.2em]">{`Logged in as: ${processorName}`}</p>
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
                onKeyDown={(e) => e.key === 'Enter' && (setQuery(searchTerm), setCurrentPage(1))}
              />
            </div>
            <button
              onClick={() => {
                setQuery(searchTerm);
                setCurrentPage(1);
              }}
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
                  <th className="px-3 py-3 border-b border-gray-100">{t('Action', 'Aksyon')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((t) => (
                  <tr key={t._id || t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 font-bold text-blue-600">{t.invoice_no}</td>
                    <td className="px-3 py-3">{t.resident_name}</td>
                    <td className="px-3 py-3">{t.document_type}</td>
                    <td className="px-3 py-3">₱{t.amount.toFixed(2)}</td>
                    <td className="px-3 py-3">{t.date} {t.time}</td>
                    <td className="px-3 py-3">{t.processed_by}</td>
                    <td className="px-3 py-3"><span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">{t.status}</span></td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                        title={t('Edit amount', 'I-edit ang halaga')}
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400">{t('No transactions match your search.', 'Walang transaksiyon na tumutugma sa iyong paghahanap.')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-3">
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-gray-600">
                  {t('Page', 'Pahina')} {currentPage} {t('of', 'ng')} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Summary Stats */}
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 border-t border-gray-100 pt-3">
              <p>{t('Total records', 'Kabuuang talaan')}: {filtered.length}</p>
              <p>{t('Total amount', 'Kabuuang halaga')}: ₱{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Edit Price Modal */}
        {editingId && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-gray-900">{t('Edit Amount', 'I-edit ang Halaga')}</h4>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setUpdateError('');
                  }}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('Amount (₱)', 'Halaga (₱)')}</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => {
                      setEditAmount(e.target.value);
                      setUpdateError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    placeholder={t('Enter amount', 'Magpasok ng halaga')}
                    step="0.01"
                    min="0"
                  />
                </div>

                {updateError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {updateError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setUpdateError('');
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-100"
                  >
                    {t('Cancel', 'Kanselahin')}
                  </button>
                  <button
                    onClick={handleUpdatePrice}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdating ? t('Updating...', 'Ina-update...') : t('Update', 'I-update')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
