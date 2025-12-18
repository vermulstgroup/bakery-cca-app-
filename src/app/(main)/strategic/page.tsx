"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS, BAKERIES, getProductMargin, getProductMarginPercent } from '@/lib/data';
import { formatUGX } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import type { WeeklyData } from '@/lib/types';

// Generate demo data for 12 weeks
const generateDemoData = (): WeeklyData[] => {
  const data: WeeklyData[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    const weekNum = 12 - i;

    // Simulate realistic bakery data with some variance
    const baseProduction = 15 + Math.random() * 10;
    const salesRate = 0.75 + Math.random() * 0.2;

    const production = Math.round(baseProduction * 9300);
    const sales = Math.round(production * salesRate);
    const costs = Math.round(baseProduction * 5200);
    const profit = sales - costs;

    data.push({
      week: `W${weekNum}`,
      date: date.toISOString().split('T')[0],
      production,
      sales,
      costs,
      profit,
      margin: ((profit / sales) * 100).toFixed(1)
    });
  }
  return data;
};

export default function StrategicDashboard() {
  const router = useRouter();
  const { data: onboardingData } = useOnboarding();
  const [bakery, setBakery] = useState(onboardingData.bakery || 'morulem');
  const [data, setData] = useState<WeeklyData[]>([]);
  const [view, setView] = useState<'overview' | 'trends' | 'products'>('overview');
  const [loading, setLoading] = useState(true);

  const currentBakery = BAKERIES.find(b => b.id === bakery);

  useEffect(() => {
    // Load or generate demo data
    const loadData = async () => {
      setLoading(true);
      try {
        const storageKey = `biss-strategic-${bakery}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setData(JSON.parse(stored));
        } else {
          const demoData = generateDemoData();
          setData(demoData);
          localStorage.setItem(storageKey, JSON.stringify(demoData));
        }
      } catch {
        setData(generateDemoData());
      }
      setLoading(false);
    };
    loadData();
  }, [bakery]);

  const latestWeek = data[data.length - 1] || {} as WeeklyData;
  const previousWeek = data[data.length - 2] || {} as WeeklyData;

  const totalSales = data.reduce((sum, w) => sum + w.sales, 0);
  const totalProfit = data.reduce((sum, w) => sum + w.profit, 0);
  const avgMargin = data.length > 0
    ? (data.reduce((sum, w) => sum + parseFloat(w.margin), 0) / data.length).toFixed(1)
    : '0';

  const salesChange = previousWeek.sales
    ? (((latestWeek.sales - previousWeek.sales) / previousWeek.sales) * 100).toFixed(1)
    : '0';
  const profitChange = previousWeek.profit
    ? (((latestWeek.profit - previousWeek.profit) / previousWeek.profit) * 100).toFixed(1)
    : '0';

  const exportData = () => {
    const csv = [
      ['Week', 'Date', 'Production (UGX)', 'Sales (UGX)', 'Costs (UGX)', 'Profit (UGX)', 'Margin (%)'],
      ...data.map(w => [w.week, w.date, w.production, w.sales, w.costs, w.profit, w.margin])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBakery?.name || bakery}-12week-report.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-blue-400">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/welcome')}
              className="mb-2 -ml-2 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Change Role
            </Button>
            <h1 className="text-2xl font-bold text-blue-400">📊 BISS Strategic Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={bakery}
                onChange={(e) => setBakery(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
              >
                {BAKERIES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <span className="text-slate-400 text-sm">• 12 Week View</span>
            </div>
          </div>
          <Button
            onClick={exportData}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">This Week Sales</div>
            <div className="text-2xl font-bold text-green-400 font-currency">
              {formatUGX(latestWeek.sales || 0)}
            </div>
            <div className={`text-sm ${parseFloat(salesChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {parseFloat(salesChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(salesChange))}% vs last week
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">This Week Profit</div>
            <div className={`text-2xl font-bold font-currency ${(latestWeek.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatUGX(latestWeek.profit || 0)}
            </div>
            <div className={`text-sm ${parseFloat(profitChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {parseFloat(profitChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(profitChange))}% vs last week
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">12-Week Total</div>
            <div className="text-2xl font-bold text-blue-400 font-currency">{formatUGX(totalSales)}</div>
            <div className="text-sm text-slate-500">Total Sales</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Avg Margin</div>
            <div className="text-2xl font-bold text-amber-400">{avgMargin}%</div>
            <div className="text-sm text-slate-500">Profit Margin</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          {(['overview', 'trends', 'products'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                view === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Chart */}
        {view === 'overview' && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-4">Sales vs Profit (12 Weeks)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number) => [formatUGX(value), '']}
                />
                <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trends Chart */}
        {view === 'trends' && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-4">Profit Margin Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number) => [value + '%', 'Margin']}
                />
                <Bar dataKey="margin" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Products View */}
        {view === 'products' && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-4">Product Reference Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Revenue/kg</th>
                    <th className="pb-3">Cost/kg</th>
                    <th className="pb-3">Margin/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map(p => (
                    <tr key={p.id} className="border-b border-slate-700">
                      <td className="py-3">
                        <span className="mr-2">{p.emoji}</span>
                        {p.name}
                      </td>
                      <td className="py-3 text-green-400 font-currency">{formatUGX(p.revenuePerKgFlour)}</td>
                      <td className="py-3 text-red-400 font-currency">{formatUGX(p.costPerKgFlour)}</td>
                      <td className="py-3 text-amber-400">
                        <span className="font-currency">{formatUGX(getProductMargin(p))}</span>
                        <span className="text-slate-500 text-sm ml-1">
                          ({getProductMarginPercent(p)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weekly Data Table */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold mb-4">Weekly Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-2">Week</th>
                  <th className="pb-2">Production</th>
                  <th className="pb-2">Sales</th>
                  <th className="pb-2">Costs</th>
                  <th className="pb-2">Profit</th>
                  <th className="pb-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.slice().reverse().map((week, i) => (
                  <tr key={week.week} className={`border-b border-slate-700 ${i === 0 ? 'bg-slate-700/50' : ''}`}>
                    <td className="py-2 font-medium">{week.week}</td>
                    <td className="py-2 font-currency">{formatUGX(week.production)}</td>
                    <td className="py-2 text-green-400 font-currency">{formatUGX(week.sales)}</td>
                    <td className="py-2 text-red-400 font-currency">{formatUGX(week.costs)}</td>
                    <td className={`py-2 font-bold font-currency ${week.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatUGX(week.profit)}
                    </td>
                    <td className="py-2 text-amber-400">{week.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          Data persists across sessions • {currentBakery?.name || bakery} Bakery
        </div>
      </div>
    </div>
  );
}
