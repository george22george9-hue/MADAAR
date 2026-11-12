# HADAR (حضر) — Smart Attendance & Student Management SaaS Platform
## Developed by MADAAR Technologies
### *حضور أذكى. إدارة أسهل.*

HADAR is an enterprise-grade multi-tenant SaaS platform built for educational centers, tutoring academies, and educational institutions across Egypt and the MENA region.

---

## 🎨 Brand Identity & Design Direction

- **Primary Colors:**
  - **Midnight Navy:** `#111D2D` (Commanding background, deep typography, authority)
  - **Champagne Gold:** `#C7A66A` (Brand accent, active states, premium highlights)
  - **Warm Ivory:** `#F1EFE8` (Subtle canvas, neutral borders)
  - **Deep Teal:** `#27877E` (Success metrics, active indicators, brand balance)
  - **Pure White:** `#FFFFFF` (Cards, surfaces, crisp readability)
- **Typography:** `IBM Plex Sans Arabic` for Arabic, `Plus Jakarta Sans` for English.
- **Language & Orientation:** Arabic RTL as primary default, with instant dynamic LTR English switching.

---

## 🚀 Key Modules & Capabilities

1. **Multi-Tenant SaaS Workspace:**
   - Independent center workspaces with complete data isolation.
   - Built-in tenant switcher and role switcher (`owner`, `assistant`, `super_admin`).

2. **Executive Dashboard (`/`):**
   - Real-time KPIs calculated dynamically: Registered students, Active students, Today's attendance, Absences, Late arrivals, Upcoming sessions, Outstanding balance.
   - Weekly attendance area chart & group comparison bars (Recharts).
   - Live stream of recent attendance scans.
   - Consecutive absence alerts with one-click parent WhatsApp messaging.

3. **Student Management (`/students`):**
   - Full student profiles (code, phone, parent phone, grade, stage, status, notes).
   - Single and bulk printable smart QR ID cards (formatted for card printers / standard A4 paper).
   - Excel Import (`.xlsx`) with automated header detection and validation.
   - Excel Export with one click.

4. **Groups & Recurring Schedules (`/groups`):**
   - Manage subjects, teachers, monthly prices, default rooms, and recurring weekly time slots.
   - Quick "بدء حصة الآن" button triggering instant session creation and scanner activation.

5. **Sessions Management (`/sessions`):**
   - Scheduled, open, completed, and cancelled sessions.
   - Attendance opening and closing controls.
   - Live attendance ratio tracking.

6. **Smart QR Scanner (`/scanner`):**
   - Mobile-first camera scanner using HTML5 QR engine.
   - Immediate audio feedback (synthesized frequency beeps for success and error).
   - Validation against session enrollment, active student status, and duplicate scan prevention.
   - Success overlay: *"تمام، اتحضر بنجاح"* with student photo, name, code, time, and status badge.
   - Check-in and Check-out separate modes.
   - Manual attendance override with mandatory audit trail reason recording.

7. **Offline Mode (PWA & IndexedDB):**
   - Pre-download session rosters with a single tap.
   - 100% offline QR scanning with local IndexedDB validation via Dexie.js.
   - Local conflict prevention (cannot check-in twice even offline).
   - Auto-sync on network reconnect and manual "Sync Now" button with status badge.

8. **Attendance History & Audit Trail (`/history`):**
   - Searchable and filterable by student, group, status, and date.
   - Dedicated Administrative Audit Trail tab recording every manual override, modifier user, previous status, new status, timestamp, and justification.

9. **Subscriptions & Payments (`/subscriptions` & `/payments`):**
   - Student billing cycles, amounts, discounts, paid amount, and remaining balances.
   - Multi-channel payments (Cash, InstaPay, Vodafone Cash, Credit Cards).
   - Automated electronic receipt generation with print preview.

10. **Reports & Analytics (`/reports`):**
    - Group attendance comparison, student commitment rates, and financial revenue summaries.
    - Export to Excel (`.xlsx`) and printable PDF reports.

11. **Notifications Center (`/notifications`):**
    - Automated alerts for repeated absences and overdue balances.
    - One-click parent notification via WhatsApp.

12. **Super Admin SaaS Portal (`/super-admin`):**
    - Platform-wide MRR (Monthly Recurring Revenue) calculations.
    - Center management (Add, activate, suspend).
    - Configurable subscription plans (`STARTER`, `GROWTH`, `ENTERPRISE`) and add-on pricing (+100 EGP).

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom MADAAR color tokens & RTL support
- **State & Tenant Management:** React Context with persistent local simulation
- **Offline Storage:** IndexedDB via Dexie.js
- **QR Engine:** `qrcode` & `html5-qrcode`
- **Data Analytics:** Recharts
- **Excel Processing:** SheetJS (`xlsx`)
- **Database Migrations:** PostgreSQL / Supabase with Row Level Security (RLS)

---

## 📦 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Build for Production
```bash
npm run build
npm run start
```

### 3. Database Setup (Supabase)
Apply migrations located in `supabase/migrations/`:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. Optional demo data: `supabase/seed.sql`

Set environment variables in `.env.local` (refer to `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
*(Note: HADAR is equipped with a high-fidelity data layer that functions seamlessly out of the box even before remote credentials are provided).*

---

© 2026 MADAAR Technologies. All rights reserved.

