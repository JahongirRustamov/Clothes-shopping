import axios from "axios";

const axoisInstance = axios.create({
  baseURL:
    import.meta.mode === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});

export default axoisInstance;
