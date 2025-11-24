import React, { useState, useMemo } from 'react';
import { Transaction, Wallet, FilterState, CATEGORIES, TransactionType } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Filter, Download, Search } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionsProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onAdd: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, wallets, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    minAmount: '',
    maxAmount: '',
    categories: [],
    type: 'all',
    search: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as TransactionType,
    category: 'Food',
    walletId: wallets[0]?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    note: ''
  });

  // Derived filtered data
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Date Range
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      
      // Time Range
      if (filters.startTime && t.time < filters.startTime) return false;
      if (filters.endTime && t.time > filters.endTime) return false;

      // Amount Range
      if (filters.minAmount && Number(t.amount) < Number(filters.minAmount)) return false;
      if (filters.maxAmount && Number(t.amount) > Number(filters.maxAmount)) return false;

      // Type
      if (filters.type !== 'all' && t.type !== filters.type) return false;

      // Category
      if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;

      // Search Note
      if (filters.search && !t.note.toLowerCase().includes(filters.search.toLowerCase()) && !t.category.toLowerCase().includes(filters.search.toLowerCase())) return false;

      return true;
    });
  }, [transactions, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      ...formData,
      amount: Number(formData.amount),
      createdAt: Date.now()
    });
    setShowModal(false);
    // Reset basic form
    setFormData(prev => ({ ...prev, amount: '', note: '' }));
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Time", "Type", "Category", "Amount", "Wallet", "Note"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + filteredTransactions.map(t => {
          const wName = wallets.find(w => w.id === t.walletId)?.name || 'Unknown';
          return `${t.date},${t.time},${t.type},${t.category},${t.amount},${wName},"${t.note}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} className="mr-2" /> Filter
          </Button>
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={18} className="mr-2" /> Export
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={18} className="mr-2" /> Add New
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="bg-gray-50 dark:bg-gray-800 border-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="p-2 rounded border dark:bg-dark-card dark:border-dark-border"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
            <select 
              className="p-2 rounded border dark:bg-dark-card dark:border-dark-border"
              value={filters.type}
              onChange={e => setFilters({...filters, type: e.target.value as any})}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <div className="flex gap-2">
               <input type="date" className="w-full p-2 rounded border dark:bg-dark-card dark:border-dark-border" 
                 value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
               <input type="date" className="w-full p-2 rounded border dark:bg-dark-card dark:border-dark-border"
                 value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
            </div>
             <div className="flex gap-2 items-center">
               <span className="text-sm">Time:</span>
               <input type="time" className="w-full p-2 rounded border dark:bg-dark-card dark:border-dark-border" 
                 value={filters.startTime} onChange={e => setFilters({...filters, startTime: e.target.value})} />
               <span className="text-sm">-</span>
               <input type="time" className="w-full p-2 rounded border dark:bg-dark-card dark:border-dark-border"
                 value={filters.endTime} onChange={e => setFilters({...filters, endTime: e.target.value})} />
            </div>
             <div className="flex gap-2 items-center md:col-span-2">
               <span className="text-sm">Amount:</span>
               <input type="number" placeholder="Min" className="w-full p-2 rounded border dark:bg-dark-card dark:border-dark-border" 
                 value={filters.minAmount} onChange={e => setFilters({...filters, minAmount: e.target.value})} />
               <span className="text-sm">-</span>
               <input type="number" placeholder="Max" className="w-full p-2 rounded border dark:bg-dark-card dark:border-dark-border"
                 value={filters.maxAmount} onChange={e => setFilters({...filters, maxAmount: e.target.value})} />
            </div>
          </div>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No transactions found matching your filters.</div>
        ) : filteredTransactions.map((tx) => (
          <div key={tx.id} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-2 sm:mb-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {tx.type === 'income' ? <Plus size={20} /> : <span className="text-lg font-bold">-</span>}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{tx.category}</p>
                <p className="text-sm text-gray-500">{tx.note || 'No note'}</p>
                <p className="text-xs text-gray-400 sm:hidden">{tx.date} at {tx.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
               <div className="text-right hidden sm:block">
                 <p className="text-sm text-gray-500">{tx.date}</p>
                 <p className="text-xs text-gray-400">{tx.time}</p>
               </div>
               <div className="text-right">
                 <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                   {tx.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                 </p>
                 <p className="text-xs text-gray-400">
                   {wallets.find(w => w.id === tx.walletId)?.name}
                 </p>
               </div>
               <button onClick={() => onDelete(tx.id)} className="text-gray-400 hover:text-red-500 p-2">
                 <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {(['expense', 'income'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, type: t})}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      formData.type === t 
                        ? (t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white') 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input 
                  type="number" 
                  required
                  className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input 
                    type="time"
                    required
                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select 
                  className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES[formData.type].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet</label>
                <select 
                  className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={formData.walletId}
                  onChange={e => setFormData({...formData, walletId: e.target.value})}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (Optional)</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  placeholder="Details..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Save Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};