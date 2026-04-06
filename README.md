# 💰 FinanceDash — Finance Dashboard

A modern, full-featured finance dashboard built using **React, Zustand, and Tailwind CSS**.
Designed to simulate a real-world financial tracking system with performance optimizations and a clean SaaS-style UI.

---

## 🚀 Live Demo

👉 https://finance-dashboard-chi-bice.vercel.app

---

# 📌 Overview

FinanceDash is a frontend-focused financial management dashboard that allows users to:

- Track income and expenses
- Analyze financial trends through charts
- Gain insights into spending behavior
- Interact with a responsive and optimized UI

The project emphasizes **performance, scalability, and user experience**, making it suitable for real-world applications.

---

# 🧠 Approach

The application is designed with a **modular and scalable architecture**:

- **State Management** handled using Zustand with persistence
- **Component-based structure** for reusability and maintainability
- **Performance optimizations** like debounced search and memoization
- **Separation of concerns** between UI, logic, and state
- **Responsive-first design** using Tailwind CSS

Special focus was given to:

- Clean UI without overdesign
- Real-time reactivity
- Minimal but effective animations

---

# ✨ Features

## 📊 Dashboard

- Financial summary (Balance, Income, Expenses, Savings Rate)
- Animated count-up statistics
- Monthly cash flow visualization (Recharts)
- Spending breakdown chart
- Top spending categories with percentage distribution

---

## 💳 Transactions

- Add, Edit, Delete transactions (CRUD)
- Debounced search (optimized performance)
- Filters (category, type, date)
- Sorting (amount, date, category)
- Pagination (10 rows per page)
- CSV export of filtered data

---

## 🧠 Insights

- Automatically generated financial insights
- Contextual color-based highlighting (warning, good, idea, info)
- Clean and minimal UI for readability

---

## ⚡ UX Enhancements

- Toast notifications for user actions
- Skeleton loaders for realistic loading states
- Smooth page transitions using Framer Motion
- Responsive layout across devices

---

## 🌗 Theme Support

- Dark mode (default)
- Light mode toggle with persistence

---

# 🔐 Role-Based Access Control (RBAC)

The system supports two roles:

### 👑 Admin

- Full access to all features
- Can add, edit, and delete transactions

### 👁 Viewer

- Read-only access
- Cannot modify any data

Role switching updates UI dynamically using global state.

---

# 🛠 Tech Stack

### Frontend

- React 18 (Vite)
- Tailwind CSS v3
- Framer Motion (animations)
- Recharts (charts & data visualization)
- React Router DOM v6

---

### State Management

- Zustand (with persist middleware)

---

### Utilities

- date-fns (date formatting)
- react-hot-toast (notifications)

---

# ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Rohan-Popli/Finance_Dashboard.git
cd Finance_Dashboard
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Run the development server

```bash
npm run dev
```

---

### 4️⃣ Open in browser

```
http://localhost:5173
```

---

# 💾 Data Persistence

- Application state is persisted using Zustand middleware
- Data is stored in browser localStorage
- Transactions remain available after page refresh

---

# 📈 Future Scope

- Backend integration (Node.js + MongoDB)
- User authentication (JWT)
- Budget tracking & alerts
- Export reports (PDF/Excel)
- Multi-user support
- Cloud data sync

---

# 💼 Author

**Rohan Popli**

---
