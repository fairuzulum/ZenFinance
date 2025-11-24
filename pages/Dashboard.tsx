import React, { useMemo } from 'react';
import { Transaction, Wallet, Budget } from '../types';
import { Card } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';

interface DashboardProps {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, wallets, budgets }) => {
  
  // 1. Calculate Totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += Number(t.amount);
      else expense += Number(t.amount);
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // 2. Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      const dayTxs = transactions.filter(t => t.date === dateStr);
      const inc = dayTxs.filter(t => t.type === 'income').reduce((acc, c) => acc + Number(c.amount), 0);
      const exp = dayTxs.filter(t => t.type === 'expense').reduce((acc, c) => acc + Number(c.amount), 0);
      
      data.push({
        name: format(d, 'dd MMM'),
        income: inc,
        expense: exp
      });
    }
    return data;
  }, [transactions]);

  // 3. Category Data for Pie Chart
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
      });
    return Object.keys(cats).map(key => ({ name: key, value: cats[key] }));
  }, [transactions]);

  // 4. Generate Insights
  const insight = useMemo(() => {
    if (categoryData.length === 0) return "No data yet.";
    const topCat = categoryData.sort((a,b) => b.value - a.value)[0];
    const totalExp = totals.expense || 1;
    const pct = Math.round((topCat.value / totalExp) * 100);
    return `You spent ${pct}% of your money on ${topCat.name} this period.`;
  }, [categoryData, totals]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">Welcome back</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white dark:border-none">
          <div className="flex items-center gap-3 mb-2 opacity-80">
            <div className="p-2 bg-white/10 rounded-lg"><DollarSign size={20} /></div>
            <span className="text-sm font-medium">Total Balance</span>
          </div>
          <div className="text-3xl font-bold">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totals.balance)}
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3 mb-2 text-green-600">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><ArrowUpRight size={20} /></div>
            <span className="text-sm font-medium">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totals.income)}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><ArrowDownRight size={20} /></div>
            <span className="text-sm font-medium">Total Expense</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totals.expense)}
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Analytics (Last 7 Days)">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Expenses by Category">
          <div className="h-64 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Insight Banner */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-full text-primary-600 dark:text-primary-300">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-primary-900 dark:text-primary-100">Smart Insight</h3>
          <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
};