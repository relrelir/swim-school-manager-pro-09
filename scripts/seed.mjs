/**
 * seed.mjs — Firebase Emulator seed script
 * Populates Firestore with realistic QA data:
 *   3 seasons · 3 pools · 150 products · 2000+ registrations
 *   ~1400 payments · ~800 health declarations · 200 leads
 *
 * Usage:
 *   1. firebase emulators:start          (terminal 1)
 *   2. node scripts/seed.mjs             (terminal 2)
 */

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const app = initializeApp({ projectId: 'swim-academy-2026' });
const db  = getFirestore(app);

// ─── Helpers ────────────────────────────────────────────────────────────────

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr)     { return arr[rnd(0, arr.length - 1)]; }
function uuid()        { return crypto.randomUUID(); }

const FIRST_NAMES = [
  'מיכל','דניאל','שירה','יוסי','רחל','אבי','תמר','עומר',
  'לירן','נועה','גל','עידן','מאיה','איתי','רוני','עמית',
  'הילה','ניר','ינון','כרמל','אלון','ליאת','שחר','בן',
  'עדי','ים','אורן','דורון','ינאי','מור'
];
const LAST_NAMES = [
  'כהן','לוי','מזרחי','פרץ','ישראלי','אברהם','דוד','אדלר',
  'גולדברג','שפירו','שמש','ביטון','אוחנה','רוזן','כץ',
  'סיטבון','חדד','טל','בן-דוד','נחמן','קריב','סרוסי',
  'אזולאי','בוזגלו','חיון','בן-שושן','חורי','נסים'
];

/** Israeli ID — Luhn checksum */
function generateIsraeliId() {
  const digits = Array.from({ length: 8 }, () => rnd(1, 9));
  const sum = digits.reduce((s, d, i) => {
    const n = d * ((i % 2) + 1);
    return s + (n > 9 ? n - 9 : n);
  }, 0);
  digits.push((10 - (sum % 10)) % 10);
  return digits.join('').padStart(9, '0');
}

function randomPhone() { return `05${rnd(0,9)}${rnd(1000000,9999999)}`; }
function randomEmail(first, last) {
  return `${first.replace(/[^a-zA-Zא-ת]/g, '')}${rnd(1,99)}@example.com`
    .replace(/[א-ת]/g, c => String.fromCharCode(c.charCodeAt(0) % 26 + 97));
}
function randomDate(from, to) {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return new Date(f + Math.random() * (t - f)).toISOString().slice(0, 10);
}

/** Write items to Firestore in batches of 499 */
async function writeBatch(collectionName, items) {
  const BATCH_SIZE = 499;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = items.slice(i, i + BATCH_SIZE);
    chunk.forEach(item => {
      const ref = db.collection(collectionName).doc(item.id);
      const { id, ...data } = item;
      batch.set(ref, data);
    });
    await batch.commit();
    const done = Math.min(i + BATCH_SIZE, items.length);
    console.log(`  ✓ ${collectionName}: ${done}/${items.length}`);
  }
}

// ─── Static data ─────────────────────────────────────────────────────────────

const seasons = [
  { id: 'season-summer-2025',  name: 'קיץ 2025',       startDate: '2025-07-01', endDate: '2025-08-31', createdAt: '2025-06-01', updatedAt: '2025-06-01' },
  { id: 'season-winter-25-26', name: 'חורף 2025/26',   startDate: '2025-10-01', endDate: '2026-03-31', createdAt: '2025-09-01', updatedAt: '2025-09-01' },
  { id: 'season-summer-2026',  name: 'קיץ 2026',       startDate: '2026-07-01', endDate: '2026-08-31', createdAt: '2026-06-01', updatedAt: '2026-06-01' },
];

const pools = [
  { id: 'pool-olympic',  name: 'בריכה אולימפית',  seasonId: 'season-winter-25-26' },
  { id: 'pool-children', name: 'בריכת ילדים',      seasonId: 'season-winter-25-26' },
  { id: 'pool-indoor',   name: 'בריכה מקורה',      seasonId: 'season-winter-25-26' },
];

// ─── Product factory ─────────────────────────────────────────────────────────

const DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי'];
const TIMES = ['07:00','08:00','09:00','10:00','11:00','16:00','17:00','18:00','19:00'];

