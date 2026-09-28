import { Router } from "express";
import {
  listHistoryHandler,
  showHistoryHandler,
  deleteHistoryHandler,
} from "../controllers/history.controller.js";

const router = Router();

router.get("/", listHistoryHandler);
router.get("/:id", showHistoryHandler);
router.delete("/:id", deleteHistoryHandler);

export default router;