import express from "express";
import { config } from "dotenv";
import parser from "cookie-parser";
import AuthRoutes from "./routes/Auth.route.js";
import ProductRoutes from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import { connectDB } from "./library/db.js";
import cuponsRoute from "./routes/cuponsRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import path from "path";
const app = express();

config();

app.use(parser());
app.use(express.json({ limit: "10mb" }));
const port = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use("/api/auth", AuthRoutes);
app.use("/api/product", ProductRoutes);
app.use("/api/cart", cartRoute);
app.use("/api/cupons", cuponsRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
  });
}

app.listen(port, () => {
  connectDB();
  console.log(`Server running on port:${port}`);
});
