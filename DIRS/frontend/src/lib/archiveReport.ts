export interface ArchiveDoc {
  order_no?: string;
  invoice_no?: string;
  resident_name?: string;
  document_type?: string;
  amount?: number;
  date?: string;
  status?: string;
}

export type ExportDoc = ArchiveDoc;

export interface ArchiveItem {
  date: string;
  isoDate: string;
  amount: number;
  count: number;
}

export interface ArchiveMeta {
  range: string;
  totalTransactions: number;
  totalAmount: number;
  avgPerDay: number;
  topDocumentType: string;
}

export interface ArchiveSummary {
  count: number;
  amount: number;
}

export function getLocalISODate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildWeeklyArchive(docs: ArchiveDoc[], baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const weekMap = new Map<string, { amount: number; count: number; isoDate: string }>();

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    weekMap.set(label, { amount: 0, count: 0, isoDate: getLocalISODate(d) });
  }

  docs.forEach((doc) => {
    const parsed = new Date(doc.date || '');
    if (Number.isNaN(parsed.getTime())) return;
    const label = parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    if (weekMap.has(label)) {
      const existing = weekMap.get(label)!;
      existing.count += 1;
      existing.amount += Number(doc.amount || 0);
      weekMap.set(label, existing);
    }
  });

  const archiveItems: ArchiveItem[] = Array.from(weekMap.entries()).map(([date, data]) => ({ date, isoDate: data.isoDate, amount: data.amount, count: data.count }));
  const totalAmount = archiveItems.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = archiveItems.reduce((sum, item) => sum + item.count, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekDocs = docs.filter((doc) => {
    const parsed = new Date(doc.date || '');
    return parsed >= start && parsed <= end;
  });

  const typeCounts = weekDocs.reduce((acc: Record<string, number>, doc) => {
    const type = doc.document_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  const range = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  const archiveMeta: ArchiveMeta = {
    range,
    totalTransactions,
    totalAmount,
    avgPerDay: totalAmount / 7,
    topDocumentType: topType ? `${topType[0]} (${topType[1]})` : 'N/A'
  };

  const selectedDate = getLocalISODate(start);
  const selectedSummary = getDateSummary(docs, selectedDate);

  return { archiveItems, archiveMeta, selectedDate, selectedSummary };
}

export function getDateSummary(docs: ArchiveDoc[], dateStr: string): ArchiveSummary {
  const filterDate = new Date(dateStr);
  if (Number.isNaN(filterDate.getTime())) {
    return { count: docs.length, amount: docs.reduce((sum, d) => sum + Number(d.amount || 0), 0) };
  }

  const matching = docs.filter((d) => {
    const docDate = new Date(d.date || '');
    if (Number.isNaN(docDate.getTime())) return false;
    return getLocalISODate(docDate) === getLocalISODate(filterDate);
  });

  return {
    count: matching.length,
    amount: matching.reduce((sum, d) => sum + Number(d.amount || 0), 0)
  };
}

export interface DailyReport {
  date: string;
  docs: ArchiveDoc[];
  summary: ArchiveSummary;
  byType: Record<string, number>;
}

export async function fetchDocumentsByDate(dateStr: string): Promise<ArchiveDoc[]> {
  const res = await fetch(`/api/documents?date=${encodeURIComponent(dateStr)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch documents for selected date');
  }
  const result = await res.json();
  return Array.isArray(result.data) ? result.data : [];
}

export function buildDailyReport(docs: ArchiveDoc[], dateStr: string): DailyReport {
  const summary = getDateSummary(docs, dateStr);
  const byType = docs.reduce((acc: Record<string, number>, doc) => {
    const type = doc.document_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { date: dateStr, docs, summary, byType };
}

export async function fetchDailyReport(dateStr: string): Promise<DailyReport> {
  const docs = await fetchDocumentsByDate(dateStr);
  return buildDailyReport(docs, dateStr);
}

export function printDailyTransactionReport(docs: ExportDoc[], reportTitle = 'Daily Transaction Report', footerText = "Generated from Barangay DIRS Revenue page (today's transactions from DB).") {
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) return;

  const rows = docs
    .map((doc) => `
      <tr>
        <td style="padding: 6px; border: 1px solid #d6d6d6; font-size: 11px;">${doc.invoice_no || doc.order_no || ''}</td>
        <td style="padding: 6px; border: 1px solid #d6d6d6; font-size: 11px;">${doc.resident_name || ''}</td>
        <td style="padding: 6px; border: 1px solid #d6d6d6; font-size: 11px;">${doc.document_type || ''}</td>
        <td style="padding: 6px; border: 1px solid #d6d6d6; font-size: 11px;">₱${Number(doc.amount || 0).toFixed(2)}</td>
        <td style="padding: 6px; border: 1px solid #d6d6d6; font-size: 11px;">${doc.date || ''}</td>
        <td style="padding: 6px; border: 1px solid #d6d6d6; font-size: 11px;">${doc.status || ''}</td>
      </tr>
    `)
    .join('');

  const totalRevenue = docs.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  reportWindow.document.write(`
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #fff; }
          @page { size: A4 portrait; margin: 10mm; }
          .page { width: 190mm; min-height: 277mm; margin: auto; background: white; }
          .pad { padding: 18px 24px; }
          .header { display: flex; align-items: center; margin-bottom: 8px; }
          .logo { width: 54px; height: 54px; object-fit: contain; margin-right: 16px; }
          .title { flex: 1; text-align: center; }
          .title h1 { margin: 0; font-size: 20px; color: #226622; font-weight: bold; }
          .title p { margin: 0; font-size: 12px; color: #226622; }
          .title .subtitle { font-size: 11px; color: #444; margin-top: 2px; }
          .date-time-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .date-time-row .date { font-size: 12px; color: #222; }
          .date-time-row .report-title { font-size: 12px; color: #222; font-weight: 500; }
          .green-line { border-top: 2px solid #226622; margin: 8px 0 12px 0; }
          .info { font-size: 12px; margin-bottom: 8px; }
          .info strong { color: #226622; }
          .section-title { margin-top: 10px; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #226622; text-transform: uppercase; letter-spacing: 0.3px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
          th, td { border: 1px solid #d6d6d6; padding: 6px 8px; }
          th { background: #eaf6ea; font-weight: 700; text-align: left; color: #226622; }
          .footer { margin-top: 12px; font-size: 11px; color: #444; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="pad">
            <div class="date-time-row">
              <span class="date">${dateStr}, ${timeStr}</span>
              <span class="report-title">${reportTitle}</span>
            </div>
            <div class="header">
              <img src="/logo.png" class="logo" alt="Brgy Logo" />
              <div class="title">
                <h1>Barangay 166 Caybiga</h1>
                <p>Zone 15 District 1 Caloocan City</p>
                <div class="subtitle">Daily Transaction Report</div>
              </div>
            </div>
            <div class="green-line"></div>
            <div class="info">
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Total Transactions:</strong> ${docs.length}</p>
              <p><strong>Total Amount:</strong> ₱${totalRevenue.toLocaleString()}</p>
            </div>
            <div class="section-title">Transaction List</div>
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Resident</th>
                  <th>Document</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="6" style="text-align:center; padding: 12px;">No transactions for selected range.</td></tr>'}
              </tbody>
            </table>
            <div class="footer">${footerText}</div>
          </div>
        </div>
      </body>
    </html>
  `);

  reportWindow.document.close();
  reportWindow.print();
}
