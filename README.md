# 💰 FinTrack — Finance Dashboard

A modern, full-featured finance dashboard built with **React, Zustand, and Tailwind CSS**.
It helps users track income, expenses, and financial insights with a clean SaaS-style UI.

---

## 🚀 Live Demo

👉 https://finance-dashboard-chi-bice.vercel.app

---

## ✨ Features

### 📊 Dashboard

- Summary cards for **Balance, Income, Expenses, Savings Rate**
- Animated count-up numbers
- Monthly cash flow visualization
- Spending breakdown (charts)
- Top spending categories

---

### 💳 Transactions

- Add, Edit, Delete transactions (CRUD)
- Search with **debounce optimization**
- Advanced filtering (category, type, date)
- Sorting (date, amount, category)
- Pagination (10 rows per page)
- CSV export of filtered data

---

### 🧠 Insights

- AI-style smart insights generated from transaction data
- Clean, minimal styling with contextual color indicators

---

### ⚡ UX Enhancements

- Toast notifications for actions (add/edit/delete)
- Skeleton loaders for realistic loading states
- Smooth page transitions (Framer Motion)
- Fully responsive design

---

### 🌗 Theme Support

- Dark mode (default)
- Light mode toggle with persistent preference

---

## 🔐 Role-Based Access Control (RBAC)

The application supports two roles:

### 👑 Admin

- Can **add, edit, and delete** transactions
- Full access to all features

### 👁 Viewer

- Read-only access
- Cannot modify transactions
- UI adapts dynamically based on role

> Role switching is handled via Zustand state and updates UI in real-time.

---

## 🛠 Tech Stack

### Frontend

- React 18 (Vite)
- Tailwind CSS v3
- Framer Motion (animations)
- Recharts (data visualization)
- React Router DOM v6

---

### State Management

- Zustand (with persist middleware)

---

### Utilities

- date-fns (date formatting)
- react-hot-toast (notifications)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Rohan-Popli/finance-dashboard.git
cd finance-dashboard
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

```text
http://localhost:5173
```

---

## 💾 Data Persistence

- Uses **Zustand persist middleware**
- Data is stored in **localStorage**
- Transactions remain available after page refresh

---

## 📈 Future Improvements

- Backend integration (Node.js + MongoDB)
- Authentication (JWT)
- Budget tracking system
- Export reports (PDF)

---

## 💼 Author

**Rohan Popli**

---
