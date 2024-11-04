import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios.js";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/product", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
      toast.success("Created successfully 🎉");
    } catch (error) {
      toast.error(error.message.data.error);
      set({ loading: false });
    }
  },

  fetchAllProduct: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/product");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      console.log("Error in FetchAllProducts", error.message);
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.res.data.error || "Failed to fetch products ⚠️");
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.delete(`/product/${id}`);
      console.log(res);
      toast.success(res.data.message);
      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response.data.error.message || "Failed to delete product"
      );
    }
  },

  toggleFeaturedProduct: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/product/${id}`);
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === id
            ? { ...product, isFeatured: res.data.isFeatured }
            : product
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.res.data.error || "Failed to update product");
    }
  },

  fetchProductCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/product/category/${category}`);
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response.data.error || "Failed to fetch products");
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/product/featured");
      set({ products: response.data, loading: false });
    } catch (error) {
      console.log(error.message);
      set({ error: "Failed to fetch products", loading: false });
    }
  },
}));
