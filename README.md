# Restaurant Management System (RMS)

A modern web-based Restaurant Management System built to manage daily restaurant operations like orders, table booking, and sales tracking.

## 🚀 Live Demo
🔗 https://rms-alishaan.netlify.app

## 🧠 Problem Statement
Small restaurants often manage orders and sales manually, leading to:
- Poor tracking of daily sales
- Order mistakes
- No data for business decisions

RMS solves this by providing a simple digital system for restaurant staff and owners.

## ✨ Features
- 📋 Table booking system
- 🧾 Daily order tracking
- 📊 Sales overview
- 🔐 Secure authentication
- 📱 Responsive UI

## 🛠 Tech Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Backend: Supabase
- Database: PostgreSQL
- Deployment: Netlify


## 📁 Project Structure

src/
├─ components/
│ ├─ Analytics.tsx
│ ├─ KitchenDisplay.tsx
│ ├─ OrderForm.tsx
│ └─ TableGrid.tsx
│
├─ lib/
│ ├─ database.ts # Database queries & helpers
│ └─ supabase.ts # Supabase client configuration
│
├─ types/
│ ├─ index.ts
│ └─ supabase.ts
│
├─ App.tsx
├─ main.tsx
└─ index.css

## 📁 DataBase Structure
supabase/migrations/
├─ 20250131_light_wood.sql
├─ 20250201_sparkling_frog.sql
├─ 20250210_wispy_crystal.sql
├─ 20250208_damp_art.sql
├─ 20250317_dry_term.sql
├─ 20250317_bronze_summit.sql

---

## 🗄️ Database Design

- PostgreSQL database managed via Supabase
- Schema changes handled using **migration files**
- Ensures version control and scalability of database structure

---

📈 Future Enhancements

Inventory & waste management

Role-based access (Admin / Staff)

Monthly and yearly sales reports

Export reports for business analysis

---

## 🔐 Environment Variables

Environment variables are **not committed** for security reasons.

Create a `.env` file using the provided template:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


🧪 Run Locally
npm install
npm run dev


The application will run on:

http://localhost:5173
