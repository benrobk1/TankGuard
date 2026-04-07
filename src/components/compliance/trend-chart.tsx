'use client';

import { useFetch } from '@/lib/hooks';

interface TrendPoint {
  date: string;
  score: number;
  total: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  upcoming: number;
}

interface TrendData {
  trend: TrendPoint[];
}

function formatDateShort(d: string) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

export function ComplianceTrendChart({ facilityId }: { facilityId?: string }) {
  const url = facilityId
    ? `/api/compliance/trend?facilityId=${facilityId}`
    : '/api/compliance/trend';

  const { data, loading, error } = useFetch<TrendData>(url);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data || data.trend.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trend</h2>
        <p className="text-sm text-gray-500 text-center py-8">
          {error ? 'Unable to load trend data' : 'Trend data will appear after daily snapshots begin recording.'}
        </p>
      </div>
    );
  }

  const { trend } = data;
  const maxScore = 100;
  const chartHeight = 200;
  const chartWidth = 100; // percentage
  const pointSpacing = trend.length > 1 ? chartWidth / (trend.length - 1) : 0;

  // Calculate SVG path for the score line
  const points = trend.map((p, i) => ({
    x: trend.length === 1 ? 50 : (i / (trend.length - 1)) * 100,
    y: chartHeight - (p.score / maxScore) * chartHeight,
    ...p,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  // Latest stats
  const latest = trend[trend.length - 1];
  const previous = trend.length > 1 ? trend[trend.length - 2] : null;
  const scoreDelta = previous ? latest.score - previous.score : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Compliance Trend</h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: getScoreColor(latest.score) }}>
            {latest.score}%
          </span>
          {scoreDelta !== 0 && (
            <span className={`text-sm font-medium ${scoreDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {scoreDelta > 0 ? '+' : ''}{scoreDelta}%
            </span>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg viewBox={`0 0 100 ${chartHeight}`} className="w-full h-48" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <line
              key={pct}
              x1="0"
              y1={chartHeight - (pct / 100) * chartHeight}
              x2="100"
              y2={chartHeight - (pct / 100) * chartHeight}
              stroke="#f3f4f6"
              strokeWidth="0.5"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#trendGradient)" opacity="0.3" />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={getScoreColor(latest.score)} />
              <stop offset="100%" stopColor={getScoreColor(latest.score)} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Score line */}
          <path d={linePath} fill="none" stroke={getScoreColor(latest.score)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={getScoreColor(p.score)} />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-1">
          {trend.length <= 10
            ? trend.map((p, i) => (
                <span key={i} className="text-xs text-gray-400">{formatDateShort(p.date)}</span>
              ))
            : [0, Math.floor(trend.length / 4), Math.floor(trend.length / 2), Math.floor((3 * trend.length) / 4), trend.length - 1].map((idx) => (
                <span key={idx} className="text-xs text-gray-400">{formatDateShort(trend[idx].date)}</span>
              ))
          }
        </div>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-sm font-semibold text-green-600">{latest.completed}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Due Soon</p>
          <p className="text-sm font-semibold text-yellow-600">{latest.dueSoon}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-sm font-semibold text-red-600">{latest.overdue}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Upcoming</p>
          <p className="text-sm font-semibold text-gray-600">{latest.upcoming}</p>
        </div>
      </div>
    </div>
  );
}
