import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { useHashLocation } from './hooks/useHashLocation';
import { 
  signInWithGoogle, 
  subscribeToAuth,
  logOut,
  getTransactions, 
  getWallets, 
  addTransaction, 
  addWallet, 
  deleteTransaction, 
  getGoals, 
  addGoal, 
  getBudgets, 
  addBudget,
  getDebts,
  addDebt,
  updateDebtPayment
} from './services/firebase';
import { Transaction, Wallet, FilterState, SavingsGoal, Budget, Debt } from './types';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Wallets } from './pages/Wallets';
import { Goals } from './pages/Goals';
import { Debts } from './pages/Debts';
import { User } from 'firebase/auth';
import { Button } from './components/ui/Button';
import { ShieldAlert, Wallet as WalletIcon, LogIn, WifiOff } from 'lucide-react';
import { format } from 'date-fns';

const ALLOWED_EMAIL = "usleunmdi32@gmail.com";

export default function App() {
  const [location] = useHashLocation();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [dataError, setDataError] = useState('');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setLoading(true);
      setDataError('');
      
      if (currentUser) {
        if (currentUser.email === ALLOWED_EMAIL) {
          // Authorized
          setUser(currentUser);
          setAuthError('');
          
          try {
            const uid = currentUser.uid;
            // Use Promise.all to fetch everything in parallel
            const [txs, wls, gls, bgs, dbs] = await Promise.all([
              getTransactions(uid),
              getWallets(uid),
              getGoals(uid),
              getBudgets(uid),
              getDebts(uid)
            ]);
            
            setTransactions(txs);
            setWallets(wls);
            setGoals(gls);
            setBudgets(bgs);
            setDebts(dbs);
          } catch (e: any) {
            console.error("Data fetch error:", e);
            // Provide user-friendly error
            let msg = "Failed to load data.";
            if (e.code === 'failed-precondition') {
                msg = "Database index missing. Check console.";
            } else if (e.code === 'permission-denied') {
                msg = "You do not have permission to access this data.";
            } else if (e.message) {
                msg = `Error: ${e.message}`;
            }
            setDataError(msg);
          }
        } else {
          // Unauthorized
          await logOut();
          setUser(null);
          setTransactions([]);
          setWallets([]);
          setAuthError(`Access Denied: ${currentUser.email} is not authorized.`);
        }
      } else {
        // Not logged in
        setUser(null);
        setTransactions([]);
        setWallets([]);
        setGoals([]);
        setBudgets([]);
        setDebts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthError('');
      await signInWithGoogle();
    } catch (error: any) {
      console.error(error);
      setAuthError("Failed to sign in with Google.");
    }
  };

  const handleLogout = async () => {
    await logOut();
  };

  // CRUD Wrappers
  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      const docRef = await addTransaction(user.uid, tx);
      const newTx = { ...tx, id: docRef.id };
      setTransactions(prev => [newTx, ...prev].sort((a, b) => {
        // Maintain sort order locally
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      }));
    } catch (e) {
      console.error(e);
      alert('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    if (confirm('Delete this transaction?')) {
        await deleteTransaction(user.uid, id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddWallet = async (w: Omit<Wallet, 'id'>) => {
      if (!user) return;
      const docRef = await addWallet(user.uid, w);
      setWallets(prev => [...prev, { ...w, id: docRef.id }]);
  };

  const handleAddGoal = async (g: Omit<SavingsGoal, 'id'>) => {
      if (!user) return;
      const docRef = await addGoal(user.uid, g);
      setGoals(prev => [...prev, { ...g, id: docRef.id }]);
  };

  const handleAddBudget = async (b: Omit<Budget, 'id'>) => {
    if (!user) return;
    const docRef = await addBudget(user.uid, b);
    setBudgets(prev => [...prev, { ...b, id: docRef.id }]);
  };

  const handleAddDebt = async (d: Omit<Debt, 'id'>) => {
    if (!user) return;
    const docRef = await addDebt(user.uid, d);
    setDebts(prev => [...prev, { ...d, id: docRef.id }]);
  };

  const handlePayDebt = async (debtId: string, amount: number, walletId: string) => {
    if (!user) return;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    try {
      // 1. Calculate new values
      const newPaidAmount = debt.paidAmount + amount;
      const isPaid = newPaidAmount >= debt.totalAmount;

      // 2. Update Debt
      await updateDebtPayment(user.uid, debtId, newPaidAmount, isPaid);
      
      // 3. Add Transaction
      await handleAddTransaction({
        walletId,
        type: 'expense',
        amount,
        category: 'Debt Payment',
        note: `Paid debt: ${debt.title}`,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        createdAt: Date.now()
      });

      // 4. Update Local State
      setDebts(prev => prev.map(d => 
        d.id === debtId ? { ...d, paidAmount: newPaidAmount, isPaid } : d
      ));

    } catch (e) {
      console.error("Payment failed", e);
      alert("Failed to process payment");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-dark-bg text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-primary-500 rounded-full mb-4"></div>
            <p>Syncing Financial Data...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated State
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
        <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-dark-border">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <WalletIcon size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ZenFinance</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Secure Personal Finance Tracker</p>
          
          {authError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-xl flex items-center gap-3 text-left">
              <ShieldAlert className="flex-shrink-0" size={20} />
              {authError}
            </div>
          )}

          <Button onClick={handleLogin} className="w-full py-3 text-lg flex items-center justify-center gap-2">
            <LogIn size={20} />
            Sign in with Google
          </Button>

          <p className="mt-6 text-xs text-gray-400">
            Access is restricted to authorized accounts only.
          </p>
        </div>
      </div>
    );
  }

  // Data Fetch Error State
  if (dataError) {
     return (
      <Layout user={user} onLogout={handleLogout}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
            <WifiOff size={64} className="text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Unable to Load Data</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">{dataError}</p>
            <Button onClick={() => window.location.reload()}>Try Refreshing</Button>
        </div>
      </Layout>
     )
  }

  // Authenticated Router
  let content;
  switch (location) {
    case '/transactions':
      content = <Transactions 
        transactions={transactions} 
        wallets={wallets} 
        onAdd={handleAddTransaction} 
        onDelete={handleDeleteTransaction}
      />;
      break;
    case '/wallets':
      content = <Wallets wallets={wallets} onAdd={handleAddWallet} transactions={transactions} />;
      break;
    case '/goals':
      content = <Goals goals={goals} onAdd={handleAddGoal} budgets={budgets} onAddBudget={handleAddBudget} transactions={transactions} />;
      break;
    case '/debts':
      content = <Debts debts={debts} wallets={wallets} onAdd={handleAddDebt} onPay={handlePayDebt} />;
      break;
    case '/settings':
      content = (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm border dark:border-dark-border text-center">
            <h2 className="text-xl font-bold dark:text-white mb-4">Account Settings</h2>
            <div className="flex flex-col items-center mb-6">
                {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full mb-3" />}
                <p className="font-medium dark:text-white">{user.displayName}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            <Button onClick={handleLogout} variant="danger" className="w-full">Sign Out</Button>
        </div>
      );
      break;
    case '/':
    default:
      content = <Dashboard transactions={transactions} wallets={wallets} budgets={budgets} />;
      break;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {content}
    </Layout>
  );
}