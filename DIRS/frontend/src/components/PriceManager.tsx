import React, { useEffect, useState } from 'react';
import { Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DocumentPrice {
  _id?: string;
  document_id: string;
  document_name: string;
  price: number;
  is_free: boolean;
  category: 'Certificate' | 'Clearance';
}

interface PriceManagerProps {
  t?: (en: string, tl: string) => string;
}

export function PriceManager({ t: customT }: PriceManagerProps) {
  const { t: contextT } = useLanguage();
  const t = customT || contextT;
  
  const [prices, setPrices] = useState<DocumentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editIsFree, setEditIsFree] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        // First try to initialize if empty
        await fetch('/api/document-prices/init', { method: 'POST' }).catch(() => {
          // Initialization endpoint might not exist, that's okay
        });

        // Then load the prices
        const response = await fetch('/api/document-prices');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load prices`);
        }
        const data = await response.json();
        const pricesList = Array.isArray(data) ? data : (data.data || []);
        setPrices(pricesList);
      } catch (err) {
        console.error('Error loading prices:', err);
        setError(err instanceof Error ? err.message : 'Failed to load prices');
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, []);

  const handleEditClick = (price: DocumentPrice) => {
    setEditingId(price._id || price.document_id);
    setEditPrice(price.price.toString());
    setEditIsFree(price.is_free);
    setSaveError(null);
  };

  const handleSavePrice = async () => {
    const docId = editingId;
    if (!docId) return;

    let finalPrice = editPrice;
    let finalIsFree = editIsFree;

    if (editIsFree) {
      finalPrice = '0';
    } else {
      const numPrice = parseFloat(editPrice);
      if (isNaN(numPrice) || numPrice < 0) {
        setSaveError('Price must be a valid non-negative number');
        return;
      }
      finalPrice = numPrice.toString();
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/document-prices/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(finalPrice),
          is_free: finalIsFree,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update price');
      }

      const updated = await response.json();
      setPrices(prices.map(p => (p._id === updated._id || p.document_id === updated.document_id) ? updated : p));
      setSuccessMessage('Price updated successfully');
      
      // Emit event to notify other components
      window.dispatchEvent(new Event('pricesUpdated'));
      
      setTimeout(() => {
        setEditingId(null);
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Error updating price:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to update price');
    } finally {
      setIsSaving(false);
    }
  };

  const groupedByCategory = prices.reduce((acc, price) => {
    if (!acc[price.category]) {
      acc[price.category] = [];
    }
    acc[price.category].push(price);
    return acc;
  }, {} as Record<string, DocumentPrice[]>);

  const categories = Object.keys(groupedByCategory).sort();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('Loading prices...', 'Hinahanap ang mga presyo...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{t('Document Price Manager', 'Tagapamahala ng Presyo ng Dokumento')}</h3>
        <p className="text-xs text-gray-500 mt-1">{t('Edit prices and set free documents', 'I-edit ang mga presyo at itakda ang libreng mga dokumento')}</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      <div className="space-y-8">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-[0.1em] px-2">{category}</h4>
            
            <div className="space-y-2">
              {groupedByCategory[category].map(price => (
                <div
                  key={price._id || price.document_id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{price.document_name}</p>
                    {price.is_free ? (
                      <p className="text-xs text-green-600 font-semibold">{t('Free', 'Libre')}</p>
                    ) : (
                      <p className="text-xs text-blue-600 font-semibold">₱{price.price.toFixed(2)}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleEditClick(price)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition shrink-0"
                    title={t('Edit price', 'I-edit ang presyo')}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {prices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>{t('No document prices configured', 'Walang na-configure na presyo ng dokumento')}</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-gray-900">
                {t('Edit Price', 'I-edit ang Presyo')}
              </h4>
              <button
                onClick={() => {
                  setEditingId(null);
                  setSaveError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('Document', 'Dokumento')}
                </label>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  {prices.find(p => (p._id || p.document_id) === editingId)?.document_name}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={editIsFree}
                  onChange={(e) => {
                    setEditIsFree(e.target.checked);
                    setSaveError(null);
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer"
                />
                <label htmlFor="isFree" className="text-sm font-bold text-gray-700 cursor-pointer flex-1">
                  {t('Free Document', 'Libreng Dokumento')}
                </label>
              </div>

              {!editIsFree && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t('Price (₱)', 'Presyo (₱)')}
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => {
                      setEditPrice(e.target.value);
                      setSaveError(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditingId(null);
                    setSaveError(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition"
                >
                  {t('Cancel', 'Kanselahin')}
                </button>
                <button
                  onClick={handleSavePrice}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isSaving ? t('Saving...', 'Nagsasave...') : t('Save', 'I-save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
