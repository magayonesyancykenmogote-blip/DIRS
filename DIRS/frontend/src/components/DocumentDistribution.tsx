import { useState } from 'react';

interface DocumentStats {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

interface DocumentDistributionProps {
  data: DocumentStats[];
  t: (en: string, tl: string) => string;
  view: 'daily' | 'weekly' | 'all';
  onViewChange: (view: 'daily' | 'weekly' | 'all') => void;
}

export function DocumentDistribution({ data, t, view, onViewChange }: DocumentDistributionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const innerRadius = 45;

  let currentAngle = -90;

  const segments = data.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const innerX1 = center + innerRadius * Math.cos(startRad);
    const innerY1 = center + innerRadius * Math.sin(startRad);
    const innerX2 = center + innerRadius * Math.cos(endRad);
    const innerY2 = center + innerRadius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${innerX2} ${innerY2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1}`,
      'Z'
    ].join(' ');

    return {
      path,
      ...item,
      percentage,
      index
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('Document Type Distribution', 'Distribusyon ng Uri ng Dokumento')}</h3>
        <div className="flex items-center gap-2">
          {[
            { key: 'daily', label: t('Daily', 'Araw-araw') },
            { key: 'weekly', label: t('Weekly', 'Lingguhan') },
            { key: 'all', label: t('All Time', 'Lahat ng Oras') }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onViewChange(option.key as 'daily' | 'weekly' | 'all')}
              className={`px-3 py-1.5 text-sm rounded-full border transition ${
                view === option.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                opacity={hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.3}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-opacity duration-200"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-3xl font-bold text-gray-800">{total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                hoveredIndex === index ? 'bg-gray-50' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{item.count}</p>
                <p className="text-xs text-gray-500">{item.percentage.toFixed(0)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
