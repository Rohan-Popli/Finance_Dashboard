import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFinanceStore from '../store/useFinanceStore';

const CATEGORIES = [
  'All', 'Salary', 'Rent', 'Food', 'Entertainment',
  'Transport', 'Utilities', 'Lifestyle', 'Investment',
  'Shopping', 'Education', 'Health', 'Charity', 'Government',
];

const FORM_CATEGORIES = CATEGORIES.filter((c) => c !== 'All');

const DATE_RANGES = ['All', 'Jan 2025', 'Feb 2025', 'Mar 2025'];

const ROWS_PER_PAGE = 10;

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const today = new Date().toISOString().split('T')[0];
const emptyForm = { description: '', amount: '', category: 'Food', type: 'expense', date: today };

const Transactions = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);
  // ── Store ──
  const filters           = useFinanceStore((s) => s.filters);
  const setFilters        = useFinanceStore((s) => s.setFilters);
  const sortConfig        = useFinanceStore((s) => s.sortConfig);
  const setSortConfig     = useFinanceStore((s) => s.setSortConfig);
  const getFiltered       = useFinanceStore((s) => s.getFilteredTransactions);
  const role              = useFinanceStore((s) => s.role);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const addTransaction    = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);

  // Subscribe to raw transactions so the component re-renders when data changes.
  const transactions_raw = useFinanceStore((s) => s.transactions);
  // Re-compute the filtered/sorted list only when the underlying data/filters/sort change.
  const transactions = useMemo(
    () => getFiltered(),
    [transactions_raw, filters, sortConfig] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const isAdmin = role === 'admin';

  // ── Debounced search ──
  // Keep a local input value so keystrokes feel instant.
  // Only push to the Zustand store (which triggers filtering) after 350 ms of inactivity.
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimer = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters({ search: value });
    }, 750);
  };

  // Keep local input in sync if the store search is reset externally.
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the filtered result set changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length, filters, sortConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(transactions.length / ROWS_PER_PAGE));

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return transactions.slice(start, start + ROWS_PER_PAGE);
  }, [transactions, currentPage]);

  // Scroll table into view when page changes.
  const tableRef = useRef(null);
  const handlePageChange = (page) => {
    setCurrentPage(page);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Sort helpers ──
  const handleSort = (key) => {
    const dir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig(key, dir);
  };
  const sortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };
  // ── CSV Export ──
  const exportToCSV = () => {
    if (!transactions.length) return;

    const headers = ["Date", "Description", "Category", "Amount", "Type"];

    const rows = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.amount,
      t.type
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map(row => row.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  // ── Modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);   // null = add mode, string = edit mode
  const [form, setForm]               = useState(emptyForm);
  const [errors, setErrors]           = useState({});

  const openAddModal  = () => { setEditingId(null); setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] }); setErrors({}); setIsModalOpen(true); };
  const openEditModal = (t) => { setEditingId(t.id); setForm({ description: t.description, amount: String(t.amount), category: t.category, type: t.type, date: t.date }); setErrors({}); setIsModalOpen(true); };
  const closeModal    = () => { setIsModalOpen(false); setEditingId(null); };
  const setField      = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.description.trim())                errs.description = 'Description is required';
    if (!form.amount || Number(form.amount) <= 0) errs.amount     = 'Amount must be a positive number';
    if (!form.date)                              errs.date        = 'Date is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = { description: form.description.trim(), amount: parseFloat(form.amount), category: form.category, type: form.type, date: form.date };

    if (editingId) {
      updateTransaction(editingId, payload);
    } else {
      addTransaction(payload);
    }
    closeModal();
  };

  return (
    <>
      {/* ── Page ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Recent Transactions
          </h1>

          <div className="flex items-center gap-3">
            {/* CSV Export Button */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-sm font-semibold rounded-xl 
              bg-white/80 dark:bg-white/5 
              border border-gray-200 dark:border-white/10 
              text-gray-700 dark:text-gray-300 
              hover:bg-gray-100 dark:hover:bg-white/10 
              transition-all duration-200 backdrop-blur-md"
            >
              Export CSV
            </button>

            {isAdmin && (
              <button
                id="add-transaction-btn"
                onClick={openAddModal}
                className="bg-gradient-to-r from-indigo-600 to-ft-primary text-white px-5 py-2.5 rounded-xl shadow-lg shadow-ft-primary/30 hover:shadow-ft-primary/50 transition-all duration-300 font-semibold text-sm"
              >
                + Add Transaction
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap gap-3">
          <input
            id="txn-search"
            type="text"
            placeholder="Search transactions..."
            value={searchInput}
            onChange={handleSearchChange}
            className="flex-1 min-w-[180px] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-ft-muted rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <select
            id="txn-category"
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-[#1a1f3a] text-gray-900 dark:text-white">{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
          <select
            id="txn-type"
            value={filters.type}
            onChange={(e) => setFilters({ type: e.target.value })}
            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            <option value="All"     className="bg-white dark:bg-[#1a1f3a] text-gray-900 dark:text-white">All Types</option>
            <option value="income"  className="bg-white dark:bg-[#1a1f3a] text-gray-900 dark:text-white">Income</option>
            <option value="expense" className="bg-white dark:bg-[#1a1f3a] text-gray-900 dark:text-white">Expense</option>
          </select>
          <select
            id="txn-date"
            value={filters.dateRange}
            onChange={(e) => setFilters({ dateRange: e.target.value })}
            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            {DATE_RANGES.map((d) => (
              <option key={d} value={d} className="bg-white dark:bg-[#1a1f3a] text-gray-900 dark:text-white">{d === 'All' ? 'All Dates' : d}</option>
            ))}
          </select>
        </div>

        {/* ── Table ── */}
        <div ref={tableRef} className="bg-white dark:bg-ft-card rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => handleSort('date')}>
                  Date{sortIcon('date')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => handleSort('description')}>
                  Description{sortIcon('description')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => handleSort('category')}>
                  Category{sortIcon('category')}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-right cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => handleSort('amount')}>
                  Amount{sortIcon('amount')}
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 w-16 ml-auto bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-center">
                        <div className="h-4 w-20 mx-auto bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      </td>
                    )}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(t.date)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{t.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{t.category}</td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="text-xs px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/30 transition-all duration-200 font-medium"
                            onClick={() => openEditModal(t)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs px-3 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-all duration-200 font-medium"
                            onClick={() => deleteTransaction(t.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between flex-wrap gap-3">
            {/* Row count */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, transactions.length)}–{Math.min(currentPage * ROWS_PER_PAGE, transactions.length)} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      page === currentPage
                        ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Add Transaction Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={closeModal}
          >
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative w-full max-w-md bg-gradient-to-br from-[#1e2340] via-[#191e35] to-[#111520] border border-indigo-500/20 rounded-2xl p-7 shadow-2xl"
              style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.12), 0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top shimmer */}
              <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-ft-muted hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-ft-muted mb-1.5">Description</label>
                  <input
                    id="modal-description"
                    type="text"
                    placeholder="e.g. Grocery shopping"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-ft-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-ft-muted mb-1.5">Amount ($)</label>
                  <input
                    id="modal-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-ft-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-ft-muted mb-1.5">Category</label>
                  <select
                    id="modal-category"
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  >
                    {FORM_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#1a1f3a] text-gray-900 dark:text-white">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Type toggle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-ft-muted mb-1.5">Type</label>
                  <div className="flex gap-2">
                    {['expense', 'income'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setField('type', t)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                          form.type === t
                            ? t === 'expense'
                              ? 'bg-red-500/25 text-red-300 ring-1 ring-red-500/40'
                              : 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/40'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-ft-muted hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {t === 'expense' ? '↓ Expense' : '↑ Income'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-ft-muted mb-1.5">Date</label>
                  <input
                    id="modal-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all dark:[color-scheme:dark]"
                  />
                  {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-ft-muted hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-ft-primary text-white shadow-lg shadow-ft-primary/30 hover:shadow-ft-primary/50 transition-all duration-300 text-sm font-semibold"
                  >
                    {editingId ? 'Save Changes' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Transactions;
