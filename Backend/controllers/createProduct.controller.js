import imagekit from "../library/ImageKit.js";
import ProductModel from "../models/product.model.js";

export async function createProduct(req, res) {
  try {
    const { name, description, price, image, category } = req.body;
    let imageUrl = null;
    let fileId = null; // fileId uchun dastlabki qiymat

    if (image) {
      const uploadResponse = await imagekit.upload({
        file: image, // Bu yerda rasmning ma'lumotlari (base64 yoki URL yoki fayl yo'li)
        fileName: `All images of website`, // Rasm nomini o'zingiz belgilashingiz mumkin
        folder: "/Products", // Rasm yuklanadigan papka
      });

      // Yuklangan rasmning URL va fileId manzilini olish
      imageUrl = uploadResponse.url;
      fileId = uploadResponse.fileId;
    }

    const newProduct = await ProductModel({
      name,
      description,
      image: imageUrl ? imageUrl : "", 
      price,
      category,
      fileId: fileId ? fileId : "", 
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.log("Error in CreateProduct controller:", error.message);
    res.status(500).json({ message: "Server error:", error: error.message });
  }
}
