import express from "express";
import { ProtectRoute } from "../middleware/ProtectRoute.js";
import {
  getCupon,
  validateCoupon,
} from "../controllers/cuponsRoute.controller.js";

const router = express.Router();

router.get("/", ProtectRoute, getCupon);

router.post("/validate", ProtectRoute, validateCoupon);

export default router;
