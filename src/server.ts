import logger from './utils/Logger';
import app from './app';

const PORT = 8080;

class Server {
  static run(): void {
    app.listen(PORT, () => {
      logger.info({
        event: 'Server.createServer',
        details: `Server is up and running at port ${PORT}`,
      });
    });
  }
}

Server.run();
