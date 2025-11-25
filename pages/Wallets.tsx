import React, { useState } from 'react';
import { Wallet, Transaction, WalletType } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, CreditCard, Banknote, Landmark, Trash2 } from 'lucide-react';

interface WalletsProps {
  wallets: Wallet[];
  transactions: Transaction[];
  onAdd: (w: Omit<Wallet, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const Wallets: React.FC<WalletsProps> = ({ wallets, transactions, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<WalletType>('cash');

  const calculateBalance = (walletId: string) => {
    return transactions
      .filter(t => t.walletId === walletId)
      .reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      name: newWalletName,
      type: newWalletType,
      currency: 'IDR',
      balance: 0 // initial, stored in FB
    });
    setShowModal(false);
    setNewWalletName('');
  };

  const getIcon = (type: WalletType) => {
    switch (type) {
      case 'bank': return <Landmark className="w-6 h-6" />;
      case 'e-wallet': return <CreditCard className="w-6 h-6" />;
      default: return <Banknote className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">My Wallets</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" /> Add Wallet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map(wallet => {
          const balance = calculateBalance(wallet.id);
          return (
            <div key={wallet.id} className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                {getIcon(wallet.type)}
              </div>
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-lg font-semibold">{wallet.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{wallet.type}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onDelete(wallet.id)} 
                        className="p-2 bg-black/20 hover:bg-red-500/80 text-white/70 hover:text-white rounded-lg transition-all"
                        title="Delete Wallet"
                    >
                        <Trash2 size={20} />
                    </button>
                    <div className="p-2 bg-white/10 rounded-lg">
                        {getIcon(wallet.type)}
                    </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Current Balance</p>
                <p className="text-2xl font-bold tracking-tight">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(balance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 dark:text-white">New Wallet</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Wallet Name (e.g., BCA)"
                value={newWalletName}
                onChange={e => setNewWalletName(e.target.value)}
                required
              />
              <select 
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={newWalletType}
                onChange={e => setNewWalletType(e.target.value as WalletType)}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Account</option>
                <option value="e-wallet">E-Wallet</option>
              </select>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};