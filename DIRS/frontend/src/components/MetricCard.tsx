import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  trend?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, bgColor, iconColor, trend }: MetricCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 text-white shadow-lg transition-transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
          <p className="text-xs mt-2 opacity-80">{trend || subtitle}</p>
        </div>
        <div className={`${iconColor} p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
