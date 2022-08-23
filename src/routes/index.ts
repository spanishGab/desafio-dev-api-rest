import { Router } from "express";
import props from "../common/props";

import externalRoutes from "./external.routes";

const router = Router();

router.use(`/${props.VERSION}`, externalRoutes);

export default router;
