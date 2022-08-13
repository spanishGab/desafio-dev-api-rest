import { Router } from "express";
import props from "../common/props";

import internalRoutes from "./internal.routes";

export interface ISuccessResponseBody {
  uuid: string;
  message: string;
}

const router = Router();

router.use(props.VERSION, internalRoutes);

export default router;