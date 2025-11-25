import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { FIREBASE_CONFIG } from '../constants';
import { Transaction, Wallet, Budget, SavingsGoal, Debt } from '../types';

const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- Auth Helper ---
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logOut = async () => {
  return signOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- Wallets ---
export const getWallets = async (userId: string): Promise<Wallet[]> => {
  const q = query(collection(db, `users/${userId}/wallets`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wallet));
};

export const addWallet = async (userId: string, wallet: Omit<Wallet, 'id'>) => {
  return addDoc(collection(db, `users/${userId}/wallets`), wallet);
};

export const deleteWallet = async (userId: string, walletId: string) => {
  return deleteDoc(doc(db, `users/${userId}/wallets`, walletId));
};

// --- Transactions ---
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  // FIXED: Only sort by date in Firestore to prevent "Missing Index" error.
  // We will sort by time on the client side.
  const q = query(collection(db, `users/${userId}/transactions`), orderBy('date', 'desc'));
  
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

  // Client-side sorting for time to ensure correct order within the same day
  return data.sort((a, b) => {
    if (a.date !== b.date) return 0; // Let Firestore sort order stand if dates differ (though desc means logic handled)
    // If dates are same, compare time descending (latest time first)
    return b.time.localeCompare(a.time);
  });
};

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>) => {
  return addDoc(collection(db, `users/${userId}/transactions`), transaction);
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
  return deleteDoc(doc(db, `users/${userId}/transactions`, transactionId));
};

// --- Goals ---
export const getGoals = async (userId: string): Promise<SavingsGoal[]> => {
  const q = query(collection(db, `users/${userId}/goals`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavingsGoal));
};

export const addGoal = async (userId: string, goal: Omit<SavingsGoal, 'id'>) => {
  return addDoc(collection(db, `users/${userId}/goals`), goal);
};

export const updateGoalAmount = async (userId: string, goalId: string, amount: number) => {
  const ref = doc(db, `users/${userId}/goals`, goalId);
  return updateDoc(ref, { currentAmount: amount });
};

// --- Budgets ---
export const getBudgets = async (userId: string): Promise<Budget[]> => {
  const q = query(collection(db, `users/${userId}/budgets`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
};

export const addBudget = async (userId: string, budget: Omit<Budget, 'id'>) => {
  return addDoc(collection(db, `users/${userId}/budgets`), budget);
};

// --- Debts ---
export const getDebts = async (userId: string): Promise<Debt[]> => {
  const q = query(collection(db, `users/${userId}/debts`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
};

export const addDebt = async (userId: string, debt: Omit<Debt, 'id'>) => {
  return addDoc(collection(db, `users/${userId}/debts`), debt);
};

export const updateDebtPayment = async (userId: string, debtId: string, newPaidAmount: number, isPaid: boolean) => {
  const ref = doc(db, `users/${userId}/debts`, debtId);
  return updateDoc(ref, { paidAmount: newPaidAmount, isPaid });
};

export const deleteDebt = async (userId: string, debtId: string) => {
  return deleteDoc(doc(db, `users/${userId}/debts`, debtId));
};