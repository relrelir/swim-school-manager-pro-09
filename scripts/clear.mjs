/**
 * clear.mjs — Firebase Emulator cleanup script
 * Deletes all seed data from Firestore emulator collections.
 *
 * Usage:
 *   node scripts/clear.mjs
 *
 * The Firebase emulator must be running (firebase emulators:start).
 */

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ projectId: 'swim-academy-2026' });
const db  = getFirestore(app);

const COLLECTIONS = [
  'seasons',
  'pools',
  'products',
  'participants',
  'registrations',
  'payments',
  'healthDeclarations',
  'leads',
];

/** Delete all documents in a collection in batches of 499 */
async function clearCollection(name) {
  let total = 0;
  let snapshot;
  do {
    snapshot = await db.collection(name).limit(499).get();
    if (snapshot.empty) break;
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    total += snapshot.size;
    process.stdout.write(`\r  🗑  ${name}: ${total} deleted...`);
  } while (snapshot.size === 499);
  console.log(`\r  ✓  ${name}: ${total} documents deleted.   `);
}

async function main() {
  console.log('🧹 Clearing Firestore emulator data...\n');
  for (const col of COLLECTIONS) {
    await clearCollection(col);
  }
  console.log('\n✅ All collections cleared.');
}

main().catch(err => { console.error('❌ Clear failed:', err); process.exit(1); });
