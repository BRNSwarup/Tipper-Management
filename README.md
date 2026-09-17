# Enterprise Truck Management System (TMS)

A complete production-style full-stack **Truck Management System** web application built for transport businesses managing 10–50 trucks. Built with **React.js, Vite, Tailwind CSS**, and **Supabase (PostgreSQL, Auth, RLS, Storage)**.

---

## 🚀 System Architecture & Capabilities

- **Frontend**: React 18 / Vite / Tailwind CSS with glassmorphism dashboard, Recharts analytics, responsive sidebar navigation, modal drawers, and status tags.
- **Backend & Relational Database**: **Supabase PostgreSQL** relational schema (`profiles`, `trucks`, `drivers`, `parties`, `trips`, `trip_expenses`, `fuel_entries`, `maintenance`, `tyres`, `tyre_events`, `driver_ledger`, `documents`, `invoices`, `invoice_trips`, `payments`).
- **Security & Authorization**: **Supabase Auth** with PostgreSQL **Row Level Security (RLS)** enforcing access control for **Owner**, **Manager**, **Accountant**, and **Driver** roles.
- **Storage**: **Supabase Storage Buckets** (`documents`, `expense-bills`, `pod-files`, `invoices`) for compliance records, receipt attachments, and Proof of Delivery (POD) uploads.
- **Dual Data Provider**: Runs 100% out of the box with pre-populated Indian fleet demo dataset (15 trucks, 15 drivers, 12 parties, 35 trips, fuel entries, maintenance, tyres, invoices) while allowing 1-click connection to a live Supabase cloud project.

---

## 📦 Key Modules

1. **Executive Dashboard**: Real-time KPIs, Revenue vs Expenses bar charts, Truck Utilization donut charts, Fuel efficiency trends, document expiry alerts (<30 days).
2. **Truck Management**: Complete CRUD, registration, chassis/engine numbers, capacity, axle configuration, company owned vs attached types, odometer tracker, truck detail drawer with fuel/maintenance history.
3. **Driver Management**: Driver profiles, phone, licence number, licence expiry alert badges (30, 15, 7, 1 day countdown), salary model (monthly / per-trip / per-km), assigned truck bindings.
4. **Parties Management**: Consignors, consignees, brokers, vendors, GSTIN validation, credit days allowed.
5. **Trip Management (Central Entity)**: Trip creation wizard, LR (Lorry Receipt) tracking, route planning (`source` -> `destination`), status lifecycle (`planned` -> `running` -> `delivered` -> `billed` -> `closed`), POD uploads, and **Detailed Trip P&L Breakdown** (Freight (-) Fuel (-) Tolls (-) Loading (-) Bata (-) Fines = Net Profit & Margin %).
6. **Fuel & Mileage Control**: Log fuel fillings with odometer, litres, rate, pump station, auto calculation of `Km/Litre` efficiency based on previous filling.
7. **Maintenance & Workshop**: Log breakdown vs scheduled services, workshop details, labour vs parts cost split, downtime days lost.
8. **Tyre Management**: Serial number tracking, brand, cost, status (`in_stock`, `fitted`, `retreaded`, `scrapped`), position (`FL`, `FR`, `RL1`, `RR1`, `RL2`, `RR2`, `SPARE`), and **Visual Axle Layout Inspector**.
9. **Driver Ledger & Settlements**: Record advances, daily bata, expense claims, salary credits, deductions, and real-time running balance calculation per driver.
10. **Compliance Document Vault**: Vehicle RC, Insurance, Fitness, Permits, PUC, and Driving Licences with automatic expiry countdown alerts (Expired, 1-7 days, 8-15 days, 16-30 days).
11. **Invoicing & Billing**: Multi-trip selection to auto-generate GST transport tax invoices with 5% RCM or 12% GST rates, printable PDF Invoice Generator.
12. **Payments & Receivables**: Record client invoice payments (NEFT/RTGS, UPI, Cheque, Cash) with UTR numbers, and **Aging Receivables Report** (0-30, 30-60, 60-90, 90+ days).
13. **Reports & CSV Analytics**: 8 comprehensive exportable reports (Truck Profitability, Driver Performance, Fuel Efficiency, Party Profitability, CSV/Excel export).

---

## 🛠️ Getting Started Locally

### 1. Installation
```bash
# Clone repository or navigate to folder
npm install
npm run dev
```

The application will start at `http://localhost:5173` in **Demo Fleet Mode** with pre-populated realistic Indian logistics data.

---

## ⚡ Connecting to Live Supabase Project

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings -> API** and copy your `Project URL` and `anon public key`.

### 2. Execute SQL Database Schema
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Copy the contents of `supabase/schema.sql`.
3. Paste and run the SQL script. This creates all 15 relational tables, UUID extensions, foreign keys, performance indexes, update triggers, RLS policies, and storage buckets.

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
Or open **Settings & Supabase** inside the web app and enter your URL & Key directly into the interactive form!

---

## 🔒 Role-Based Permissions Summary

| Role | Operational Access | Financial Access | Invoicing & Ledger | User Mgmt |
| :--- | :---: | :---: | :---: | :---: |
| **Owner** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Manager** | ✅ Full Operations | ❌ View Only | ❌ View Only | ❌ |
| **Accountant** | 👁️ View Ops | ✅ Full | ✅ Full | ❌ |
| **Driver** | 🚗 Assigned Trips | ❌ | 👁️ Own Ledger | ❌ |

---

## 🚀 Production Deployment

Build the optimized bundle for deployment:
```bash
npm run build
```
Deploy the output `/dist` folder to Vercel, Netlify, Cloudflare Pages, or AWS Amplify.
