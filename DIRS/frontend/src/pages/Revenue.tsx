import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { buildWeeklyArchive, fetchDailyReport, printDailyTransactionReport, ArchiveItem, ArchiveMeta, ArchiveSummary, DailyReport } from '../lib/archiveReport';
import { getLocalISODate } from '../lib/dateUtils';
import { FileText, TrendingUp, Calendar } from '../lib/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DocumentRecord {
  order_no: string;
  invoice_no: string;
  resident_name: string;
  document_type: string;
  amount: number;
  date: string;
  status: string;
}

function parseDateInput(dateStr: string) {
  const parts = dateStr.split('-').map((v) => Number(v));
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
}

export function Revenue() {
  const { t } = useLanguage();
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/documents?all=true');
        if (!res.ok) throw new Error('API error');
        const payload = await res.json();
        const docs = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload.documents)
              ? payload.documents
              : [];

        setDocs(
          docs.map((doc: any) => ({
            ...doc,
            date: doc.date || (doc.createdAt ? getLocalISODate(new Date(doc.createdAt)) : ''),
          }))
        );
      } catch (e) {
        console.error(e);
        setError(t('Cannot load revenue', 'Hindi ma-load ang kita'));
      } finally {
        setLoading(false);
      }
    };
    load();

    const handleDocumentsUpdated = () => load();
    const handleFocus = () => load();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'documentsUpdatedAt' && event.newValue) {
        load();
      }
    };

    window.addEventListener('documentsUpdated', handleDocumentsUpdated);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('documentsUpdated', handleDocumentsUpdated);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [t]);

  const { totalRevenue, totalDocs, avg, byType, byDay } = useMemo(() => {
    const totalRevenue = docs.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalDocs = docs.length;
    const avg = totalDocs > 0 ? totalRevenue / totalDocs : 0;

    const byType = docs.reduce((acc: Record<string, number>, d) => {
      const type = d.document_type || t('Unknown', 'Unknown');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const week = new Map<string, number>();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      week.set(d.toLocaleDateString('en-US', { weekday: 'short' }), 0);
    }
    docs.forEach((d) => {
      const label = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (week.has(label)) week.set(label, week.get(label)! + Number(d.amount || 0));
    });
    return { totalRevenue, totalDocs, avg, byType, byDay: week };
  }, [docs, t]);

  const [showArchive, setShowArchive] = useState(false);
  const [archiveView, setArchiveView] = useState<'weekly' | 'daily'>('weekly');
  const [weeklyArchive, setWeeklyArchive] = useState<ArchiveItem[]>([]);
  const [weeklyDocs, setWeeklyDocs] = useState<DocumentRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateSummary, setDateSummary] = useState<ArchiveSummary>({ count: 0, amount: 0 });

  const selectedWeekStart = selectedDate ? parseDateInput(selectedDate) : null;
  const selectedWeekEnd = selectedWeekStart ? new Date(selectedWeekStart) : null;
  if (selectedWeekEnd) selectedWeekEnd.setDate(selectedWeekEnd.getDate() + 6);
  const selectedWeekRangeLabel = selectedWeekStart && selectedWeekEnd ? `${selectedWeekStart.toLocaleDateString()} - ${selectedWeekEnd.toLocaleDateString()}` : '';
  const [archiveMeta, setArchiveMeta] = useState<ArchiveMeta>({
    range: '',
    totalTransactions: 0,
    totalAmount: 0,
    avgPerDay: 0,
    topDocumentType: ''
  });
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);

  const [range, setRange] = useState<'7' | '30' | '90'>('7');

  const trendData = useMemo(() => {
    const periods = [...Array(Number(range)).keys()].map((index) => {
      const date = new Date();
      date.setDate(date.getDate() - (Number(range) - 1 - index));
      return date;
    });

    return periods.map((date) => {
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      const amount = docs
        .filter((doc) => {
          const docDate = new Date(doc.date || '');
          return docDate.toDateString() === date.toDateString();
        })
        .reduce((sum, doc) => sum + Number(doc.amount || 0), 0);
      return { label, amount };
    });
  }, [docs, range]);

  if (loading) return <div className="p-4">{t('Loading revenue...', 'Kinukuha ang kita...')}</div>;
  if (error) return <div className="p-4 text-red-700">{error}</div>;

  const fetchWeeklyDocsFromDb = async (startDate: string, endDate: string) => {
    const res = await fetch(`/api/documents?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    if (!res.ok) {
      throw new Error('Failed to fetch weekly documents');
    }
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  };

  const openArchive = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    const end = new Date(today);
    end.setDate(start.getDate() + 6);
    const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

    try {
      const weekDocs = await fetchWeeklyDocsFromDb(startDate, endDate);
      setWeeklyDocs(weekDocs);
      const { archiveItems, archiveMeta: meta, selectedDate: defaultDate, selectedSummary } = buildWeeklyArchive(weekDocs, start);
      setWeeklyArchive(archiveItems);
      setArchiveMeta(meta);
      setSelectedDate(defaultDate);
      setDateSummary(selectedSummary);
      setArchiveView('weekly');
      setShowArchive(true);
    } catch (err) {
      console.error(err);
      setError(t('Cannot load weekly archive', 'Hindi ma-load ang weekly archive'));
    }
  };

  const updateDateSummary = async (dateStr: string) => {
    const selectedDateObj = parseDateInput(dateStr);
    if (Number.isNaN(selectedDateObj.getTime())) return;

    const start = new Date(selectedDateObj);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

    try {
      const weekDocs = await fetchWeeklyDocsFromDb(startDate, endDate);
      setWeeklyDocs(weekDocs);
      setSelectedDate(dateStr);
      const { archiveItems, archiveMeta: meta, selectedSummary } = buildWeeklyArchive(weekDocs, start);
      setWeeklyArchive(archiveItems);
      setArchiveMeta(meta);
      setDateSummary(selectedSummary);
    } catch (err) {
      console.error(err);
      setError(t('Cannot load weekly archive', 'Hindi ma-load ang weekly archive'));
    }
  };

  const openDailyReport = async (dateStr: string) => {
    try {
      const report = await fetchDailyReport(dateStr);
      setDailyReport(report);
      setArchiveView('daily');
      setShowArchive(true);
    } catch (err) {
      console.error(err);
      setDailyReport(null);
      setArchiveView('weekly');
      setShowArchive(true);
    }
  };

  const exportArchiveData = () => {
    // Only export the weeklyDocs shown in the modal
    printDailyTransactionReport(weeklyDocs.map((doc) => ({
      order_no: doc.order_no,
      invoice_no: doc.invoice_no,
      resident_name: doc.resident_name,
      document_type: doc.document_type,
      amount: Number(doc.amount || 0),
      date: doc.date,
      status: doc.status
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Document Issuance & Revenue System', 'Sistema ng Pag-isyu ng Dokumento at Kita')}</p>
          <h1 className="text-3xl font-black text-slate-900">{t('Revenue Management', 'Pamamahala ng Kita')}</h1>
          <p className="mt-2 text-slate-500 max-w-2xl">{t('Track revenue, manage archives, and analyze document issuance performance.', 'Subaybayan ang kita, pamahalaan ang mga archive, at suriin ang performance ng pag-isyu ng dokumento.')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: '7', label: t('Last 7 days', 'Nakaraang 7 araw') },
            { key: '30', label: t('Last 30 days', 'Nakaraang 30 araw') },
            { key: '90', label: t('Last 90 days', 'Nakaraang 90 araw') }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key as '7' | '30' | '90')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${range === option.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{t('Total Revenue', 'Kabuuang Kita')}</p>
              <p className="mt-3 text-2xl font-black text-gray-900">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-blue-500 p-3 text-white">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t('Revenue from all issued documents', 'Kita mula sa lahat ng na-isyu na dokumento')}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{t('Total Documents', 'Kabuuang Dokumento')}</p>
              <p className="mt-3 text-2xl font-black text-gray-900">{totalDocs}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500 p-3 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t('Documents issued', 'Mga na-isyu na dokumento')}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{t('Avg Revenue / Document', 'Average Kita / Dokumento')}</p>
              <p className="mt-3 text-2xl font-black text-gray-900">₱{avg.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-purple-500 p-3 text-white">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t('Average revenue per document', 'Average na kita bawat dokumento')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-semibold text-gray-800">{t('Revenue Trend', 'Takbo ng Kita')}</h3>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as '7' | '30' | '90')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">{t('Last 7 days', 'Nakaraang 7 araw')}</option>
            <option value="30">{t('Last 30 days', 'Nakaraang 30 araw')}</option>
            <option value="90">{t('Last 90 days', 'Nakaraang 90 araw')}</option>
          </select>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={trendData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10} 
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                tickFormatter={(value) => `₱${value.toLocaleString()}`}
              />
              
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
                formatter={(value: any) => [`₱${Number(value || 0).toLocaleString()}`, 'Revenue']}
                labelStyle={{ color: '#6B7280', fontWeight: 'bold', marginBottom: '4px' }}
              />
              
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#EF4444" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {showArchive && (
        <div className="fixed inset-0 z-50 bg-black/40 p-2 sm:p-6 flex items-center justify-center overflow-auto">
          <div className="w-full max-w-6xl h-[92vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-200 gap-3">
              <div>
                {archiveView === 'weekly' ? (
                  <>
                    <p className="text-lg font-extrabold text-gray-900">Weekly Archive</p>
                    <p className="text-sm text-gray-500">Current week summary</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-extrabold text-gray-900">Per Day Report</p>
                    <p className="text-sm text-gray-500">Selected day summary</p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={exportArchiveData} className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold">{t('Export Data', 'I-export ang Data')}</button>
                <button onClick={() => setShowArchive(false)} className="px-4 py-2 rounded bg-gray-100 text-gray-700 text-sm font-semibold">{t('Close', 'Isara')}</button>
              </div>
            </div>
            {archiveView === 'weekly' && (
              <div className="p-5 space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                <label htmlFor="archive-date" className="font-semibold">{t('Filter week start:', 'Simula ng linggo:')}</label>
                <input
                  id="archive-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;
                    setSelectedDate(value);
                    updateDateSummary(value);
                  }}
                  className="border border-blue-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {selectedDate && (
                  <div className="text-sm font-bold text-white bg-blue-600 border border-blue-700 rounded-lg px-3 py-2 shadow-md">
                    {t('Week:', 'Linggo:')} {selectedWeekRangeLabel}
                  </div>
                )}
                <button
                  onClick={openArchive}
                  className="ml-2 px-3 py-2 border border-slate-300 rounded text-sm font-semibold bg-white hover:bg-slate-100"
                >
                  {t('Reset weekly', 'I-reset ang linggo')}
                </button>
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <p className="text-gray-500 uppercase text-xs">{t('Selected Week Tx', 'Transaksyon sa Napiling Linggo')}</p>
                  <p className="text-lg font-bold text-gray-800">{dateSummary.count}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <p className="text-gray-500 uppercase text-xs">{t('Selected Week Amount', 'Halaga sa Napiling Linggo')}</p>
                  <p className="text-lg font-bold text-gray-800">₱{dateSummary.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <p className="text-gray-500 uppercase text-xs">{t('Week Range', 'Saklaw ng Linggo')}</p>
                  <p className="font-bold text-gray-800">{archiveMeta.range || 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <p className="text-gray-500 uppercase text-xs">{t('Total Transactions', 'Kabuuang Transaksyon')}</p>
                  <p className="font-bold text-gray-800">{archiveMeta.totalTransactions}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <p className="text-gray-500 uppercase text-xs">{t('Total Amount', 'Kabuuang Halaga')}</p>
                  <p className="font-bold text-gray-800">₱{archiveMeta.totalAmount.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <p className="text-gray-500 uppercase text-xs">{t('Average per Day', 'Average kada Araw')}</p>
                  <p className="font-bold text-gray-800">₱{archiveMeta.avgPerDay.toFixed(2)}</p>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <p className="text-gray-500 uppercase text-xs">{t('Top Document Type', 'Pinakamataas na Uri ng Dokumento')}</p>
                <p className="text-xl font-semibold text-gray-800">{archiveMeta.topDocumentType}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800 uppercase">{t('Daily Breakdown', 'Araw-araw na Paglalahad')}</p>
              </div>
              <div className="overflow-auto max-h-[38vh]">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                    <th className="px-3 py-2 border border-gray-200">Date</th>
                    <th className="px-3 py-2 border border-gray-200">Transactions</th>
                    <th className="px-3 py-2 border border-gray-200">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyArchive.map((item) => {
                      const itemDate = new Date(item.isoDate);
                      const isHighlighted = selectedWeekStart && selectedWeekEnd && itemDate >= selectedWeekStart && itemDate <= selectedWeekEnd;
                      return (
                        <tr key={item.isoDate} className={isHighlighted ? 'bg-blue-50 border border-blue-200' : 'border border-gray-200'}>
                          <td className="px-3 py-2 border border-gray-200">{item.date}</td>
                          <td className="px-3 py-2 border border-gray-200">{item.count}</td>
                          <td className="px-3 py-2 border border-gray-200">₱{item.amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      {archiveView === 'daily' && dailyReport && (
        <div className="p-4 space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <label htmlFor="daily-filter-date" className="font-semibold text-sm">Filter date:</label>
            <input
              id="daily-filter-date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const date = e.target.value;
                setSelectedDate(date);
                openDailyReport(date);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
            <button
              onClick={() => {
                openArchive();
                setArchiveView('weekly');
              }}
              className="ml-2 px-3 py-1 text-sm font-semibold border border-slate-300 rounded bg-white hover:bg-slate-100"
            >
              Reset weekly
            </button>
            <div className="rounded-lg border border-gray-200 p-2 bg-gray-50">
              <p className="text-gray-500 uppercase text-[10px]">Selected Day Tx</p>
              <p className="text-lg font-bold text-gray-800">{dailyReport.summary.count}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-2 bg-gray-50">
              <p className="text-gray-500 uppercase text-[10px]">Selected Day Amount</p>
              <p className="text-lg font-bold text-gray-800">₱{dailyReport.summary.amount.toFixed(2)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-2 bg-gray-50"><p className="text-xs uppercase text-gray-500">Transactions</p><p className="font-semibold">{dailyReport.summary.count}</p></div>
            <div className="rounded-lg border p-2 bg-gray-50"><p className="text-xs uppercase text-gray-500">Amount</p><p className="font-semibold">₱{dailyReport.summary.amount.toFixed(2)}</p></div>
          </div>
          <div className="rounded-lg border p-2 bg-gray-50">
            <p className="text-xs uppercase text-gray-500">Top Document Type</p>
            <div className="mt-1 text-sm font-semibold">{Object.entries(dailyReport.byType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}</div>
          </div>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm border border-gray-200">
              <thead className="bg-gray-50"><tr><th className="border p-2">Invoice</th><th className="border p-2">Resident</th><th className="border p-2">Doc Type</th><th className="border p-2">Amount</th><th className="border p-2">Status</th></tr></thead>
              <tbody>
                {dailyReport.docs.map((doc, i) => (
                  <tr key={`${doc.invoice_no ?? i}-${i}`}>
                    <td className="border p-2">{doc.invoice_no || doc.order_no || '—'}</td>
                    <td className="border p-2">{doc.resident_name || '—'}</td>
                    <td className="border p-2">{doc.document_type || '—'}</td>
                    <td className="border p-2">₱{Number(doc.amount || 0).toFixed(2)}</td>
                    <td className="border p-2">{doc.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      </div>
      )}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{t('Revenue Management', 'Pamamahala ng Kita')}</p>
          <h1 className="text-3xl font-black text-slate-900">{t('Track and analyze revenue from document issuance', 'Subaybayan at suriin ang kita mula sa pag-isyu ng dokumento')}</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-lg font-extrabold uppercase tracking-wide shadow-lg hover:bg-blue-700 transition-all" onClick={openArchive}>{t('Archive', 'Arkibo')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-100/80">{t('Total Revenue', 'Kabuuang Kita')}</p>
              <p className="mt-2 text-3xl font-bold">₱{totalRevenue.toLocaleString()}</p>
              <p className="mt-1 text-xs text-blue-100/90">+15% {t('from last month', 'mula nakaraang buwan')}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-100/90">{t('This Month', 'Ngayong Buwan')}</p>
              <p className="mt-2 text-3xl font-bold">₱{docs.reduce((sum, d) => {
                const dt = new Date(d.date);
                const now = new Date();
                return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear() ? sum + Number(d.amount || 0) : sum;
              }, 0).toLocaleString()}</p>
              <p className="mt-1 text-xs text-emerald-100/90">+8% {t('from previous', 'mula sa nakaraan')}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-violet-100/90">{t('This Year', 'Ngayong Taon')}</p>
              <p className="mt-2 text-3xl font-bold">₱{totalRevenue.toLocaleString()}</p>
              <p className="mt-1 text-xs text-violet-100/90">{t('Annual total', 'Kabuuang Taon')}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-orange-100/90">{t('Avg per Document', 'Average kada Dokumento')}</p>
              <p className="mt-2 text-3xl font-bold">₱{avg.toFixed(2)}</p>
              <p className="mt-1 text-xs text-orange-100/90">{t('Per transaction', 'Kada transaksyon')}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold">{t('7-Day Revenue Trend', 'Araw-araw na Trend ng Kita')}</p>
            </div>
            <span className="text-xs text-slate-500">{t('Live update', 'Live update')}</span>
          </div>
          <div className="space-y-3">
            {Array.from(byDay.entries()).map(([day, value]) => {
              const width = totalRevenue > 0 ? Math.min(100, (value / totalRevenue) * 100) : 1;
              return (
                <div key={day} className="flex items-end gap-3">
                  <div className="w-16 text-sm uppercase font-semibold text-gray-600">{day}</div>
                  <div className="flex-1 h-10 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${Math.max(15, width)}%` }} />
                  </div>
                  <div className="w-28 text-right text-sm font-semibold text-gray-700">₱{value.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold">{t('Doc Type Distribution', 'Distribusyon ng Uri ng Dokumento')}</p>
          <div className="mt-3 space-y-2">
            {Object.entries(byType).map(([type, value]) => {
              const pct = totalDocs > 0 ? (value / totalDocs) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm font-semibold"><span>{type}</span><span>{value}</span></div>
                  <div className="h-2 rounded-full bg-slate-100 mt-1 overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${Math.max(8, pct)}%` }} /></div>
                  <div className="text-[11px] text-slate-400">{Math.round(pct)}% {t('of documents', 'ng mga dokumento')}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xl font-semibold text-slate-800">{t('Key Metrics', 'Pangunahing Sukatan')}</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 min-h-[130px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-700">{t('Docs Issued', 'Naibigay na Dokumento')}</p>
                <p className="mt-2 text-3xl font-extrabold text-blue-900">{totalDocs}</p>
                <p className="text-[10px] text-blue-700">{t('All time', 'Sa lahat ng panahon')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white grid place-content-center">#</div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700">{t('Avg Revenue/Doc', 'Average Kita kada Dokumento')}</p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-900">₱{avg.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-700">{t('Per document', 'Kada dokumento')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-content-center">₱</div>
            </div>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-violet-700">{t('Monthly Average', 'Buwanang Average')}</p>
                <p className="mt-2 text-3xl font-extrabold text-violet-900">₱{(totalRevenue / 12).toFixed(0)}</p>
                <p className="text-[10px] text-violet-700">{t('Projected per month', 'Tinatayang kada buwan')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-violet-600 text-white grid place-content-center">M</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
