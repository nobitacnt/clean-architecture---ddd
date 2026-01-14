import 'reflect-metadata';
import { createServer } from './server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main entry point
 */
async function main() {
  try {
    // Create and start server
    const server = await createServer();
    const port = parseInt(process.env.PORT || '3000');
    await server.start(port);

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal} shutting down...`);
      await server.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
main();
