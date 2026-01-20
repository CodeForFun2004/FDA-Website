'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Info
} from 'lucide-react';
import { FloodTrendDto } from '../mock';

interface FloodHeatmapProps {
  trendData: FloodTrendDto | null;
  isLoading?: boolean;
}

interface HeatmapCell {
  date: string;
  month: number;
  day: number;
  level: number;
  floodHours: number;
  intensity: number; // 0-4 scale based on severity
}

export function FloodHeatmap({ trendData, isLoading }: FloodHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { heatmapData, monthLabels } = useMemo(() => {
    if (!trendData?.dataPoints) {
      return { heatmapData: [], monthLabels: [] };
    }

    const formatDateLocal = (date: Date) => {
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      return `${yearStr}-${monthStr}-${dayStr}`;
    };

    const yearData = new Map<string, HeatmapCell>();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    for (
      let d = new Date(startOfYear);
      d <= endOfYear;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = formatDateLocal(d);
      yearData.set(dateStr, {
        date: dateStr,
        month: d.getMonth(),
        day: d.getDate(),
        level: 0,
        floodHours: 0,
        intensity: 0
      });
    }

    trendData.dataPoints.forEach((point) => {
      const date = new Date(point.periodStart);
      const dateStr = formatDateLocal(date);

      if (yearData.has(dateStr)) {
        const intensity =
          point.floodHours > 12
            ? 4
            : point.floodHours > 6
              ? 3
              : point.floodHours > 2
                ? 2
                : point.floodHours > 0
                  ? 1
                  : 0;

        yearData.set(dateStr, {
          date: dateStr,
          month: date.getMonth(),
          day: date.getDate(),
          level: point.maxLevel,
          floodHours: point.floodHours,
          intensity
        });
      }
    });

    const allDays = Array.from(yearData.values()).sort(
      (a, b) =>
        new Date(year, a.month, a.day).getTime() -
        new Date(year, b.month, b.day).getTime()
    );

    const weeks: (HeatmapCell | null)[][] = [];
    const getWeekdayIndex = (date: Date) => {
      const day = date.getDay();
      return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
    };

    const firstWeekday = getWeekdayIndex(
      new Date(year, allDays[0].month, allDays[0].day)
    );
    let currentWeek: (HeatmapCell | null)[] = new Array(7).fill(null);
    allDays.forEach((cell) => {
      const date = new Date(year, cell.month, cell.day);
      const dayIndex = getWeekdayIndex(date);

      if (dayIndex === 0 && currentWeek.some((c) => c !== null)) {
        weeks.push([...currentWeek]);
        currentWeek = new Array(7).fill(null);
      }
      currentWeek[dayIndex] = cell;
    });

    if (currentWeek.some((c) => c !== null)) {
      weeks.push([...currentWeek]);
    }

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    allDays.forEach((cell, index) => {
      const weekIdx = Math.floor((index + firstWeekday) / 7);
      if (cell.month !== lastMonth) {
        labels.push({ month: monthNames[cell.month], weekIndex: weekIdx });
        lastMonth = cell.month;
      }
    });

    return { heatmapData: weeks, monthLabels: labels };
  }, [trendData, year]);

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'bg-slate-100 hover:bg-slate-200';
      case 1:
        return 'bg-blue-100 hover:bg-blue-200';
      case 2:
        return 'bg-blue-300 hover:bg-blue-400';
      case 3:
        return 'bg-blue-500 hover:bg-blue-600';
      case 4:
        return 'bg-blue-700 hover:bg-blue-800 shadow-sm shadow-blue-200';
      default:
        return 'bg-slate-100 hover:bg-slate-200';
    }
  };

  const getIntensityLabel = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'No Recorded Flooding';
      case 1:
        return 'Light Hydrological Activity';
      case 2:
        return 'Moderate Inundation';
      case 3:
        return 'High Risk Flooding';
      case 4:
        return 'Severe Emergency Levels';
      default:
        return 'Data Pending';
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-[400px] animate-pulse items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm'>
        <div className='flex flex-col items-center gap-3 text-slate-400'>
          <Droplets className='h-8 w-8 animate-bounce' />
          <span className='font-medium'>
            Synthesizing hydrological model...
          </span>
        </div>
      </div>
    );
  }

  if (!trendData || !heatmapData.length) {
    return (
      <div className='flex h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-slate-400 shadow-sm'>
        No heatmap data available
      </div>
    );
  }

  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
      <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h2 className='flex items-center gap-2 text-xl font-bold text-slate-900'>
            <Calendar className='h-5 w-5 text-blue-600' />
            Annual Flood Pattern
          </h2>
          <p className='mt-0.5 text-sm text-slate-500'>
            High-resolution daily tracking for {year}
          </p>
        </div>
        <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5'>
          <button
            onClick={() => setYear((prev) => prev - 1)}
            className='rounded-lg p-1.5 transition-all hover:bg-white hover:shadow-sm'
          >
            <ChevronLeft className='h-4 w-4 text-slate-600' />
          </button>
          <span className='px-4 text-sm font-bold text-slate-700'>{year}</span>
          <button
            onClick={() => setYear((prev) => prev + 1)}
            className='rounded-lg p-1.5 transition-all hover:bg-white hover:shadow-sm'
          >
            <ChevronRight className='h-4 w-4 text-slate-600' />
          </button>
        </div>
      </div>

      <div className='flex flex-col space-y-4'>
        {/* Statistics Bar */}
        <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1.5'>
              <span className='text-xs font-semibold text-slate-500'>
                Intensity:
              </span>
              <div className='flex gap-1'>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-sm ${getIntensityColor(i)}`}
                    title={getIntensityLabel(i)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 text-xs font-medium text-slate-400'>
            <Info className='h-3.5 w-3.5' />
            Hover cells for detailed day analysis
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className='custom-scrollbar overflow-x-auto pb-4'>
          <div className='inline-flex gap-3'>
            {/* Days of week labels */}
            <div className='flex flex-col justify-start gap-[3px] pt-7'>
              {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((day, idx) => (
                <div
                  key={idx}
                  className='flex h-3 items-center text-[10px] leading-none font-bold text-slate-300 uppercase'
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid system */}
            <div className='relative'>
              {/* Month labels */}
              <div className='relative mb-1 flex h-6'>
                {monthLabels.map((label, idx) => (
                  <div
                    key={idx}
                    className='absolute text-[11px] font-bold tracking-tight text-slate-400 uppercase'
                    style={{ left: `${label.weekIndex * 15}px` }}
                  >
                    {label.month}
                  </div>
                ))}
              </div>

              {/* Cells */}
              <div className='flex gap-[3px]'>
                {heatmapData.map((week, weekIdx) => (
                  <div key={weekIdx} className='flex flex-col gap-[3px]'>
                    {week.map((cell, dayIdx) => (
                      <div
                        key={dayIdx}
                        onMouseEnter={() => cell && setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-3 w-3 cursor-crosshair rounded-[2px] transition-all duration-200 ${cell ? getIntensityColor(cell.intensity) : 'bg-transparent'} ${hoveredCell?.date === cell?.date ? 'z-10 scale-150 ring-2 ring-blue-500' : ''}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className='mt-8 overflow-hidden transition-all duration-300'>
        {hoveredCell ? (
          <div className='animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:flex-row'>
            <div className='mb-4 flex items-center gap-4 sm:mb-0'>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${getIntensityColor(hoveredCell.intensity)}`}
              >
                <Droplets className='h-6 w-6 text-white' />
              </div>
              <div>
                <p className='text-xs font-bold tracking-widest text-blue-600 uppercase'>
                  {new Date(hoveredCell.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <h4 className='text-lg font-bold text-slate-900'>
                  {getIntensityLabel(hoveredCell.intensity)}
                </h4>
              </div>
            </div>
            <div className='flex gap-8'>
              <div className='text-center'>
                <p className='text-[10px] font-bold text-slate-400 uppercase'>
                  Duration
                </p>
                <p className='text-xl font-black text-slate-800'>
                  {hoveredCell.floodHours}
                  <span className='ml-0.5 text-sm font-medium'>hrs</span>
                </p>
              </div>
              <div className='text-center'>
                <p className='text-[10px] font-bold text-slate-400 uppercase'>
                  Max Level
                </p>
                <p className='text-xl font-black text-slate-800'>
                  {hoveredCell.level}
                  <span className='ml-0.5 text-sm font-medium'>cm</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-400 italic'>
            Select a specific date on the heatmap to view detailed hydrological
            metrics
          </div>
        )}
      </div>
    </div>
  );
}
