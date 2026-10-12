/**
 * Kai RegAI — Standalone Backend Server Runner
 */
import { Server } from './api/Server.js';

const server = new Server();

async function main() {
  try {
    const { port, host } = await server.start();
    console.log(`[Kai RegAI Backend] Server listening at http://${host}:${port}`);
    console.log(`[Kai RegAI Backend] Health check available at http://${host}:${port}/api/v1/health`);
  } catch (err) {
    console.error('[Kai RegAI Backend] Failed to start:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n[Kai RegAI Backend] Gracefully shutting down...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

main();
