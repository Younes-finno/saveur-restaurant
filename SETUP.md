# 🗄️ دليل إعداد Supabase — نظام SAVEUR

---

## الخطوة 1 — إنشاء حساب وپروجكت

1. روح على **https://supabase.com** واضغط **Start your project**
2. سجّل دخول بحساب GitHub أو إيميل
3. اضغط **New Project**
4. اختر اسم للپروجكت مثلاً: `saveur-restaurant`
5. **ضع باسورد قوي** واحفظه (ما تحتاجه الحين بس احفظه)
6. اختر أقرب Region ليك مثلاً `Frankfurt` أو `Singapore`
7. اضغط **Create new project** — انتظر دقيقة يتهيأ

---

## الخطوة 2 — إنشاء جدول الطلبات

1. من القائمة الجانبية اضغط **Table Editor**
2. اضغط **New Table**
3. سمّه: `orders`
4. **فعّل** خيار "Enable Row Level Security (RLS)" — سنضبطه بعدين
5. أضف هذه الأعمدة بالضبط:

| Column Name | Type | Default Value | ملاحظة |
|-------------|------|---------------|--------|
| id | int8 | — | primary key ✅ (موجود تلقائياً) |
| created_at | timestamptz | now() | موجود تلقائياً ✅ |
| table_num | int4 | — | رقم الطاولة |
| items | jsonb | — | قائمة الأصناف |
| note | text | '' | ملاحظة الزبون |
| status | text | 'new' | حالة الطلب |
| placed_at | int8 | — | timestamp بالميلي ثانية |

6. اضغط **Save**

---

## الخطوة 3 — إعداد الصلاحيات (RLS Policies)

عشان التطبيق يقدر يقرأ ويكتب بدون login:

1. من القائمة اضغط **Authentication** ثم **Policies**
2. اختر جدول `orders`
3. اضغط **New Policy** ثم اختر **For full customization**

### Policy 1 — السماح للجميع بالقراءة:
- **Policy name:** `Allow read`
- **Allowed operation:** SELECT
- **Target roles:** public (اتركه فاضي)
- **USING expression:** `true`
- اضغط **Review** ثم **Save policy**

### Policy 2 — السماح للجميع بالإضافة:
- **Policy name:** `Allow insert`
- **Allowed operation:** INSERT
- **Target roles:** public
- **WITH CHECK expression:** `true`
- اضغط **Review** ثم **Save policy**

### Policy 3 — السماح للجميع بالتعديل:
- **Policy name:** `Allow update`
- **Allowed operation:** UPDATE
- **Target roles:** public
- **USING expression:** `true`
- **WITH CHECK expression:** `true`
- اضغط **Review** ثم **Save policy**

---

## الخطوة 4 — تفعيل Realtime

عشان الطلبات تظهر فوراً عند الشيف والكاشير:

1. من القائمة اضغط **Database** ثم **Replication**
2. تحت **Supabase Realtime** ابحث عن جدول `orders`
3. فعّل التبديل بجانبه ✅

---

## الخطوة 5 — الحصول على بيانات الاتصال

1. من القائمة اضغط **Project Settings** (الترس ⚙️)
2. اضغط **API**
3. انسخ هذين:
   - **Project URL** — يبدأ بـ `https://xxxx.supabase.co`
   - **anon public** key — سلسلة طويلة تحت "Project API keys"

---

## الخطوة 6 — ضعها في المشروع

افتح ملف `src/supabase.js` في المشروع وضع البيانات:

```js
const SUPABASE_URL = "https://xxxx.supabase.co"   // ← Project URL
const SUPABASE_KEY = "eyJhbGc..."                  // ← anon public key
```

---

## ✅ انتهيت!

بعد ما تحط البيانات شغّل المشروع:

```bash
npm install
npm run dev
```

وافتح `http://localhost:5173` — الطلبات الحين تتزامن بين كل الأجهزة فوراً! 🎉

---

## 🔗 روابط الموظفين

| الواجهة | الرابط |
|---------|--------|
| الزبون | `yoursite.com/` |
| المطبخ | `yoursite.com/kitchen` |
| الكاشير | `yoursite.com/cashier` |
| المدير | `yoursite.com/manager` |
