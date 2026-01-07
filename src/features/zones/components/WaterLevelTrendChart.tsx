'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from 'recharts';

export type WaterLevelTrendChartProps = {
  currentLevel?: number;
  isRising?: boolean;
};

// Generate mock trend data
const generateTrendData = () => [
  { time: '-1h', value: 0.3, type: 'past' },
  { time: 'Hiện tại', value: 0.5, type: 'current' },
  { time: '+1h', value: 0.8, type: 'forecast' },
  { time: '+2h', value: 1.1, type: 'forecast' }
];

export function WaterLevelTrendChart({
  currentLevel = 0.5,
  isRising = true
}: WaterLevelTrendChartProps) {
  const trendData = useMemo(() => generateTrendData(), []);

  return (
    <div className='h-28 w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={trendData}>
          <XAxis
            dataKey='time'
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Bar dataKey='value' radius={[4, 4, 4, 4]} barSize={8}>
            {trendData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.type === 'current'
                    ? '#3b82f6'
                    : entry.type === 'forecast'
                      ? '#ef4444'
                      : '#e2e8f0'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
