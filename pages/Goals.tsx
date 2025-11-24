import React, { useState } from 'react';
import { SavingsGoal, Budget, Transaction, CATEGORIES } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Target } from 'lucide-react';
import { format } from 'date-fns';

interface GoalsProps {
  goals: SavingsGoal[];
  budgets: Budget[];
  transactions: Transaction[];
  onAdd: (g: Omit<SavingsGoal, 'id'>) => Promise<void>;
  onAddBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
}

export const Goals: React.FC<GoalsProps> = ({ goals, budgets, transactions, onAdd, onAddBudget }) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  
  // New Goal State
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '0' });
  // New Budget State
  const [newBudget, setNewBudget] = useState({ category: 'Food', amount: '' });

  // Calculations
  const getBudgetProgress = (category: string, limit: number) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(currentMonth))
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    const percentage = Math.min((spent / limit) * 100, 100);
    return { spent, percentage };
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      name: newGoal.name,
      targetAmount: Number(newGoal.target),
      currentAmount: Number(newGoal.current)
    });
    setShowGoalModal(false);
    setNewGoal({ name: '', target: '', current: '0' });
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddBudget({
      category: newBudget.category,
      amount: Number(newBudget.amount),
      month: format(new Date(), 'yyyy-MM')
    });
    setShowBudgetModal(false);
    setNewBudget({ category: 'Food', amount: '' });
  };

  return (
    <div className="space-y-8">
      
      {/* Budget Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Monthly Budgets</h2>
          <Button size="sm" onClick={() => setShowBudgetModal(true)}><Plus size={16} className="mr-1"/> Set Budget</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => {
            const { spent, percentage } = getBudgetProgress(b.category, b.amount);
            const isNearLimit = percentage > 80;
            return (
              <Card key={b.id} className="relative">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{b.category}</span>
                  <span className="text-sm text-gray-500">
                    {new Intl.NumberFormat('id-ID', { compactDisplay: 'short', notation: 'compact' }).format(spent)} / {new Intl.NumberFormat('id-ID', { compactDisplay: 'short', notation: 'compact' }).format(b.amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : 'bg-primary-600'}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                {isNearLimit && <p className="text-xs text-red-500 mt-1">Warning: {percentage.toFixed(0)}% used</p>}
              </Card>
            );
          })}
          {budgets.length === 0 && <p className="text-gray-500 text-sm italic">No budgets set for this month.</p>}
        </div>
      </section>

      {/* Goals Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Savings Goals</h2>
          <Button size="sm" onClick={() => setShowGoalModal(true)}><Plus size={16} className="mr-1"/> Add Goal</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map(g => {
             const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
             return (
               <Card key={g.id} className="flex flex-col items-center text-center p-6">
                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-3">
                   <Target size={24} />
                 </div>
                 <h3 className="font-bold text-lg mb-1 dark:text-white">{g.name}</h3>
                 <p className="text-gray-500 text-sm mb-4">
                   {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(g.currentAmount)} of {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(g.targetAmount)}
                 </p>
                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                 </div>
                 <span className="text-xs font-bold text-indigo-600">{pct.toFixed(0)}% Completed</span>
               </Card>
             )
          })}
        </div>
      </section>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 dark:text-white">New Goal</h2>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" placeholder="Goal Name" required value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} />
              <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" type="number" placeholder="Target Amount" required value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} />
              <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" type="number" placeholder="Current Saved (Optional)" value={newGoal.current} onChange={e => setNewGoal({...newGoal, current: e.target.value})} />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowGoalModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
             <h2 className="text-xl font-bold mb-4 dark:text-white">Set Monthly Budget</h2>
             <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <select className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" value={newBudget.category} onChange={e => setNewBudget({...newBudget, category: e.target.value})}>
                  {CATEGORIES.expense.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" type="number" placeholder="Limit Amount" required value={newBudget.amount} onChange={e => setNewBudget({...newBudget, amount: e.target.value})} />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowBudgetModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Set</Button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};