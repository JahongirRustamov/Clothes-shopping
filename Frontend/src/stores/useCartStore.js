import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  loading: false,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const res = await axios.get("/cupons");
      set({ coupon: res.data });
      console.log("res:", res.data);
    } catch (error) {
      console.log("Error in Coupon function:", error);
    }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotal();
    toast.success("Coupon removed");
  },

  applyCoupon: async (code) => {
    try {
      const response = await axios.post("/cupons/validate", { code });
      set({ coupon: response.data, isCouponApplied: true });
      get().calculateTotal();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },

  getCartItems: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data, loading: false });
      get().calculateTotal();
    } catch (error) {
      set({ cart: [], loading: false });
      toast.error(error.response.data.error || "An error occured");
    }
  },

  clearCart: async () => {
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productID: product._id });
      toast.success("Product added to cart 🛒");
      set((prevState) => {
        const existingItems = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItems
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotal();
    } catch (error) {
      toast.error(error.response.data.error || "An error occured");
    }
  },

  calculateTotal: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }
    set({ subtotal, total });
  },

  removeFromCart: async (ProductID) => {
    await axios.delete(`/cart`, { data: { ProductID } });
    set((prevState) => ({
      cart: prevState.cart.filter((item) => item._id !== ProductID),
    }));
    get().calculateTotal();
  },

  updateQuantity: async (ProductID, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(ProductID);
    }
    await axios.put(`/cart/${ProductID}`, { quantity });
    set((prevState) => ({
      cart: prevState.cart.map((item) =>
        item._id === ProductID ? { ...item, quantity } : item
      ),
    }));
    get().calculateTotal();
  },
}));
