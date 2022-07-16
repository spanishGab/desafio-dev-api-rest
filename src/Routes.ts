import fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { ISuccessResponse } from './App';

export const APPLICATION_PATH = {
  INTERNAL: {
    HEALTHCHECK: '/healthcheck',
  },
  EXTERNAL: {
    CREATE_ACCOUNT: '/',
    DEPOSIT: '/deposit',
    BALANCE: '/balance',
    WITHDRAWAL: '/withdrawal',
    BLOCK_ACCOUNT: '/block-account',
    TRANSACTIONS_RECEIPT: '/receipt',
  },
};

export interface IBalanceQueryString {
  account_id: number;
}

class Routes {
  private router: FastifyInstance;

  constructor() {
    this.router = fastify({ logger: true });
  }

  public defineInternalRoutes() {
    this.healthcheck();
  }

  private healthcheck() {
    this.router.route({
      method: 'GET',
      url: APPLICATION_PATH.INTERNAL.HEALTHCHECK,
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              uuid: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        request.log.info({ mesage: 'SYSTEM IS HEALTHY' });
        reply.code(200).send(<ISuccessResponse>{
          uuid: request.id,
          message: 'SYSTEM IS HEALTHY',
        });
      },
    });
  }
}

export default new Routes();
