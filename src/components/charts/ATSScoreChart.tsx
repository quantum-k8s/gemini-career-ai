import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { AtsAnalysis } from '../../types';

interface ATSScoreChartProps {
  analyses: AtsAnalysis[];
}

export const ATSScoreChart: React.FC<ATSScoreChartProps> = ({ analyses }) => {
  // Sort analyses by date ascending
  const sorted = [...analyses].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const data = sorted.map((a, index) => {
    const dateObj = new Date(a.createdAt);
    return {
      index: index + 1,
      date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: a.overallScore,
      filename: a.resumeFilename,
      job: a.jobTitle || 'General'
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-white/5 bg-white/2 rounded-2xl text-slate-500 text-sm">
        <p>No historical analysis runs yet.</p>
        <p className="text-xs text-slate-600 mt-1">Upload and analyze a resume to see score history trends!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="rgba(255, 255, 255, 0.4)"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="rgba(255, 255, 255, 0.4)"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              color: '#fff'
            }}
            formatter={(value: any, name: any, props: any) => [
              <span className="text-cyan-400 font-bold font-mono">{value}%</span>,
              `Score (${props.payload.filename})`
            ]}
            labelFormatter={(label) => <span className="text-slate-400 text-xs block mb-1">Date: {label}</span>}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="url(#scoreColor)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#scoreColor)"
            activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: '#020617' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
