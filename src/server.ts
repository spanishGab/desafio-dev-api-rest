import express, { Application } from 'express';
import 'express-async-errors';
import cors from 'cors';

import RequestContextManager from './middlewares/RequestContextManager';
import routes from './routes';
import { handleError } from './middlewares/errorHanlder';
import props from './common/props';
import logger from './utils/Logger';

class Server {
  private app: Application = express();

  public createServer(): Application {
    this.prepareMiddlwares();

    this.app.listen(props.PORT, () => {
      logger.info(
        Server.name,
        'createServer',
        `Server is up and running at port ${props.PORT}`,
      );
    });

    return this.app;
  }

  private prepareMiddlwares(): void {
    this.app.all('*', RequestContextManager.createContext);

    this.app.use(cors);

    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(express.json());

    this.app.use(routes);

    this.app.use(handleError);
  }
}

new Server().createServer();
