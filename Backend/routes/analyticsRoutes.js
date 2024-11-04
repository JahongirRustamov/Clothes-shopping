import express from "express";
import { ProtectRoute } from "../middleware/ProtectRoute.js";
import { AdminRoute } from "../middleware/AdminRoute.js";
import {
  getAnalyticsData,
  getDailySalesDate,
} from "../controllers/analyticsRoutes.controller.js";

const router = express.Router();

router.get("/", ProtectRoute, AdminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailySalesData = await getDailySalesDate(startDate, endDate);
    res.json({
      analyticsData,
      dailySalesData,
    });
  } catch (error) {
    console.log("Error in analytics route", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
