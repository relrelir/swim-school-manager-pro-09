# Swim School Manager — Claude Code Context

## Project Overview
A Hebrew RTL swim school management web app. Manages seasons, pools, products (courses/camps),
participant registrations, payments, health declarations, and leads.

**Stack:** React 18 + TypeScript + Vite 6 + TailwindCSS + shadcn/ui + Firebase (Auth + Firestore + Hosting)

**Working directory:** `C:/Users/ariel/Documents/claude/בית ספר לשחיה/swim-school-unified/`

---

## Firebase Project — FULLY CONFIGURED ✅

**Project ID:** `swim-academy-2026`
**Hosting URL:** `https://swim-academy-2026.web.app`
**Region:** `eur3 (Europe)`

All setup tasks completed (March 26, 2026):
- ✅ `.env` filled with real Firebase credentials
- ✅ `.firebaserc` set to `swim-academy-2026`
- ✅ Firestore enabled (production mode, eur3)
- ✅ Authentication enabled (Email/Password)
- ✅ Hosting enabled
- ✅ Admin user created: `relrelir@gmail.com` (UID: `QR87uJsZiMUbZEnEu00ZKwmbchr2`)
- ✅ Firestore `/users/QR87uJsZiMUbZEnEu00ZKwmbchr2` → `{ role: "admin", email: "relrelir@gmail.com" }`

**Web App Config (already in .env):**
```
VITE_FIREBASE_API_KEY=AIzaSyCvsa9UVqH0AKXq9xBkkwhDOpFp4E8CfxE
VITE_FIREBASE_AUTH_DOMAIN=swim-academy-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=swim-academy-2026
VITE_FIREBASE_STORAGE_BUCKET=swim-academy-2026.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=318814337530
VITE_FIREBASE_APP_ID=1:318814337530:web:4d3ce1a0f8e099f7510c43
VITE_FIREBASE_MEASUREMENT_ID=G-PEYKEJ4T8S
```

---

## Architecture

### Firebase Collections (camelCase throughout — no snake_case)
| Collection | Key Fields |
|------------|-----------|
| `/users/{uid}` | `role: 'admin' \| 'viewer'`, `email`, `displayName` |
| `/seasons/{id}` | `name`, `startDate`, `endDate`, `createdAt`, `updatedAt` |
| `/pools/{id}` | `name`, `seasonId` |
| `/products/{id}` | `name`, `type`, `seasonId`, `poolId`, `price`, `discountAmount`, `effectivePrice`, `daysOfWeek[]`, `meetingsCount`, `startDate`, `endDate`, `startTime` |
| `/participants/{id}` | `firstName`, `lastName`, `idNumber`, `phone`, `healthApproval` |
| `/registrations/{id}` | `participantId`, `productId`, `requiredAmount`, `paidAmount`, `discountAmount`, `discountApproved`, `receiptNumber` |
| `/payments/{id}` | `registrationId`, `amount`, `paymentDate`, `receiptNumber` |
| `/healthDeclarations/{id}` | `participantId`, `token`, `formStatus`, `signature`, `parentName`, `parentId`, `submissionDate`, `notes` |
| `/leads/{id}` | `name`, `phone`, `email`, `status`, `source`, `interestedInSeasonId`, `convertedToParticipantId`, `notes` |

### Key Source Files
| Path | Purpose |
|------|---------|
| `src/config/firebase.ts` | Firebase init (app, auth, db, functions) |
| `src/context/AuthContext.tsx` | Firebase Auth + role read from Firestore `/users/{uid}` |
| `src/services/firebase/*.ts` | CRUD for each collection (8 files) |
| `src/context/DataContext.tsx` | Aggregates all 8 providers via `useData()` |
| `src/context/data/*Provider.tsx` | Individual Firestore state managers |
| `src/types/index.ts` | All TypeScript types (camelCase only) |
| `src/pages/DashboardPage.tsx` | Landing page with KPI cards + Recharts |
| `src/pages/LeadsPage.tsx` | Leads management table + filters |
| `src/components/leads/` | LeadStatusBadge, AddLeadDialog |
| `firestore.rules` | Security rules (public form submit, auth-gated reads, admin writes) |
| `firestore.indexes.json` | Composite indexes for all queries |
| `firebase.json` | Hosting config (SPA rewrites to index.html) |

