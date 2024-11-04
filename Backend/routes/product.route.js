import express from "express";
import {
  deleteProduct,
  getAllProducts,
  getProductByCategory,
  getReacommendedProduct,
  toggleFeaturedProduct,
} from "../controllers/Product.controller.js";
import { ProtectRoute } from "../middleware/ProtectRoute.js";
import { AdminRoute } from "../middleware/AdminRoute.js";
import { getFeaturedProduct } from "../controllers/getFeaturedProduct.js";
import { createProduct } from "../controllers/createProduct.controller.js";
const router = express.Router();

router.get("/", ProtectRoute, AdminRoute, getAllProducts);

router.get("/featured", getFeaturedProduct);

router.get("/recommendations", getReacommendedProduct);

router.get("/category/:category", getProductByCategory);

router.post("/", ProtectRoute, AdminRoute, createProduct);

router.delete("/:id", ProtectRoute, AdminRoute, deleteProduct);

router.patch("/:id", ProtectRoute, AdminRoute, toggleFeaturedProduct);

export default router;
