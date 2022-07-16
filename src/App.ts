import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import routes from './Routes';

export interface ISuccessResponse {
  uuid: string;
  message: string;
}

class App {
  private app: FastifyInstance;

  constructor() {
    this.app = fastify();

    this.middleware();

    this.routes();
  }

  public getApp(): FastifyInstance {
     return this.app;
  }

  private middleware(): void {
    this.app.register(cors);
  }

  private routes() {
    this.app.register(routes.defineInternalRoutes);
  }
}

export default new App();
