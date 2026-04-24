import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface RevenueData {
  month: string;
  amount: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  t: (en: string, tl: string) => string;
  range: '7' | '30' | '90';
  onRangeChange: (range: '7' | '30' | '90') => void;
}

export function RevenueChart({ data, t, range, onRangeChange }: RevenueChartProps) {
  // Safety Guard: If no data is passed, show a placeholder instead of crashing
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm h-full min-h-[350px] flex flex-col items-center justify-center border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('Revenue Trend', 'Takbo ng Kita')}</h3>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-semibold text-gray-800">{t('Revenue Trend', 'Takbo ng Kita')}</h3>
        <select
          value={range}
          onChange={(event) => onRangeChange(event.target.value as '7' | '30' | '90')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">{t('Last 7 days', 'Nakaraang 7 araw')}</option>
          <option value="30">{t('Last 30 days', 'Nakaraang 30 araw')}</option>
          <option value="90">{t('Last 90 days', 'Nakaraang 90 araw')}</option>
        </select>
      </div>

      {/* ResponsiveContainer MUST have a fixed height on its parent or it will collapse/white-screen */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Horizontal grid lines */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            
            {/* X-Axis (Months/Days) */}
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dy={10} 
            />
            
            {/* Y-Axis (Money) */}
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            
            {/* Hover Tooltip */}
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
              }}
              formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
              labelStyle={{ color: '#6B7280', fontWeight: 'bold', marginBottom: '4px' }}
            />
            
            {/* The actual shaded line area */}
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
  );
}