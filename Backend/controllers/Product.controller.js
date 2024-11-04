import imagekit from "../library/ImageKit.js";
import { redis } from "../library/redis.js";
import ProductModel from "../models/product.model.js";

export async function getAllProducts(req, res) {
  try {
    const products = await ProductModel.find({});
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getAllProducts:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await ProductModel.findById(req.params.id); // req.params.id ishlatish

    if (!product)
      return res.status(404).json({ message: "Product not found ❎" });

    if (product.fileId) {
      try {
        await imagekit.deleteFile(product.fileId); // ImageKit fayl ID bilan o'chirish
      } catch (error) {
        console.log("Error in deleting image from ImageKit:", error.message);
      }
    }

    // Bu yerda id o'rniga req.params.id ishlatish kerak
    await ProductModel.findByIdAndDelete(req.params.id); // id o'rniga req.params.id ishlatildi

    res.json({ message: "Deleted Product successfully ✂️" });
  } catch (error) {
    console.log("Error in DeleteProduct Controller:", error.message);
    res.status(500).json({ message: "Server error:", error: error.message });
  }
}

export async function getReacommendedProduct(req, res) {
  try {
    const products = await ProductModel.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          description: 1,
          image: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log("Error in RecommendedProduct Controller:", error.message);
    res.status(500).json({ message: "Server error:", error: error.message });
  }
}

export async function getProductByCategory(req, res) {
  const { category } = req.params;
  try {
    const products = await ProductModel.find({ category: category });
    res.json({ products });
  } catch (error) {
    console.log("Error in getProductByCategory Controller:", error.message);
    res.status(500).json({ message: "Server error:", error: error.message });
  }
}

export async function toggleFeaturedProduct(req, res) {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductCache();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found ❎" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct Controller:", error.message);
    res.status(500).json({ message: "Server error:", error: error.message });
  }
}

async function updateFeaturedProductCache() {
  try {
    const product = await ProductModel.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(product));
  } catch (error) {
    console.log("Error in updateFeaturedProductCache function ⁉️");
  }
}
