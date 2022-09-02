import { Server } from 'http';

import logger from './utils/Logger';
import app from './app';
import dbClient from './db';

const PORT = 8080;

class AccountServer {
  static run(): Server {
    return app.listen(PORT, () => {
      logger.info({
        event: 'AccountServer.run',
        details: `Server is up and running at port ${PORT}`,
      });
    });
  }
}

const server = AccountServer.run();

const handleShutdown = async () => {
  await dbClient.$disconnect();
  server.close(() => {
    logger.info({
      event: 'handleShutdown',
      details: 'Server is beeing closed! Thank you for the preference.',
    });
  })
};

process.on('exit', handleShutdown);
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('SIGHUP', handleShutdown);
