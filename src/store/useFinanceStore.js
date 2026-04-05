import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialTransactions } from '../utils/mockData';

const useFinanceStore = create(
  persist(
    (set, get) => ({
      // State
      transactions: initialTransactions,
      role: 'admin', // 'admin' or 'viewer'
      darkMode: true,
      filters: {
        search: '',
        category: 'All',
        type: 'All',
        dateRange: 'All', // 'All', 'Jan 2025', 'Feb 2025', 'Mar 2025'
      },
      sortConfig: {
        key: 'date',
        direction: 'desc',
      },

      // Actions: Transactions
      addTransaction: (transaction) => 
        set((state) => ({ 
          transactions: [
            { ...transaction, id: crypto.randomUUID() }, 
            ...state.transactions
          ] 
        })),

      deleteTransaction: (id) => 
        set((state) => ({ 
          transactions: state.transactions.filter((t) => t.id !== id) 
        })),

      updateTransaction: (id, updatedTransaction) => 
        set((state) => ({ 
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, ...updatedTransaction } : t
          ) 
        })),

      // Actions: Settings & Roles
      setRole: (role) => set({ role }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      // Actions: Filters & Sorting
      setFilters: (newFilters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...newFilters } 
        })),

      resetFilters: () => 
        set({ 
          filters: { search: '', category: 'All', type: 'All', dateRange: 'All' } 
        }),

      setSortConfig: (key, direction) => 
        set({ sortConfig: { key, direction } }),

      // Logic: Filtered & Sorted Data Helper
      getFilteredTransactions: () => {
        const { transactions, filters, sortConfig } = get();
        
        let filtered = transactions.filter((t) => {
          const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase());
          const matchesCategory = filters.category === 'All' || t.category === filters.category;
          const matchesType = filters.type === 'All' || t.type === filters.type;
          
          let matchesDate = true;
          if (filters.dateRange !== 'All') {
            const date = new Date(t.date);
            const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            matchesDate = monthStr === filters.dateRange;
          }
          
          return matchesSearch && matchesCategory && matchesType && matchesDate;
        });

        // Sorting logic
        filtered.sort((a, b) => {
          const valA = a[sortConfig.key];
          const valB = b[sortConfig.key];
          
          if (sortConfig.key === 'date') {
            const dateA = new Date(valA);
            const dateB = new Date(valB);
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
          }
          
          if (typeof valA === 'string') {
            return sortConfig.direction === 'asc' 
              ? valA.localeCompare(valB) 
              : valB.localeCompare(valA);
          }
          
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        });

        return filtered;
      },

      // Logic: Summary Metrics Helper
      getSummary: () => {
        const { transactions } = get();
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          totalBalance: income - expenses,
          monthlyIncome: income,
          monthlyExpenses: expenses
        };
      }
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useFinanceStore;
