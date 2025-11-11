import axios from "axios";

// Ganti baseURL sesuai alamat Laravel kamu
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Tambahkan token secara otomatis kalau user sudah login
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
