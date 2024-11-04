import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export async function ProtectRoute(req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "No accessToken provided ‼️" });
    }
    try {
      const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decode.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found 🙅‍♂️" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired ⚠️" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in ProtectRoute:", error.message);
    res
      .status(401)
      .json({ message: "Invalid access token:", error: error.message });
  }
}
