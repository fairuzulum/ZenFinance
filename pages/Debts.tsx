import React, { useState } from 'react';
import { Debt, Wallet, Transaction } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface DebtsProps {
  debts: Debt[];
  wallets: Wallet[];
  onAdd: (debt: Omit<Debt, 'id'>) => Promise<void>;
  onPay: (debtId: string, amount: number, walletId: string) => Promise<void>;
  onDelete: (debtId: string) => Promise<void>;
}

export const Debts: React.FC<DebtsProps> = ({ debts, wallets, onAdd, onPay, onDelete }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<{debtId: string, maxAmount: number} | null>(null);

  // New Debt State
  const [newDebt, setNewDebt] = useState({ title: '', amount: '', dueDate: '' });
  
  // Pay State
  const [payData, setPayData] = useState({ amount: '', walletId: wallets[0]?.id || '' });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      title: newDebt.title,
      totalAmount: Number(newDebt.amount),
      paidAmount: 0,
      dueDate: newDebt.dueDate,
      isPaid: false
    });
    setShowAddModal(false);
    setNewDebt({ title: '', amount: '', dueDate: '' });
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal) return;
    
    await onPay(showPayModal.debtId, Number(payData.amount), payData.walletId);
    setShowPayModal(null);
    setPayData({ amount: '', walletId: wallets[0]?.id || '' });
  };

  const openPayModal = (debt: Debt) => {
    const remaining = debt.totalAmount - debt.paidAmount;
    setPayData({ ...payData, amount: remaining.toString() });
    setShowPayModal({ debtId: debt.id, maxAmount: remaining });
  };

  const activeDebts = debts.filter(d => !d.isPaid);
  const paidDebts = debts.filter(d => d.isPaid);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Debts & Bills</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" /> Add Debt
        </Button>
      </div>

      {/* Active Debts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" /> Outstanding
        </h2>
        {activeDebts.length === 0 ? (
            <div className="text-gray-500 italic p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">You are debt-free!</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDebts.map(debt => {
                const percentage = Math.min((debt.paidAmount / debt.totalAmount) * 100, 100);
                return (
                <Card key={debt.id} className="relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg dark:text-white">{debt.title}</h3>
                            {debt.dueDate && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Clock size={14} /> Due: {debt.dueDate}
                                </p>
                            )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                             <div className="flex items-center gap-3">
                                <p className="font-bold text-xl text-red-600">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(debt.totalAmount)}
                                </p>
                                <button 
                                  onClick={() => onDelete(debt.id)} 
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete Debt"
                                >
                                  <Trash2 size={18} />
                                </button>
                             </div>
                            <p className="text-xs text-gray-400">Total</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Paid: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(debt.paidAmount)}</span>
                            <span className="font-medium text-primary-600">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>

                    <Button className="w-full" size="sm" onClick={() => openPayModal(debt)}>
                        Bayar Hutang (Pay Debt)
                    </Button>
                </Card>
                );
            })}
            </div>
        )}
      </div>

      {/* Paid History */}
      {paidDebts.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" /> Paid History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidDebts.map(debt => (
                    <div key={debt.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 opacity-75 relative group">
                         <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold dark:text-white line-through decoration-gray-400">{debt.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">LUNAS</span>
                              <button 
                                onClick={() => onDelete(debt.id)} 
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete Record"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                         </div>
                         <p className="text-gray-500 dark:text-gray-400 text-sm">
                             Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(debt.totalAmount)}
                         </p>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Debt</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                  <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="e.g. Pinjaman Bank" required value={newDebt.title} onChange={e => setNewDebt({...newDebt, title: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Total Amount</label>
                  <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" type="number" placeholder="Rp" required value={newDebt.amount} onChange={e => setNewDebt({...newDebt, amount: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Due Date (Optional)</label>
                  <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" type="date" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Pay Debt Modal */}
       {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Pay Debt</h2>
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Payment Amount</label>
                  <input 
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
                    type="number" 
                    max={showPayModal.maxAmount}
                    required 
                    value={payData.amount} 
                    onChange={e => setPayData({...payData, amount: e.target.value})} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Remaining: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(showPayModal.maxAmount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Pay From Wallet</label>
                <select 
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={payData.walletId}
                  onChange={e => setPayData({...payData, walletId: e.target.value})}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPayModal(null)}>Cancel</Button>
                <Button type="submit" className="flex-1">Confirm Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};