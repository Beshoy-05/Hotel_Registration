// src/api.js
import axios from "axios";

const API_BASE_URL = "/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("jwt_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to read token from localStorage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= Helper: Extract error message =================
export function extractError(err) {
  const res = err?.response;

  if (!res) return err?.message || "Network error";

  if (res.data) {
    if (typeof res.data === "string") return res.data;
    if (res.data.error) return res.data.error;
    if (res.data.message) return res.data.message;
    if (res.data.detail) return res.data.detail;
  }

  return `Server error (${res.status})`;
}

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("some_session_key");
      } catch (e) {
        console.warn("Failed to clear auth storage", e);
      }
      if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

// ==================================================
//  Auth (updated -> includes getMe & multipart update)
// ==================================================
export const login = (data) => API.post("/Auth/login", data);
export const register = (data) => API.post("/Auth/register", data);
export const forgotPassword = (data) => API.post("/Auth/forgot-password", data);
export const resetPassword = (data) => API.post("/Auth/reset-password", data);
export const googleLogin = (token) => API.post("/Auth/google-login", { token });

// get current user (calls GET /api/Auth/me)
export const getMe = () => API.get("/Auth/me");

// update profile (JSON)
export const updateProfile = (data) => API.put("/Auth/update-profile", data);

// update profile (FormData) — do NOT set Content-Type here; browser/axios handles it
export const updateProfileMultipart = (formData) =>
  API.put("/Auth/update-profile", formData);

// ==================================================
// Rooms
// ==================================================
export const getRooms = () => API.get("/Rooms");
export const getRoom = (id) => API.get(`/Rooms/${id}`);
export const searchRooms = (params) => API.get("/Rooms/search", { params });
export const addReview = (data) => API.post("/Reviews", data);
export const getReviews = (roomId) => API.get(`/Reviews/${roomId}`);
export const getBookedDates = (roomId) => API.get(`/Rooms/${roomId}/booked-dates`);
// للأدمن فقط - ملاحظة: لو تستخدم FormData() لا تضبط Content-Type يدوياً
export const createRoom = (data) =>
  API.post("/Rooms", data /*, { headers: { "Content-Type": "multipart/form-data" } }*/);
export const updateRoom = (id, data) =>
  API.put(`/Rooms/${id}`, data /*, { headers: { "Content-Type": "multipart/form-data" } }*/);
export const deleteRoom = (id) => API.delete(`/Rooms/${id}`);

// ==================================================
//  Bookings
// ==================================================
export const createBooking = (data) => API.post("/Bookings", data);
export const myBookings = () => API.get("/Bookings/my-bookings");
export const getBooking = (id) => API.get(`/Bookings/${id}`);
export const cancelBooking = (id) => API.put(`/Bookings/${id}/cancel`);

// ==================================================
// Payment
// ==================================================
export const checkPaymentStatus = (paymentIntentId) =>
  API.get(`/Payment/status/${encodeURIComponent(paymentIntentId)}`);

export const getPaymentStatus = checkPaymentStatus;
export const createPaymentIntent = (bookingId) =>
  API.post("/Payment/create-payment-intent", { bookingId });
export const confirmPayment = (bookingId) => API.post("/Payment/confirm-payment", { bookingId });

// ==================================================
// Contact & Messages
// ==================================================
export const sendMessage = (data) => API.post("/Contact/send-message", data);
export const getMessages = () => API.get("/Admin/messages");
export const getMessage = (id) => API.get(`/Admin/messages/${id}`);
export const markMessageRead = (id) => API.put(`/Admin/messages/${id}/mark-read`);
export const deleteMessage = (id) => API.delete(`/Admin/messages/${id}`);

// ==================================================
//  Admin Dashboard
// ==================================================
export const getUsers = () => API.get("/Admin/users");
export const getUser = (id) => API.get(`/Admin/users/${id}`);
export const assignRole = (id, data) => API.post(`/Admin/users/${id}/assign-role`, data);
export const removeRole = (id) => API.post(`/Admin/users/${id}/remove-role`, {});

export const getAdminBookings = () => API.get("/Admin/bookings");
export const approveBooking = (id) => API.put(`/Admin/bookings/${id}/approve`);
export const rejectBooking = (id) => API.delete(`/Admin/bookings/${id}/reject`);
export const completeBooking = (id) => API.put(`/Admin/bookings/${id}/complete`);

// ==================================================
//  Services
// ==================================================
export const getServices = () => API.get("/Services");
export const createService = (data) => API.post("/Services", data);
export const deleteService = (id) => API.delete(`/Services/${id}`);
export const updateService = (id, data) => API.put(`/Services/${id}`, data);

export default API;
