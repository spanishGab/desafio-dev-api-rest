import cors from 'cors';

export interface ISuccessResponse {
  uuid: string;
  message: string;
}

class App {
  app: express.Application;

  constructor() {
    this.app = express();
  }

  private middleware(): void {
    this.app.use(cors());
  }
}