const productDefs = [
  // private  (max=1)  × 20
  ...Array.from({ length: 20 }, (_, i) => ({
    type: 'פרטי', maxParticipants: 1,
    price: rnd(200, 350), name: `שיעור פרטי #${i + 1}`,
    daysOfWeek: [pick(DAYS)], meetingsCount: rnd(4, 12),
  })),
  // pairs    (max=2)  × 20
  ...Array.from({ length: 20 }, (_, i) => ({
    type: 'זוגי', maxParticipants: 2,
    price: rnd(160, 280), name: `שיעור זוגי #${i + 1}`,
    daysOfWeek: [pick(DAYS)], meetingsCount: rnd(4, 12),
  })),
  // trio     (max=3)  × 20
  ...Array.from({ length: 20 }, (_, i) => ({
    type: 'שלישייה', maxParticipants: 3,
    price: rnd(130, 220), name: `שלישייה #${i + 1}`,
    daysOfWeek: [pick(DAYS)], meetingsCount: rnd(4, 12),
  })),
  // group course (max=10) × 40
  ...Array.from({ length: 40 }, (_, i) => ({
    type: 'קורס', maxParticipants: 10,
    price: rnd(400, 800), name: `קורס קבוצתי #${i + 1}`,
    daysOfWeek: [pick(DAYS), pick(DAYS)].filter((d, idx, a) => a.indexOf(d) === idx),
    meetingsCount: rnd(8, 20),
  })),
  // club     (max=10) × 30
  ...Array.from({ length: 30 }, (_, i) => ({
    type: 'חוג', maxParticipants: 10,
    price: rnd(300, 600), name: `חוג שחייה #${i + 1}`,
    daysOfWeek: [pick(DAYS)], meetingsCount: rnd(10, 24),
  })),
  // camp     (max=60) × 20
  ...Array.from({ length: 20 }, (_, i) => ({
    type: 'קייטנה', maxParticipants: 60,
    price: rnd(800, 1800), name: `קייטנה #${i + 1}`,
    daysOfWeek: ['ראשון','שני','שלישי','רביעי','חמישי'],
    meetingsCount: rnd(5, 15),
  })),
];

function buildProducts() {
  const poolIds = pools.map(p => p.id);
  return productDefs.map((def, idx) => {
    const poolId = pick(poolIds);
    const season = seasons[rnd(0, 2)];
    const discountAmount = rnd(0, 1) === 1 ? rnd(10, 50) : 0;
    const effectivePrice = def.price - discountAmount;
    return {
      id: `product-${idx + 1}`,
      name: def.name,
      type: def.type,
      maxParticipants: def.maxParticipants,
      price: def.price,
      discountAmount,
      effectivePrice,
      seasonId: season.id,
      poolId,
      daysOfWeek: def.daysOfWeek,
      meetingsCount: def.meetingsCount,
      startDate: season.startDate,
      endDate: season.endDate,
      startTime: pick(TIMES),
      createdAt: season.startDate,
      updatedAt: season.startDate,
    };
  });
}

// ─── Participant factory ──────────────────────────────────────────────────────

function buildParticipants(count) {
  const usedIds = new Set();
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST_NAMES);
    const last  = pick(LAST_NAMES);
    let idNum;
    do { idNum = generateIsraeliId(); } while (usedIds.has(idNum));
    usedIds.add(idNum);
    return {
      id: `participant-${i + 1}`,
      firstName: first,
      lastName: last,
      idNumber: idNum,
      phone: randomPhone(),
      email: randomEmail(first, last),
      healthApproval: false,
      createdAt: randomDate('2025-06-01', '2026-03-01'),
    };
  });
}

// ─── Registration + payment factory ──────────────────────────────────────────

function buildRegistrationsAndPayments(products, participants) {
  const registrations = [];
  const payments = [];

  // Track how many registrations each product already has
  const productFill = {};
  products.forEach(p => { productFill[p.id] = 0; });

  let regIdx = 0;
  let payIdx = 0;

  // Shuffle participants for random assignment
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  let participantCursor = 0;

  for (const product of products) {
    const fillTarget = Math.min(
      product.maxParticipants,
      Math.max(1, Math.floor(product.maxParticipants * (0.7 + Math.random() * 0.3)))
    );

    for (let slot = 0; slot < fillTarget; slot++) {
      if (participantCursor >= shuffled.length) {
        participantCursor = 0; // wrap around — multiple products per participant is realistic
      }
      const participant = shuffled[participantCursor++];
      regIdx++;

      const regDate = randomDate('2025-06-01', '2026-03-15');
      const requiredAmount = product.effectivePrice;
      const discountAmount = rnd(0, 1) === 1 ? rnd(0, Math.floor(requiredAmount * 0.1)) : 0;
      const finalRequired  = requiredAmount - discountAmount;

      // Decide payment status: 30% unpaid, 40% full, 30% partial
      const rand = Math.random();
      let paidAmount = 0;
      if (rand > 0.7) {
        paidAmount = finalRequired;           // paid in full
      } else if (rand > 0.3) {
        paidAmount = Math.floor(finalRequired * (0.3 + Math.random() * 0.6)); // partial
      }

      const regId = `registration-${regIdx}`;
      registrations.push({
        id: regId,
        participantId: participant.id,
        productId: product.id,
        requiredAmount: finalRequired,
        paidAmount,
        discountAmount,
        discountApproved: discountAmount > 0,
        receiptNumber: paidAmount > 0 ? `${rnd(1000, 9999)}` : '',
        registrationDate: regDate,
        createdAt: regDate,
        updatedAt: regDate,
      });

      // Create payment record(s) if money was paid
      if (paidAmount > 0) {
        // Sometimes split into 2 payments
        if (paidAmount > 200 && Math.random() > 0.6) {
          const firstPay = Math.floor(paidAmount * (0.4 + Math.random() * 0.3));
          const secondPay = paidAmount - firstPay;
          [firstPay, secondPay].forEach((amount, pi) => {
            payIdx++;
            payments.push({
              id: `payment-${payIdx}`,
              registrationId: regId,
              amount,
              paymentDate: randomDate(regDate, '2026-03-25'),
              receiptNumber: `${rnd(1000, 9999)}`,
              createdAt: regDate,
            });
          });
        } else {
          payIdx++;
          payments.push({
            id: `payment-${payIdx}`,
            registrationId: regId,
            amount: paidAmount,
            paymentDate: randomDate(regDate, '2026-03-25'),
            receiptNumber: `${rnd(1000, 9999)}`,
            createdAt: regDate,
          });
        }
      }
    }
  }

  return { registrations, payments };
}

