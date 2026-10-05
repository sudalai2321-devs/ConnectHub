/**
 * CLI seed script.
 *   npm run seed           → wipe and load demo data
 *   npm run seed:destroy   → wipe all data
 *
 * When using the embedded database (MONGO_URI=memory) stop the server first,
 * because only one process can open the database files at a time.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase, clearDatabase } = require('./seedData');

(async () => {
  try {
    await connectDB();
    if (process.argv.includes('--destroy')) {
      await clearDatabase();
      console.log('🧹 All data removed.');
    } else {
      await seedDatabase();
    }
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    if (/lock|already in use|DBPathInUse/i.test(err.message)) {
      console.error('   The embedded database is in use — stop the running server and try again.');
    }
    await disconnectDB();
    process.exit(1);
  }
})();
