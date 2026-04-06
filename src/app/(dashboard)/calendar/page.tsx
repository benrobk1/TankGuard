'use client';

import { useState, useMemo } from 'react';
import { useFetch } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ComplianceItem {
  id: string;
  description: string;
  dueDate: string;
  status: string;
  facility: { name: string };
  tank: { tankNumber: string } | null;
}

const statusColors: Record<string, string> = {
  UPCOMING: 'bg-blue-400', DUE_SOON: 'bg-yellow-400', OVERDUE: 'bg-red-500', COMPLETED: 'bg-green-400',
};

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  UPCOMING: 'info', DUE_SOON: 'warning', OVERDUE: 'danger', COMPLETED: 'success', WAIVED: 'neutral',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: items, loading } = useFetch<{ items: ComplianceItem[] }>('/api/compliance?limit=500');

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const itemsByDate = useMemo(() => {
    const map: Record<string, ComplianceItem[]> = {};
    items?.items?.forEach(item => {
      const d = new Date(item.dueDate).toISOString().split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(item);
    });
    return map;
  }, [items]);

  const selectedItems = selectedDate ? (itemsByDate[selectedDate] || []) : [];

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
        <p className="text-gray-500 mt-1">View all compliance deadlines in calendar format</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {dayNames.map(d => (
              <div key={d} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[80px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayItems = itemsByDate[dateStr] || [];
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`bg-white min-h-[80px] p-1.5 text-left hover:bg-blue-50 transition-colors ${
                    isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayItems.slice(0, 3).map(item => (
                      <div key={item.id} className={`h-1.5 rounded-full ${statusColors[item.status] || 'bg-gray-300'}`} />
                    ))}
                    {dayItems.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{dayItems.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Upcoming</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Due Soon</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Overdue</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Completed</span>
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {selectedDate ? formatDate(selectedDate) : 'Select a date'}
          </h3>
          {!selectedDate ? (
            <p className="text-sm text-gray-500">Click a date to see compliance items due that day.</p>
          ) : selectedItems.length === 0 ? (
            <p className="text-sm text-gray-500">No items due on this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedItems.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.facility.name}{item.tank ? ` - Tank ${item.tank.tankNumber}` : ''}</p>
                  <Badge variant={statusBadge[item.status] || 'neutral'} className="mt-2">{item.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