// ─── Health declarations ──────────────────────────────────────────────────────

function buildHealthDeclarations(participants, fraction = 0.4) {
  const count = Math.floor(participants.length * fraction);
  return participants.slice(0, count).map((p, i) => ({
    id: `health-${i + 1}`,
    participantId: p.id,
    token: uuid(),
    formStatus: pick(['הוגש', 'הוגש', 'הוגש', 'ממתין']),
    signature: 'data:image/png;base64,stub',
    parentName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    parentId: generateIsraeliId(),
    submissionDate: randomDate('2025-06-01', '2026-03-01'),
    notes: '',
    createdAt: p.createdAt,
  }));
}

// ─── Leads ────────────────────────────────────────────────────────────────────

const LEAD_SOURCES = ['אתר', 'המלצה', 'פייסבוק', 'אינסטגרם', 'טלפון'];
const LEAD_STATUSES = ['ליד חדש', 'בטיפול', 'רשום', 'לא רלוונטי'];
const INTERESTED_TYPES = ['קורס', 'חוג', 'קייטנה', 'פרטי'];

function buildLeads(count = 200) {
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST_NAMES);
    const last  = pick(LAST_NAMES);
    const createdAt = randomDate('2025-05-01', '2026-03-01');
    return {
      id: `lead-${i + 1}`,
      name: `${first} ${last}`,
      phone: randomPhone(),
      email: randomEmail(first, last),
      status: pick(LEAD_STATUSES),
      source: pick(LEAD_SOURCES),
      interestedIn: pick(INTERESTED_TYPES),
      interestedInSeasonId: pick(seasons).id,
      convertedToParticipantId: '',
      notes: '',
      marketingConsent: Math.random() > 0.3,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...\n');

  // 1. Seasons
  console.log('📅 Writing seasons...');
  await writeBatch('seasons', seasons);

  // 2. Pools
  console.log('🏊 Writing pools...');
  await writeBatch('pools', pools);

  // 3. Products (150)
  console.log('📦 Building products...');
  const products = buildProducts();
  await writeBatch('products', products);

  // 4. Participants (2 100 to give 2000+ registrations headroom)
  console.log('👥 Building participants...');
  const participants = buildParticipants(2100);
  await writeBatch('participants', participants);

  // 5. Registrations + payments
  console.log('📝 Building registrations & payments...');
  const { registrations, payments } = buildRegistrationsAndPayments(products, participants);
  console.log(`   → ${registrations.length} registrations, ${payments.length} payments`);
  await writeBatch('registrations', registrations);
  await writeBatch('payments', payments);

  // 6. Health declarations (~40% of participants)
  console.log('🏥 Building health declarations...');
  const healthDeclarations = buildHealthDeclarations(participants, 0.4);
  await writeBatch('healthDeclarations', healthDeclarations);

  // 7. Leads (200)
  console.log('📣 Building leads...');
  const leads = buildLeads(200);
  await writeBatch('leads', leads);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('┌─────────────────────────────────────┐');
  console.log('│            Collection totals         │');
  console.log('├─────────────────────────────────────┤');
  console.log(`│  seasons             ${String(seasons.length).padStart(6)}             │`);
  console.log(`│  pools               ${String(pools.length).padStart(6)}             │`);
  console.log(`│  products            ${String(products.length).padStart(6)}             │`);
  console.log(`│  participants        ${String(participants.length).padStart(6)}             │`);
  console.log(`│  registrations       ${String(registrations.length).padStart(6)}             │`);
  console.log(`│  payments            ${String(payments.length).padStart(6)}             │`);
  console.log(`│  healthDeclarations  ${String(healthDeclarations.length).padStart(6)}             │`);
  console.log(`│  leads               ${String(leads.length).padStart(6)}             │`);
  console.log('└─────────────────────────────────────┘');
  console.log('\nNext steps:');
  console.log('  1. Open http://localhost:4000  (Emulator UI) to verify data');
  console.log('  2. Run: npm run dev            (app will connect to emulator)');
  console.log('  3. Login at http://localhost:5173 (any email/pass works in emulator)');
}

main().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
