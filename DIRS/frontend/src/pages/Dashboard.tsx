import { useEffect, useMemo, useState } from 'react';
import { getLocalISODate } from '../lib/dateUtils';
import { MetricCard } from '../components/MetricCard';
import { RevenueChart } from '../components/RevenueChart';
import { ActivityFeed } from '../components/ActivityFeed';
import { DocumentDistribution } from '../components/DocumentDistribution';
import { TransactionHistory } from '../components/TransactionHistory';
import { FileText, DollarSign, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
// 1. Import the language hook
import { useLanguage } from '../context/LanguageContext';

interface DashboardStats {
  totalDocuments: number;
  revenueToday: number;
  revenueThisMonth: number;
  processedRequests: number;
}

export function Dashboard() {
  // 2. Access the translation helper
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    processedRequests: 0
  });
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  const [distributionView, setDistributionView] = useState<'daily' | 'weekly' | 'all'>('weekly');
  const [revenueRange, setRevenueRange] = useState<'7' | '30' | '90'>('7');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [processorName, setProcessorName] = useState('admin1');
  const [trendText, setTrendText] = useState({ docs: '+0% from last month', revenue: '+0% from yesterday', processed: '+0% Issued Document Yesterday' });

  useEffect(() => {
    setProcessorName('admin1');
    loadDashboardData();

    const handleDocumentsUpdated = () => loadDashboardData();
    const handleFocus = () => loadDashboardData();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'documentsUpdatedAt' && event.newValue) {
        loadDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('documentsUpdated', handleDocumentsUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('documentsUpdated', handleDocumentsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/documents?all=true');
      if (!res.ok) throw new Error('Failed to load documents');
      const payload = await res.json();
      const docs = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.documents)
            ? payload.documents
            : [];
      const docsArray = Array.isArray(docs)
        ? docs.map((doc: any) => ({
            ...doc,
            date: doc.date || (doc.createdAt ? getLocalISODate(new Date(doc.createdAt)) : ''),
          }))
        : [];

      const totalDocuments = docsArray.length;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const parseDay = (d: string) => {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return null;
        return getLocalISODate(dt);
      };

      const todayStr = getLocalISODate(today);
      const yesterdayStr = getLocalISODate(yesterday);
      const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const lastMonthDate = new Date(today);
      lastMonthDate.setMonth(today.getMonth() - 1);
      const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

      let revenueToday = 0;
      let revenueYesterday = 0;
      let revenueThisMonth = 0;
      let revenueLastMonth = 0;
      let docsThisMonth = 0;
      let docsLastMonth = 0;

      docsArray.forEach((doc: any) => {
        const d = parseDay(doc.date || '');
        if (!d) return;

        const amount = Number(doc.amount || 0);
        if (d === todayStr) revenueToday += amount;
        if (d === yesterdayStr) revenueYesterday += amount;

        if (d.startsWith(thisMonth)) {
          revenueThisMonth += amount;
          docsThisMonth += 1;
        }
        if (d.startsWith(lastMonth)) {
          revenueLastMonth += amount;
          docsLastMonth += 1;
        }
      });

      const revenueFromYesterday = revenueYesterday === 0 ? 0 : ((revenueToday - revenueYesterday) / Math.max(1, revenueYesterday)) * 100;
      const docsFromLastMonth = docsLastMonth === 0 ? 0 : ((docsThisMonth - docsLastMonth) / Math.max(1, docsLastMonth)) * 100;
      const processedThisMonth = docsArray.filter((doc: any) => doc.status?.toLowerCase() === 'completed' && parseDay(doc.date || '')?.startsWith(thisMonth)).length;
      const processedLastMonth = docsArray.filter((doc: any) => doc.status?.toLowerCase() === 'completed' && parseDay(doc.date || '')?.startsWith(lastMonth)).length;
      const processedToday = docsArray.filter((doc: any) => doc.status?.toLowerCase() === 'completed' && parseDay(doc.date || '') === todayStr).length;
      const processedYesterday = docsArray.filter((doc: any) => doc.status?.toLowerCase() === 'completed' && parseDay(doc.date || '') === yesterdayStr).length;
      const processedFromYesterday = processedYesterday === 0 ? 0 : ((processedToday - processedYesterday) / Math.max(1, processedYesterday)) * 100;
      const processed = docsArray.filter((doc: any) => doc.status?.toLowerCase() === 'completed').length;

      setStats({
        totalDocuments,
        revenueToday,
        revenueThisMonth,
        processedRequests: processedToday
      });

      setTrendText({
        docs: `${docsFromLastMonth >= 0 ? '+' : ''}${docsFromLastMonth.toFixed(0)}% ${t('from last month', 'mula nakaraang buwan')}`,
        revenue: `${revenueFromYesterday >= 0 ? '+' : ''}${revenueFromYesterday.toFixed(0)}% ${t('from yesterday', 'mula kahapon')}`,
        processed: `${processedFromYesterday >= 0 ? '+' : ''}${processedFromYesterday.toFixed(0)}% ${t('Issued Document Yesterday', 'Naibigay na Dokumento Kahapon')}`
      });

      setAllDocuments(docsArray);

      setActivities(docsArray.slice(0, 4).map((doc: any, idx: number) => ({
        id: idx + 1,
        type: 'info',
        user: doc.processed_by || 'System',
        description: `${doc.resident_name || 'Resident'} requested ${doc.document_type}`,
        timestamp: doc.date && doc.time ? `${doc.date} ${doc.time}` : doc.date || 'today'
      })));

      setTransactions(docsArray.map((doc: any) => ({
        id: doc._id || doc.order_no || String(Math.random()),
        invoice_no: doc.invoice_no || '',
        resident_name: doc.resident_name || '',
        document_type: doc.document_type || '',
        amount: Number(doc.amount || 0),
        date: doc.date || '',
        time: doc.time || '',
        status: doc.status || '',
        processed_by: doc.processed_by || ''
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseDay = (d: string) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return getLocalISODate(dt);
  };

  const buildDocumentStats = (docs: any[], view: 'daily' | 'weekly' | 'all') => {
    const today = new Date();
    const todayStr = getLocalISODate(today);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    const weekStartStr = getLocalISODate(weekStart);

    const filteredDocs = docs.filter((doc: any) => {
      const day = parseDay(doc.date || '');
      if (!day) return false;
      if (view === 'all') return true;
      if (view === 'weekly') return day >= weekStartStr && day <= todayStr;
      return day === todayStr;
    });

    const distribution = filteredDocs.reduce((acc: Record<string, number>, doc: any) => {
      const type = doc.document_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const total = filteredDocs.length;

    return Object.entries(distribution)
      .map(([name, count], idx) => ({
        name,
        count,
        color: ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][idx % 6],
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const documentStats = useMemo(
    () => buildDocumentStats(allDocuments, distributionView),
    [allDocuments, distributionView]
  );

  const buildRevenueData = (docs: any[], days: number) => {
    const map = new Map<string, number>();
    const labels: string[] = [];
    const now = new Date();
    const labelFormatter = new Intl.DateTimeFormat('en-US', {
      month: days > 7 ? 'short' : undefined,
      day: 'numeric',
      weekday: days <= 7 ? 'short' : undefined,
    });

    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = getLocalISODate(d);
      const label = labelFormatter.format(d);
      labels.push(label);
      map.set(key, 0);
    }

    docs.forEach((doc) => {
      const dateLabel = parseDay(doc.date);
      if (!dateLabel) return;
      if (!map.has(dateLabel)) return;
      map.set(dateLabel, map.get(dateLabel)! + Number(doc.amount || 0));
    });

    return Array.from(map.entries()).map(([dateKey, amount]) => ({
      month: labelFormatter.format(new Date(`${dateKey}T00:00:00`)),
      amount,
    }));
  };

  const revenueData = useMemo(
    () => buildRevenueData(allDocuments, Number(revenueRange)),
    [allDocuments, revenueRange]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading dashboard...', 'Kinukuha ang dashboard...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('Dashboard', 'Dashboard')}</h1>
          <p className="text-gray-500 mt-1">{t("Welcome back! Here's what's happening today.", "Maligayang pagbabalik! Narito ang mga kaganapan ngayong araw.")}</p>
          <p className="text-xs text-indigo-700 font-bold mt-1 uppercase tracking-[0.2em]">{t('Logged in as', 'Naka-log in bilang')}: {processorName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadDashboardData}
            className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 font-semibold uppercase tracking-wide text-xs hover:bg-blue-50 transition"
          >
            {t('Refresh', 'I-refresh')}
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black uppercase tracking-wide text-xs hover:bg-blue-700 transition"
          >
            {t('Transaction History', 'Kasaysayan ng Transaksyon')}
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t("Total Documents Issued", "Kabuuang Dokumentong Naibigay")}
          value={stats.totalDocuments}
          subtitle={t("Documents completed", "Mga tapos na dokumento")}
          trend={trendText.docs}
          icon={FileText}
          bgColor="bg-blue-600" 
          iconColor="text-white"
        />
        <MetricCard
          title={t("Revenue Collected Today", "Nakolektang Kita Ngayong Araw")}
          value={`₱ ${stats.revenueToday.toLocaleString()}`}
          subtitle={t("Today's earnings", "Kita ngayong araw")}
          trend={trendText.revenue}
          icon={DollarSign}
          bgColor="bg-emerald-600"
          iconColor="text-white"
        />
        <MetricCard
          title={t("Revenue This Month", "Kita Ngayong Buwan")}
          value={`₱ ${stats.revenueThisMonth.toLocaleString()}`}
          subtitle={t("Current monthly total", "Kabuuang buwan")}
          trend={trendText.revenue}
          icon={DollarSign}
          bgColor="bg-emerald-500"
          iconColor="text-white"
        />
        <MetricCard
          title={t("Document Issued Today", "Dokumentong Naibigay Ngayon")}
          value={stats.processedRequests}
          subtitle={t("Successfully issued", "Matagumpay na naibigay")}
          trend={trendText.processed}
          icon={CheckCircle}
          bgColor="bg-indigo-600"
          iconColor="text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{t('Total Revenue', 'Kabuuang Kita')}</p>
              <p className="mt-3 text-2xl font-black text-gray-900">₱{allDocuments.reduce((sum, doc) => sum + Number(doc.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-blue-500 p-3 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t('Revenue from all issued documents', 'Kita mula sa lahat ng na-isyu na dokumento')}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{t('Avg Revenue / Document', 'Average Kita / Dokumento')}</p>
              <p className="mt-3 text-2xl font-black text-gray-900">₱{(allDocuments.length > 0 ? allDocuments.reduce((sum, doc) => sum + Number(doc.amount || 0), 0) / allDocuments.length : 0).toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500 p-3 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t('Average revenue per document', 'Average na kita bawat dokumento')}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{t('Revenue This Week', 'Kita Ngayong Linggo')}</p>
              <p className="mt-3 text-2xl font-black text-gray-900">₱{(() => {
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - 6);
                return allDocuments.filter(doc => {
                  const docDate = new Date(doc.date || '');
                  return docDate >= weekStart && docDate <= new Date();
                }).reduce((sum, doc) => sum + Number(doc.amount || 0), 0).toLocaleString();
              })()}</p>
            </div>
            <div className="rounded-2xl bg-purple-500 p-3 text-white">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t('Revenue for the current week', 'Kita para sa kasalukuyang linggo')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueData}
            t={t}
            range={revenueRange}
            onRangeChange={setRevenueRange}
          />
        </div>
        <div>
          <ActivityFeed activities={activities} t={t} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DocumentDistribution
            data={documentStats}
            t={t}
            view={distributionView}
            onViewChange={setDistributionView}
          />
        </div>
      </div>

      <TransactionHistory
        open={showHistory}
        onClose={() => setShowHistory(false)}
        transactions={transactions}
        processorName={processorName || 'Unknown Processor'}
      />

    </div>
  );
}