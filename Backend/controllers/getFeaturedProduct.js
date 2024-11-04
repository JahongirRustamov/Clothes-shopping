import { redis } from "../library/redis.js";
import ProductModel from "../models/product.model.js";

export async function getFeaturedProduct(req, res) {
  try {
    let featuredProduct = await redis.get("featured_products");
    if (featuredProduct) {
      return res.json(JSON.parse(featuredProduct));
    }

    featuredProduct = await ProductModel.find({ isFeatured: true }).lean();
    if (!featuredProduct) {
      return res.status(404).json({ message: "No featured products found ❎" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProduct));

    res.json(featuredProduct);
  } catch (error) {
    console.log("Error in getFeaturedProduct:", error.message);
    res.status(500).json({ message: "Server error:", error: error.message });
  }
}
