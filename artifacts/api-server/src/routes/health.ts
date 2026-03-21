import { Router } from "express";

const router = Router();

router.get("/health", (_req: any, res: any) => {
  res.status(200).json({ status: "ok" });
});

export default router;
