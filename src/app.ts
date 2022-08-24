import express, { Application } from 'express';
import 'express-async-errors';
import cors from 'cors';

import requestContextManager from './middlewares/RequestContextManager';
import routes from './routes';
import { handleError } from './middlewares/errorHanlder';

const app: Application = express();

app.all('*', requestContextManager.createContext);

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(routes);

app.use(handleError);

export default app;
