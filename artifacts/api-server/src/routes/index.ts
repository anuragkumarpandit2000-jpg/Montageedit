import { Router, type IRouter } from "express";

import healthRouter from "./health";
import storageRouter from "./storage";
import authRouter from "./auth";
import videosRouter from "./videos";
import reviewsRouter from "./reviews";
import statsRouter from "./stats";

const router: IRouter = Router();

/* ✅ ALL ROUTES */
router.use(healthRouter);
router.use(storageRouter);
router.use(authRouter); // yahi important hai
router.use(videosRouter);
router.use(reviewsRouter);
router.use(statsRouter);

export default router;
