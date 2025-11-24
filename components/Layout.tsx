import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  List, 
  Target, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon,
  LogOut,
  CreditCard
} from 'lucide-react';
import { useHashLocation } from '../hooks/useHashLocation';
import { User } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [location, navigate] = useHashLocation();

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: List, label: 'Transactions', path: '/transactions' },
    { icon: Wallet, label: 'Wallets', path: '/wallets' },
    { icon: CreditCard, label: 'Debts', path: '/debts' },
    { icon: Target, label: 'Goals & Budget', path: '/goals' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full z-20 bg-white dark:bg-dark-card border-b dark:border-dark-border px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-xl text-primary-600 flex items-center gap-2">
          <Wallet className="w-6 h-6" /> ZenFinance
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-dark-card border-r dark:border-dark-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b dark:border-dark-border">
            <Wallet className="w-6 h-6 text-primary-600 mr-2" />
            <span className="font-bold text-xl">ZenFinance</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                  ${location === item.path 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-dark-border space-y-2">
             {user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.email?.substring(0,2).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
            >
              {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button 
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};