import React from 'react';
import { BarChart, Bar, Cell, XAxis, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  label: string;
}

interface ArabicStatsChartProps {
  data?: ChartDataPoint[];
}

export default function ArabicStatsChart({ data: propData }: ArabicStatsChartProps) {
  const defaultData = [
    { name: 'النطق', value: 0, color: '#FF9800', label: '0%' },
    { name: 'الطلاقة', value: 0, color: '#D05872', label: '0%' },
    { name: 'الدقة', value: 0, color: '#8BD9B7', label: '0%' }
  ];

  const data = propData || defaultData;

  return (
    <div className="flex bg-white h-full" dir="rtl">
      <div className="w-full p-4 flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 6 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#333', fontSize: 14, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickMargin={12}
                padding={{ left: 0, right: 8 }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40} >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-12">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div
                className="text-[18px] font-bold"
                style={{ color: item.color }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}