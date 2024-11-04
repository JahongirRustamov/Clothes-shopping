import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";
export async function addToCart(req, res) {
  try {
    const { productID } = req.body;
    const user = req.user;
    // productID bo'sh emasligini va to'g'ri formatda ekanligini tekshirish
    if (!mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Mahsulot savatda borligini tekshirish
    const existingItem = user.cardItems.find(
      (item) => item._id && item._id.toString() === productID.toString()
    );
    console.log("existingItem:", existingItem);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cardItems.push(productID);
    }
    const newInfo = await user.save();
    res.json(newInfo.cardItems);
  } catch (error) {
    console.log("Error in addToCart controller:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function removeAllFromCart(req, res) {
  try {
    const { ProductID } = req.body;
    console.log("ProductID:", ProductID);
    const user = req.user;
    if (!ProductID) {
      user.cardItems = [];
    } else {
      user.cardItems = user.cardItems.filter(
        (item) => item._id.toString() !== ProductID.toString()
      );
    }
    await user.save();
    res.json(user.cardItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller:", error.message);
    res.status(500).json({ message: "Server Error:", error: error.message });
  }
}

export async function updateQuantity(req, res) {
  try {
    const { id: ProductID } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existItem = user.cardItems.find(
      (item) => item._id.toString() === ProductID.toString()
    );

    if (existItem) {
      existItem.quantity = quantity;
      await user.save();
      res.json(user.cardItems);
    } else {
      return res.status(404).json({ message: "Product not found ❎" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller:", error.message);
    res.status(500).json({ message: "Server Error:", error: error.message });
  }
}

export async function getAllProductFromCart(req, res) {
  try {
    // Savatchadagi mahsulotlar ID'larini olish
    const products = await ProductModel.find({
      _id: { $in: req.user.cardItems.map((item) => item._id) }, // faqat product ID'sini olish
    });

    // Har bir mahsulotga savatchadagi miqdorni qo'shish
    const cartItems = products.map((product) => {
      // Savatchadagi tegishli mahsulotni topish (ObjectId va String bo'lishi mumkin)
      const item = req.user.cardItems.find(
        (cartItem) => cartItem._id.toString() === product._id.toString()
      );
      console.log("item:", item); // Tekshirish uchun log

      return {
        ...product.toObject(), // Mahsulot ma'lumotlari
        quantity: item ? item.quantity : 0, // Miqdor qo'shish
      };
    });

    console.log(cartItems); // Savatcha ma'lumotlarini ko'rsatish
    res.json(cartItems); // Natijani jo'natish
  } catch (error) {
    console.log("getCartProducts controllerida xato:", error.message);
    res.status(500).json({ message: "Serverda xato", error: error.message });
  }
}
