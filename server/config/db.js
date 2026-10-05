const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let memoryServer = null;

/**
 * Connects to MongoDB.
 *
 * - If MONGO_URI is a normal connection string (local MongoDB or Atlas) it is used directly.
 * - If MONGO_URI is "memory" (or missing in development), an embedded MongoDB server is
 *   started via mongodb-memory-server and persisted to server/.mongo-data so data survives
 *   restarts. This is a convenience for machines without MongoDB installed — it is still a
 *   real MongoDB server, not a mock.
 *
 * @returns {Promise<{ uri: string, isMemory: boolean }>}
 */
async function connectDB() {
  let uri = (process.env.MONGO_URI || '').trim();
  const isProduction = process.env.NODE_ENV === 'production';
  let isMemory = false;

  if (!uri || uri.toLowerCase() === 'memory') {
    if (isProduction) {
      throw new Error('MONGO_URI must be set to a real MongoDB connection string in production.');
    }

    let MongoMemoryServer;
    try {
      ({ MongoMemoryServer } = require('mongodb-memory-server'));
    } catch (err) {
      throw new Error(
        'MONGO_URI is not set and mongodb-memory-server is not installed. ' +
          'Set MONGO_URI in .env (local MongoDB or Atlas) or run `npm install`.'
      );
    }

    const dbPath = path.join(__dirname, '..', '.mongo-data');
    fs.mkdirSync(dbPath, { recursive: true });

    console.log('⏳ Starting embedded MongoDB (first run may download the MongoDB binary)...');
    memoryServer = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger', dbName: 'connecthub' },
    });
    uri = memoryServer.getUri('connecthub');
    isMemory = true;
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(
    `✅ MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}` +
      (isMemory ? ' (embedded dev server)' : '')
  );

  mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));

  return { uri, isMemory };
}

async function disconnectDB() {
  await mongoose.connection.close().catch(() => {});
  if (memoryServer) {
    await memoryServer.stop({ doCleanup: false }).catch(() => {});
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
