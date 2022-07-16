import fastify, {
  FastifyInstance,
  RequestGenericInterface,
  RouteShorthandOptions,
} from 'fastify';
import { ReplyGenericInterface } from 'fastify/types/reply';

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
  private router: FastifyInstance = fastify();

  public defineInternalRoutes() {}

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
              message: { type: 'string' }
            }
          }
        }
      },
      handler: async (request: RequestGenericInterface, reply: ReplyGenericInterface) => {
        
      }
    })
  }
}
