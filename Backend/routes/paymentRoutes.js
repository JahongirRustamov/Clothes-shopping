import express from "express";
import { ProtectRoute } from "../middleware/ProtectRoute.js";
import {
  CheckOutSuccess,
  CreateCheckOutSession,
} from "../controllers/paymentRoutes.controller.js";

const router = express.Router();

router.post("/create-checkout-session", ProtectRoute, CreateCheckOutSession);
router.post("/checkout-success", ProtectRoute, CheckOutSuccess);

export default router;
