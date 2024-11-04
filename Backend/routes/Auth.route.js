import express from "express";
import {
  getProfile,
  Login,
  LogOut,
  refreshToken,
  SignUp,
} from "../controllers/Auth.controller.js";
import { ProtectRoute } from "../middleware/ProtectRoute.js";

const router = express.Router();

router.post("/signup", SignUp);

router.post("/login", Login);

router.post("/logout", LogOut);

router.post("/refresh_token", refreshToken);

router.get("/getprofile", ProtectRoute, getProfile);

export default router;