### Routes
| Path | Component | Access |
|------|-----------|--------|
| `/` | DashboardPage | protected |
| `/seasons` | SeasonPage | protected |
| `/season/:id/pools` | PoolsPage | protected |
| `/season/:id/pool/:poolId/products` | ProductsPage | protected |
| `/season/:id/products` | ProductsPage | protected |
| `/product/:id/participants` | ParticipantsPage | protected |
| `/daily-activity` | DailyActivityPage | protected |
| `/leads` | LeadsPage | protected |
| `/report` | ReportPage | admin only |
| `/health-form/:token` | HealthFormPage | **public** |
| `/print/health-declaration?participantId=` | PrintableHealthDeclarationPage | protected |
| `/form-success` | FormSuccessPage | public |

---

## Coding Conventions
- **UI language:** Hebrew strings in UI, English identifiers in code
- **Direction:** All UI uses `dir="rtl"`
- **Types:** camelCase only — never use snake_case in TypeScript interfaces
- **Firebase IDs:** Firestore auto-generates document IDs; never use sequential integers
- **Auth guards:** Always check `isAdmin()` before write operations in UI components
- **Atomic updates:** Use Firestore `writeBatch` for multi-document updates
  - Example: `submitHealthForm` updates both `healthDeclarations` and `participants.healthApproval` atomically
- **No Supabase:** `src/integrations/supabase/` has been deleted. Do not reference or recreate it.
- **Health declarations:** Keyed by `participantId` (not `registrationId` — that was a legacy bug, now fixed)

---

## Remaining Tasks

### Ready to deploy — run these commands:
```bash
firebase login
npm run build
firebase deploy
```

### TODO — המרת ליד לרישום (עדיפות גבוהה)
בעמוד הלידים, בעמודת "פעולות", להוסיף כפתור "הרשם":
- לוחץ → פותח dialog עם שדות רישום (productId, requiredAmount, registrationDate)
- יוצר `Participant` + `Registration` ב-Firestore (`writeBatch`)
- מעדכן `lead.status = 'רשום'` ו-`lead.convertedToParticipantId = participant.id`
- קבצים: `src/pages/LeadsPage.tsx`, `src/services/firebase/participants.ts`, `src/services/firebase/registrations.ts`

### Code improvements (optional, future sessions)
- **Delete legacy hooks:** `src/hooks/useHealthDeclarationDialog.ts` and `src/hooks/useHealthDeclarations.ts`
  define `currentHealthDeclaration` state with old `registrationId` field. They appear unused — safe to delete.
- **LeadsPage "Convert to Registration" action:** When a lead registers, create `Participant` + `Registration`
  atomically via `writeBatch`, then set `lead.convertedToParticipantId`. Status auto-updates to `'נרשם'`.
- **Dashboard revenue chart:** Add a monthly revenue BarChart using Recharts + real payment data.
- **WhatsApp/SMS (optional):** Firebase Function + WATI API. Requires WATI business account.
- **Payment links (optional):** Firebase Function + Cardcom API. Requires Cardcom merchant account.

---

## Running Locally
```bash
# Install dependencies
npm install

# Start dev server (requires .env file with real Firebase credentials)
npm run dev

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase login
firebase deploy
```

## Deploy Checklist
- [x] `.env` filled with real Firebase credentials ✅
- [x] `.firebaserc` updated with correct project ID ✅
- [x] Firebase project: Firestore + Auth (Email/Password) + Hosting all enabled ✅
- [x] First admin user created in Auth Console + Firestore `/users/{uid}` doc exists ✅
- [ ] `npm run build` passes — run locally to verify
- [ ] `firebase deploy` completes successfully
