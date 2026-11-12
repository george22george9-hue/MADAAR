# HADAR (حضر) — Smart Attendance & Student Management SaaS
### by MADAAR Technologies (مدار للتقنية)
> **حضور أذكى. إدارة أسهل.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)]()
[![IndexedDB](https://img.shields.io/badge/Offline_Engine-Dexie.js-orange.svg)]()
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase_RLS-3ECF8E.svg)]()
[![Multi_Tenant](https://img.shields.io/badge/Architecture-Multi--Tenant_SaaS-purple.svg)]()

---

## 🏛️ 1. نظرة عامة على المنظومة (System Overview)
**حَضَر (HADAR)** هي منصة برمجية ذكية بنظام SaaS طورتها شركة **مدار للتقنية (MADAAR Technologies)** لرقمنة وإدارة المراكز والسناتر التعليمية الكبرى والمدرسين.

### الأهداف الأساسية للمنظومة:
1. **تسجيل الحضور بالـ QR فائق السرعة:** مسح كارت الطالب عبر كاميرا الموبايل أو قارئ الباركود مع منع التكرار اللحظي وأصوات تأكيد وتنبيه.
2. **العمل دون اتصال بالإنترنت (Offline-First Architecture):** تسجيل الحضور داخل القاعات بدون إنترنت والتخزين في المتصفح عبر `IndexedDB (Dexie.js)` والمزامنة التلقائية فور عودة الاتصال.
3. **عزل بيانات السناتر (Multi-Tenancy):** كل مركز تعليمي له مساحة عمل مستقلة تماماً برابط خاص به (`/c/[slug]/portal` للطلاب و `/c/[slug]/scanner` للمساعدين).
4. **الإدارة المالية والاشتراكات:** متابعة الدفعات النقدية، المصاريف الشهرية، توليد إيصالات الدفع الرقمية وطباعتها، وسجل الخزينة.
5. **التقارير التحليلية المتقدمة:** رسوم بيانية تفاعلية لنسب الحضور، تنبيهات الغياب المتكرر، وتصدير التقارير بصيغة Excel و PDF.
6. **بوابة الطالب وولي الأمر:** متابعة كارت الـ QR الشخصي، سجل الحضور، جدول المواعيد، والرسوم المستحقة.
7. **لوحة التحكم السيادية (Super Admin):** خاصة بمالكي مدار للتقنية لإدارة السناتر، تفعيل وإيقاف الاشتراكات، ومراقبة الإيراد الشهري للمنصة (MRR).

---

## 🎨 2. الهوية البصرية (Brand Identity)
* **Midnight Navy:** `#111D2D` — لون الثقة والرسوخ المؤسسي.
* **Champagne Gold:** `#C7A66A` — لون الفخامة والتميز.
* **Deep Teal:** `#27877E` — لون الأمان والتقنية الذكية.
* **Warm Ivory:** `#F1EFE8` — خلفيات مريحة للعين.
* **الخطوط:** IBM Plex Sans Arabic للغة العربية، و Plus Jakarta Sans للغة الإنجليزية.

---

## 🔒 3. نموذج الأمان والصلاحيات (Security & RBAC)
* **سوبر أدمن (Super Admin - admin@madaar.io):** محمي بمفتاح إداري سيادي (`Master Administrative Key`) ورمز وصول حصري مع حظر كامل لأي وصول غير مصرح به (403 Forbidden).
* **مدير السنتر (Center Owner):** إدارة الطلاب، المجموعات، الحصص، التقارير، والماليات الخاصة بسنتره فقط.
* **الأسيستانت / المساعد (Assistant):** تشغيل ماسح الـ QR وتسجيل حضور وانصراف القاعة مع حجب البيانات المالية الحساسة.
* **الطالب / ولي الأمر (Student/Guardian):** الوصول فقط لبوابة متابعة الطالب برقم الهاتف أو كود الطالب المطبوع على الكارنيه.

---

## 📱 4. الروابط المخصصة لكل سنتر (Center-Scoped Dynamic Routing)
* `http://localhost:3000/register`: تسجيل سنتر جديد وحجز المعرف الفريد (Slug) وبدء تجربة مجانية 14 يوماً.
* `http://localhost:3000/c/[slug]`: صفحة الهبوط الرقمية المعتمدة للمركز التعليمي.
* `http://localhost:3000/c/[slug]/portal`: بوابة الطالب وولي الأمر الخاصة بالسنتر فقط.
* `http://localhost:3000/c/[slug]/scanner`: ماسح الـ QR السريع الخاص بمساعدي هذا السنتر.

---

## 📂 5. هيكل المشروع (Project Directory Tree)
```text
HADAAR/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # تسجيل دخول متعدد الأدوار ومحمي
│   │   │   └── register/page.tsx       # تسجيل سنتر جديد واختيار باقة
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx               # لوحة تحكم السنتر وويدجت المشاركة
│   │   │   ├── scanner/page.tsx       # ماسح الـ QR الذكي
│   │   │   ├── students/page.tsx      # إدارة الطلاب وطباعة كروت QR
│   │   │   ├── groups/page.tsx        # إدارة المجموعات والمواعيد
│   │   │   ├── sessions/page.tsx      # جدولة الحصص وفتح الحضور
│   │   │   ├── history/page.tsx       # سجل الحضور وسجل التدقيق (Audit)
│   │   │   ├── subscriptions/page.tsx # اشتراكات الطلاب
│   │   │   ├── payments/page.tsx      # المدفوعات وإيصالات الخزينة
│   │   │   ├── reports/page.tsx       # تقارير تفاعلية وتصدير Excel/PDF
│   │   │   ├── notifications/page.tsx # إشعارات وتنبيهات الغياب
│   │   │   ├── settings/page.tsx      # إعدادات السنتر وروابط المشاركة
│   │   │   └── super-admin/page.tsx   # لوحة السوبر أدمن السيادية المحمية
│   │   └── c/[slug]/
│   │       ├── page.tsx               # صفحة السنتر العامة
│   │       ├── portal/page.tsx        # بوابة الطالب المستقلة
│   │       └── scanner/page.tsx       # ماسح الأسيستانت المستقل
│   ├── components/layout/             # مكونات الـ Sidebar والـ Topbar
│   ├── lib/
│   │   ├── offline/db.ts              # محرك التخزين المحلي IndexedDB (Dexie)
│   │   ├── offline/sync-service.ts    # خوارزميات المزامنة ومنع التكرار
│   │   └── store/data-context.tsx     # طبقة البيانات الموحدة Multi-Tenant Store
│   └── types/database.ts              # مخططات TypeScript المطابقة لقاعدة البيانات
└── supabase/migrations/               # سكريبتات SQL وسياسات الأمان RLS
```

---

## 🚀 6. التشغيل السريع (Local Development)
```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev
```
افتح المتصفح على [http://localhost:3000](http://localhost:3000).

---

## 💬 7. التواصل مع المطور والدعم الفني
* **المطور:** MADAAR Technologies
* **واتساب مباشر:** [01202074649 (اضغط للمحادثة المباشرة)](https://wa.me/201202074649?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%AD%D9%8E%D8%B6%D9%8E%D8%B1)

---

© 2026 **MADAAR Technologies**. All rights reserved.
