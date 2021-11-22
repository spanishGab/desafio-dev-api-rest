import cors from 'cors';
import express, {Request, Response, NextFunction} from "express";

class App {
    app: express.Application;

    constructor () {
        this.app = express();
    }

    private middleware(): void {
        this.app.use(cors());
    }
}
