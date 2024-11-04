import express from "express";
import {
  addToCart,
  getAllProductFromCart,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/AddCart.controller.js";
import { ProtectRoute } from "../middleware/ProtectRoute.js";

const router = express.Router();

router.get("/", ProtectRoute, getAllProductFromCart);

router.post("/", ProtectRoute, addToCart);

router.delete("/", ProtectRoute, removeAllFromCart);

router.put("/:id", ProtectRoute, updateQuantity);

export default router;
