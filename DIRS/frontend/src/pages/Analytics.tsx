import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalISODate, normalizeToLocalISODate } from '../lib/dateUtils';

interface DocumentRecord {
  _id?: string;
  order_no?: string;
  invoice_no?: string;
  resident_name?: string;
  document_type?: string;
  amount?: number;
  date?: string;
  time?: string;
  status?: string;
  processed_by?: string;
}

type RangeOption = '7' | '30' | '90' | 'all';

const rangeLabels: Record<RangeOption, string> = {
  '7': 'Last 7 days',
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  all: 'All time'
};

function normalizeToISODate(value?: string) {
  return normalizeToLocalISODate(value);
}

function buildDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatCurrency(value: number) {
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function Analytics() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOption>('7');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/documents?all=true');
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const payload = await response.json();
        const docs = Array.isArray(payload.data) ? payload.data : [];
        setDocuments(
          docs.map((doc: DocumentRecord) => ({
            ...doc,
            amount: Number(doc.amount || 0),
            date: normalizeToISODate(doc.date) || getLocalISODate()
          }))
        );
      } catch (err) {
        console.error(err);
        setError(t('Could not load revenue analytics data.', 'Hindi ma-load ang revenue analytics na data.'));
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleDocumentsUpdated = () => loadData();
    const handleFocus = () => loadData();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'documentsUpdatedAt' && event.newValue) {
        loadData();
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

  const analytics = useMemo(() => {
    const today = new Date();
    const todayISO = getLocalISODate(today);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const normalized = documents.map((doc) => ({
      ...doc,
      amount: Number(doc.amount || 0),
      isoDate: normalizeToISODate(doc.date) || todayISO
    }));

    const totalDocs = normalized.length;
    const totalRevenue = normalized.reduce((sum, doc) => sum + doc.amount, 0);
    const avgRevenue = totalDocs > 0 ? totalRevenue / totalDocs : 0;
    const revenueToday = normalized.filter((doc) => doc.isoDate === todayISO).reduce((sum, doc) => sum + doc.amount, 0);
    const revenueThisWeek = normalized.filter((doc) => {
      const docDate = new Date(doc.isoDate);
      return docDate >= weekStart && docDate <= today;
    }).reduce((sum, doc) => sum + doc.amount, 0);
    const revenueThisMonth = normalized.filter((doc) => {
      const docDate = new Date(doc.isoDate);
      return docDate >= monthStart && docDate <= today;
    }).reduce((sum, doc) => sum + doc.amount, 0);

    const statusCounts = normalized.reduce((acc: Record<string, number>, doc) => {
      const status = doc.status?.trim() || t('Unknown', 'Hindi alam');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const typeCounts = normalized.reduce((acc: Record<string, { count: number; revenue: number }>, doc) => {
      const type = doc.document_type?.trim() || t('Unknown', 'Hindi alam');
      acc[type] = acc[type] || { count: 0, revenue: 0 };
      acc[type].count += 1;
      acc[type].revenue += doc.amount;
      return acc;
    }, {});

    const typeSummary = Object.entries(typeCounts)
      .map(([type, value]) => ({ type, count: value.count, revenue: value.revenue, pct: totalDocs > 0 ? (value.count / totalDocs) * 100 : 0 }))
      .sort((a, b) => b.revenue - a.revenue);

    const periodCount = range === 'all' ? 12 : Number(range);
    const periods = [...Array(periodCount).keys()].map((index) => {
      const date = new Date(today);
      if (range === 'all') {
        date.setMonth(today.getMonth() - (periodCount - 1 - index));
      } else {
        date.setDate(today.getDate() - (periodCount - 1 - index));
      }
      return date;
    });

    const trendData = periods.map((date) => {
      const label = range === 'all' ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : buildDayLabel(date);
      const amount = normalized
        .filter((doc) => {
          const docDate = new Date(doc.isoDate);
          if (range === 'all') {
            return docDate.getFullYear() === date.getFullYear() && docDate.getMonth() === date.getMonth();
          }
          return docDate.toDateString() === date.toDateString();
        })
        .reduce((sum, doc) => sum + doc.amount, 0);
      return { label, amount };
    });

    const maxTrend = Math.max(...trendData.map((item) => item.amount), 1);

    const latestDocuments = normalized
      .slice()
      .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime())
      .slice(0, 10);

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalDocs > 0 ? (count / totalDocs) * 100 : 0,
      color: status.toLowerCase().includes('completed') ? 'bg-emerald-500' : status.toLowerCase().includes('cancel') ? 'bg-red-500' : 'bg-slate-400'
    }));

    return {
      totalDocs,
      totalRevenue,
      avgRevenue,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      trendData,
      maxTrend,
      latestDocuments,
      statusBreakdown,
      typeSummary
    };
  }, [documents, range, t]);

  const {
    totalDocs,
    totalRevenue,
    avgRevenue,
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    trendData,
    maxTrend,
    latestDocuments,
    statusBreakdown,
    typeSummary
  } = analytics;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">{t('Loading revenue analytics...', 'Kinukuha ang revenue analytics...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Document Issuance & Revenue System', 'Sistema ng Pag-isyu ng Dokumento at Kita')}</p>
          <h1 className="text-3xl font-black text-slate-900">{t('Revenue Analytics', 'Revenue Analytics')}</h1>
          <p className="mt-2 text-slate-500 max-w-2xl">{t('Complete revenue, issuance, and document performance data in one unified dashboard.', 'Kumpletong kita, pag-isyu, at performance ng dokumento sa isang pinagsamang dashboard.')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['7', '30', '90', 'all'] as RangeOption[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${range === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {t(rangeLabels[option], rangeLabels[option])}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Total Revenue', 'Kabuuang Kita')}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="rounded-2xl bg-blue-500 p-3 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{t('Revenue from all issued documents', 'Kita mula sa lahat ng na-isyu na dokumento')}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Avg Revenue / Document', 'Average Kita / Dokumento')}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(avgRevenue)}</p>
            </div>
            <div className="rounded-2xl bg-green-100 p-3 text-green-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{t('Average amount per issued document', 'Average na halaga bawat na-isyu na dokumento')}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Revenue Today', 'Kita Ngayon')}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(revenueToday)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{t('Sales recognized today', 'Kita na naitala ngayon')}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('This Week', 'Ngayong Linggo')}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(revenueThisWeek)}</p>
            </div>
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{t('Last 7 days revenue', 'Kita sa nakaraang 7 araw')}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('This Month', 'Ngayong Buwan')}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(revenueThisMonth)}</p>
            </div>
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{t('Revenue in current month', 'Kita sa kasalukuyang buwan')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('Revenue Trend', 'Takbo ng Kita')}</h2>
              <p className="text-sm text-slate-500">{t('Tracked from your document issuance data', 'Nasusubaybayan mula sa iyong datos ng pag-isyu ng dokumento')}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{t(rangeLabels[range], rangeLabels[range])}</span>
          </div>
          <div className="space-y-3">
            {trendData.map((row) => (
              <div key={row.label} className="flex items-end gap-3">
                <div className="w-16 text-sm uppercase font-semibold text-slate-600">{row.label}</div>
                <div className="flex-1 h-10 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${Math.max(10, Math.round((row.amount / maxTrend) * 100))}%` }} />
                </div>
                <div className="w-28 text-right text-sm font-semibold text-slate-700">{formatCurrency(row.amount)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('Status Breakdown', 'Paglalahad ng Katayuan')}</h2>
              <p className="text-sm text-slate-500">{t('Completed and cancelled transactions', 'Mga natapos at kinanselang transaksyon')}</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{totalDocs} {t('records', 'mga tala')}</div>
          </div>
          <div className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-sm text-slate-700 mb-1">
                  <span>{item.status}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percentage}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{item.percentage.toFixed(0)}% {t('of total', 'ng kabuuan')}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('Document Type Distribution', 'Distribusyon ng Uri ng Dokumento')}</h2>
        <div className="grid gap-3">
          {typeSummary.slice(0, 8).map((item) => (
            <div key={item.type} className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.type}</p>
                  <p className="text-xs text-slate-500">{item.count} {t('documents', 'mga dokumento')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(item.revenue)}</p>
                  <p className="text-xs text-slate-500">{Math.round(item.pct)}% {t('share', 'bahagi')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t('Latest Transactions', 'Pinakabagong Transaksyon')}</h2>
            <p className="text-sm text-slate-500">{t('Recent document issuance records with revenue and status', 'Kamakailang tala ng pag-isyu ng dokumento na may kita at katayuan')}</p>
          </div>
          <div className="text-sm text-slate-500">{t('Auto-refreshes when new documents are issued', 'Awtomatikong nagre-refresh tuwing may bagong dokumento')}</div>
        </div>
        <div className="overflow-auto rounded-3xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3">{t('Date', 'Petsa')}</th>
                <th className="border-b border-slate-200 px-4 py-3">{t('Invoice', 'Invoice')}</th>
                <th className="border-b border-slate-200 px-4 py-3">{t('Document', 'Dokumento')}</th>
                <th className="border-b border-slate-200 px-4 py-3">{t('Amount', 'Halaga')}</th>
                <th className="border-b border-slate-200 px-4 py-3">{t('Status', 'Katayuan')}</th>
              </tr>
            </thead>
            <tbody>
              {latestDocuments.map((doc) => (
                <tr key={`${doc.invoice_no ?? doc.order_no ?? doc.date}-${doc.document_type}`} className="odd:bg-slate-50">
                  <td className="border-b border-slate-100 px-4 py-3">{doc.date}</td>
                  <td className="border-b border-slate-100 px-4 py-3">{doc.invoice_no || doc.order_no || '—'}</td>
                  <td className="border-b border-slate-100 px-4 py-3">{doc.document_type || '—'}</td>
                  <td className="border-b border-slate-100 px-4 py-3">{formatCurrency(doc.amount)}</td>
                  <td className="border-b border-slate-100 px-4 py-3">{doc.status || t('Unknown', 'Hindi alam')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
