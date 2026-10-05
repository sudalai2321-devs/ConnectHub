const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    const { isMemory } = await connectDB();

    // Convenience for the embedded dev database: seed demo data the first time.
    // (Seed logic lives in server/seed and is completely separate from app logic.)
    if (isMemory) {
      const { seedIfEmpty } = require('./seed/seedData');
      await seedIfEmpty();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 ConnectHub running at http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Set a different PORT in .env.`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      shutdown(1);
    });

    let closing = false;
    async function shutdown(code = 0) {
      if (closing) return;
      closing = true;
      server.close();
      await disconnectDB();
      process.exit(code);
    }

    process.on('SIGINT', () => shutdown(0));
    process.on('SIGTERM', () => shutdown(0));
    process.once('SIGUSR2', async () => {
      // nodemon restart signal
      await disconnectDB();
      process.kill(process.pid, 'SIGUSR2');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('   Check MONGO_URI in your .env file (see README → Troubleshooting).');
    await disconnectDB();
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

start();
