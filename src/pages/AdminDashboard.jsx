// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";

import {
  FaUser,
  FaUserShield,
  FaBed,
  FaCalendarCheck,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSignOutAlt,
  FaSync,
  FaImage,
  FaEdit,
  FaConciergeBell,
  FaTag,
  FaClock,
  FaCalendarAlt,
  FaMoon,
  FaFilter
} from "react-icons/fa";

/**
 * AdminDashboard.jsx (UI Enhanced + User Tabs)
 * - Users Section: Added Tabs (All / Admins / Guests)
 * - Users Section: Converted to Table for better management
 * - Pagination: Enhanced UI with better buttons
 * - Preserved ALL previous logic (Images, Warnings, Services, Bookings)
 */

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Data
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [accountsCount, setAccountsCount] = useState(0);
  const [usersWithBookingCount, setUsersWithBookingCount] = useState(0);
  const [roomsBookedNow, setRoomsBookedNow] = useState(0);
  const [roomsFreeNow, setRoomsFreeNow] = useState(0);
  const [nextRoomFree, setNextRoomFree] = useState(null);

  // Pagination State
  const [usersPage, setUsersPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // ✅ New: User Filter Tab State
  const [userFilter, setUserFilter] = useState("all"); // 'all', 'admin', 'user'

  // Add Room
  const [number, setNumber] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  
  // Create: Array for files
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);
  
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Manage Services
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [serviceSubmitting, setServiceSubmitting] = useState(false);

  // Edit service modal
  const [isEditingService, setIsEditingService] = useState(false);
  const [editServiceId, setEditServiceId] = useState(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");
  const [serviceEditSubmitting, setServiceEditSubmitting] = useState(false);

  // Edit Room
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNumber, setEditNumber] = useState("");
  const [editType, setEditType] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  // Edit: Array for new files
  const [editFiles, setEditFiles] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);
  
  const [editServiceIds, setEditServiceIds] = useState([]);
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  // Helpers
  const getAuthHeader = () => {
    const token = localStorage.getItem("jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Pagination Helpers
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };
  const getTotalPages = (data) => Math.ceil(data.length / ITEMS_PER_PAGE);

  // Date Diff Helper
  const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays : 1;
  };

  // ✅ Filter Users Helper
  const getFilteredUsers = () => {
    if (userFilter === "admin") return users.filter(u => u.role === "Admin");
    if (userFilter === "user") return users.filter(u => u.role !== "Admin");
    return users;
  };

  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      localStorage.clear();
    }
    const role = user?.role ? String(user.role).toLowerCase() : "";
    if (!user || role !== "admin") {
      navigate("/signin");
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, [navigate]);

  // Pagination Safety Check
  useEffect(() => {
    if (bookingsPage > getTotalPages(bookings) && bookings.length > 0) setBookingsPage(1);
    
    // Check user pagination against FILTERED list
    const filteredUsersCount = getFilteredUsers().length;
    const totalUserPages = Math.ceil(filteredUsersCount / ITEMS_PER_PAGE);
    if (usersPage > totalUserPages && filteredUsersCount > 0) setUsersPage(1);
    
  }, [bookings, users, userFilter]);

  // Cleanup Object URLs
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
      editPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews, editPreviews]);

  // ---------- loadData ----------
  async function loadData() {
    try {
      setLoading(true);
      const [uRes, bRes, rRes, sRes] = await Promise.all([
        api.get("/Admin/users"),
        api.get("/Admin/bookings"),
        api.get("/Rooms"),
        api.get("/Services"),
      ]);

      const allBookingsRaw = bRes.data || [];
      const allRooms = rRes.data || [];
      const allUsersRaw = uRes.data || [];
      
      const rawServices = sRes.data || [];
      const normalizedServices = (rawServices || []).map((s) => {
        const possible = s.price ?? s.Price ?? s.amount ?? s.cost ?? s.value ?? 0;
        const p = Number(possible);
        return { ...s, price: isNaN(p) ? 0 : p };
      });

      // sort bookings
      const allBookings = [...allBookingsRaw].sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return da - db;
      });

      // sort users
      const parseUserCreatedAt = (u) => {
        if (!u) return null;
        const candidates = [u.createdAt, u.created_at, u.createdOn, u.registeredAt, u.registered_on, u.created];
        for (const c of candidates) {
          if (c) {
            const d = new Date(c);
            if (!isNaN(d.getTime())) return d;
          }
        }
        return null;
      };
      const allUsers = [...allUsersRaw].sort((a, b) => {
        const da = parseUserCreatedAt(a);
        const db = parseUserCreatedAt(b);
        if (da && db) return da.getTime() - db.getTime();
        if (da && !db) return -1;
        if (!da && db) return 1;
        return 0;
      });

      // active bookings list
      const now = new Date();
      const activeList = allBookings.filter((b) => {
        const end = b.endDate ? new Date(b.endDate) : null;
        const status = (b.status || "").toLowerCase();
        if (!end) return false;
        return end.getTime() >= now.getTime() && status !== "cancelled" && status !== "rejected";
      });

      // stats
      const accounts = allUsers.length;

      const getBookingUserKey = (bk) => {
        const u = bk.user || {};
        const possibleId = u.id ?? u.userId ?? bk.userId ?? u._id ?? null;
        if (possibleId) return String(possibleId).trim().toLowerCase();
        return `booking:${bk.id ?? Math.random()}`;
      };

      const userKeys = new Set();
      for (const bk of allBookings) {
        const key = getBookingUserKey(bk);
        if (key) userKeys.add(key);
      }
      const usersWithBookings = userKeys.size;

      const roomIdSetActive = new Set();
      for (const a of activeList) {
        const rid = a.room?.id ?? a.roomId ?? a.room?.roomId;
        if (rid) roomIdSetActive.add(String(rid));
      }
      const roomsBooked = roomIdSetActive.size;
      const roomsTotal = allRooms.length;
      const roomsFree = Math.max(0, roomsTotal - roomsBooked);

      // next free logic
      let nextFree = null;
      if (activeList.length > 0) {
        const sortedByEnd = [...activeList].sort((x, y) => {
          const ex = x.endDate ? new Date(x.endDate).getTime() : Infinity;
          const ey = y.endDate ? new Date(y.endDate).getTime() : Infinity;
          return ex - ey;
        });
        const first = sortedByEnd[0];
        const roomNumber = first.room?.number ?? first.Number ?? first.roomNumber ?? "Unknown";
        const endDate = first.endDate ? new Date(first.endDate) : null;
        if (endDate) nextFree = { roomNumber, date: endDate };
      }

      setUsers(allUsers);
      setBookings(allBookings);
      setRooms(allRooms);
      setServices(normalizedServices);

      setAccountsCount(accounts);
      setUsersWithBookingCount(usersWithBookings);
      setRoomsBookedNow(roomsBooked);
      setRoomsFreeNow(roomsFree);
      setNextRoomFree(nextFree);
    } catch (err) {
      console.error("Error loading data:", err);
      Swal.fire("Error", "Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }

  const safeImageSrc = (r) => {
    const raw = r?.imageUrl ?? r?.image ?? null;
    if (!raw) return "https://via.placeholder.com/400x300?text=No+Image";
    if (String(raw).startsWith("http")) return raw;
    return `https://hotel-booking.runasp.net${raw}`;
  };

  const toggleService = (id, currentList, setList) => {
    if (currentList.includes(id)) setList(currentList.filter((sId) => sId !== id));
    else setList([...currentList, id]);
  };

  // ---------- Users / Roles ----------
  const assignRole = async (userId) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await api.post(`/Admin/users/${userId}/assign-role`, { role: "Admin" });
      Toast.fire({ icon: "success", title: "User promoted to Admin successfully" });
      await reloadUsers();
      setUsersPage(1); // Reset to first page to see changes
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const removeRole = async (userId) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await api.post(`/Admin/users/${userId}/remove-role`, {});
      Toast.fire({ icon: "success", title: "Admin privileges removed" });
      await reloadUsers();
      setUsersPage(1);
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ---------- Services ----------
  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newServiceName) return;
    setServiceSubmitting(true);
    try {
      await api.post("/Services", { name: newServiceName, price: Number(newServicePrice) || 0 });
      Toast.fire({ icon: "success", title: "Service added successfully" });
      setNewServiceName(""); setNewServicePrice("");
      await reloadServices();
    } catch (err) {
      Swal.fire("Error", "Failed to create service", "error");
    } finally {
      setServiceSubmitting(false);
    }
  };

  const openEditService = (s) => {
    setEditServiceId(s.id);
    setEditServiceName(s.name || "");
    setEditServicePrice(String(s.price ?? 0));
    setIsEditingService(true);
  };
  const closeEditService = () => { setIsEditingService(false); };
  
  const submitEditService = async (e) => {
    e.preventDefault();
    if (!editServiceId) return;
    setServiceEditSubmitting(true);
    try {
      await api.put(`/Services/${editServiceId}`, { name: editServiceName, price: Number(editServicePrice) || 0 });
      Toast.fire({ icon: "success", title: "Service updated" });
      await reloadServices();
      closeEditService();
    } catch (err) {
      Swal.fire("Error", "Failed to update service", "error");
    } finally {
      setServiceEditSubmitting(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.delete(`/Services/${id}`);
      Toast.fire({ icon: "success", title: "Service deleted" });
      await reloadServices();
    } catch (err) {
      Swal.fire("Error", "Failed to delete service", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ---------- Rooms create / edit / delete ----------

  const handleFileSelect = (e) => {
      const files = Array.from(e.target.files);
      if(files.length > 0) {
          setSelectedFiles(files);
          const newPreviews = files.map(f => URL.createObjectURL(f));
          setPreviews(newPreviews);
      }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!number || !type || !price || selectedFiles.length === 0) {
      Swal.fire("Missing Info", "Please fill all fields and select at least one image.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("Number", number);
      formData.append("Type", type);
      formData.append("PricePerNight", Number(price));
      formData.append("Description", description ?? "");
      
      selectedFiles.forEach(file => {
          formData.append("Images", file);
      });

      selectedServiceIds.forEach((id) => formData.append("ServiceIds", id));
      
      await api.post("/Rooms", formData, { headers: { ...getAuthHeader() } });
      Swal.fire("Success", "Room created successfully!", "success");
      
      setNumber(""); setType(""); setPrice(""); setDescription("");
      setSelectedFiles([]); setPreviews([]); setSelectedServiceIds([]);
      
      await reloadRooms();
    } catch (error) {
      console.error("Create room error:", error);
      Swal.fire("Error", error?.response?.data?.message || error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (room) => {
    setIsEditing(true);
    setEditId(room.id);
    setEditNumber(room.number || "");
    setEditType(room.type || "");
    setEditPrice(room.pricePerNight || "");
    setEditDescription(room.description || "");
    
    setEditFiles([]);
    setEditPreviews([]);
    
    const existingIds = room.services ? room.services.map((s) => s.id) : [];
    setEditServiceIds(existingIds);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setEditFiles([]);
    setEditPreviews([]);
    setEditDescription("");
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if(files.length > 0) {
        setEditFiles(files);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setEditPreviews(newPreviews);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;
    setEditingSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("Number", editNumber);
      formData.append("Type", editType);
      formData.append("PricePerNight", Number(editPrice));
      formData.append("Description", editDescription ?? "");

      // ✅ Multiple Images Loop
      if (editFiles.length > 0) {
        editFiles.forEach(file => {
            formData.append("Images", file);
        });
      }

      editServiceIds.forEach((id) => formData.append("ServiceIds", id));

      const headers = getAuthHeader();
      if (headers["Content-Type"]) delete headers["Content-Type"];

      await api.put(`/Rooms/${editId}`, formData, { headers });
      Toast.fire({ icon: "success", title: "Room updated successfully" });
      await reloadRooms();
      cancelEdit();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update room.", "error");
    } finally {
      setEditingSubmitting(false);
    }
  };

  const deleteRoom = async (id) => {
    if (!id) return;
    const result = await Swal.fire({
      title: "Delete Room?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    setActionLoading(true);
    try {
      await api.delete(`/Rooms/${id}`, { headers: { ...getAuthHeader() } });
      Swal.fire("Deleted!", "The room has been deleted.", "success");
      await reloadRooms();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Booking actions
 const handleBookingAction = async (id, action) => {
  if (!id || !action) return;
  setActionLoading(true);
  try {
    if (action === "approve") await api.put(`/Admin/bookings/${id}/approve`);
    else if (action === "reject") await api.put(`/Admin/bookings/${id}/reject`);
    else if (action === "complete") await api.put(`/Admin/bookings/${id}/complete`);

    Toast.fire({ icon: "success", title: `Booking ${action}d` });
    await reloadBookings();
  } catch (err) {
    Swal.fire("Error", "Failed to update booking status.", "error");
    await reloadBookings();
  } finally {
    setActionLoading(false);
  }
};

  const handleDeleteBooking = async (id) => {
    if (!id) return;
    const confirm = await Swal.fire({
      title: "Delete booking permanently?",
      text: "Cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
    });

    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      await api.delete(`/Bookings/${id}`, { headers: { ...getAuthHeader() } });
      Toast.fire({ icon: "success", title: "Booking deleted" });
      await reloadBookings();
      setBookingsPage(1); 
    } catch (err) {
      Swal.fire("Error", "Failed to delete booking.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // reload helpers
  const reloadRooms = async () => {
    try {
      const r = await api.get("/Rooms");
      setRooms(r.data || []);
    } catch (e) { console.error(e); }
  };
  const reloadUsers = async () => {
    try {
      const r = await api.get("/Admin/users");
      // simple sort to keep code clean
      setUsers(r.data || []);
    } catch (e) { console.error(e); }
  };
  const reloadBookings = async () => {
    try {
      const r = await api.get("/Admin/bookings");
      const sorted = (r.data || []).sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return da - db;
      });
      setBookings(sorted);
      await loadData();
    } catch (e) { console.error(e); }
  };
  const reloadServices = async () => {
    try {
      const r = await api.get("/Services");
      const normalized = (r.data || []).map((s) => ({ ...s, price: Number(s.price || 0) }));
      setServices(normalized);
    } catch (e) { console.error(e); }
  };

  const styles = {
    fadeIn: { animation: "fadeIn 0.6s ease-out forwards" },
    gradientHeader: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" },
  };

  const renderFewItems = (arr, max = 6) => {
    if (!arr || arr.length === 0) return <small className="text-muted">—</small>;
    const first = arr.slice(0, max);
    const rest = arr.length - first.length;
    return (
      <div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {first.map((x, i) => (
            <span key={i} className="badge bg-light text-dark border" style={{ fontSize: 12 }}>
              {x}
            </span>
          ))}
        </div>
        {rest > 0 && <small className="text-muted">+{rest} more</small>}
      </div>
    );
  };

  // ✅ Get Users to Display based on Tab Filter
  const displayedUsers = getFilteredUsers();

  return (
    <>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
          .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-approved { background: #d4edda; color: #155724; }
          .status-rejected { background: #f8d7da; color: #721c24; }
          .status-refunded { background: #e2e3e5; color: #383d41; }
          .status-completed { background: #cce5ff; color: #004085; }
          .custom-file-upload { display: inline-block; padding: 10px 20px; cursor: pointer; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; width: 100%; text-align: center; }
          .modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1100; backdrop-filter: blur(2px); }
          .service-pill { cursor: pointer; transition: 0.2s; user-select: none; }
          .service-pill:hover { transform: scale(1.05); }
          .service-pill.active { background-color: #667eea; color: white; border-color: #667eea; }
          .nav-pills .nav-link.active { background-color: #667eea; }
          .nav-pills .nav-link { color: #555; cursor: pointer; }
        `}
      </style>

      <div className="min-vh-100" style={{ backgroundColor: "#f4f6f9", paddingBottom: "50px" }}>
        <div className="shadow-sm py-4 px-5 mb-5 d-flex justify-content-between align-items-center" style={styles.gradientHeader}>
          <div>
            <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FaUserShield /> Admin Dashboard
            </h2>
            <small className="opacity-75">Control Panel & Statistics</small>
          </div>
          <div className="d-flex gap-3">
            <button onClick={() => { loadData(); Toast.fire({ icon: "info", title: "Data Refreshed" }); }} className="btn btn-light"><FaSync /></button>
            <button onClick={() => { localStorage.removeItem("user"); localStorage.removeItem("jwt_token"); navigate("/signin"); }} className="btn btn-danger"><FaSignOutAlt /></button>
          </div>
        </div>

        <div className="container" style={styles.fadeIn}>
          
          {/* STATS ROW */}
          <div className="row g-4 mb-4">
             {/* Total Accounts */}
             <StatsCard title="Total Accounts" count={accountsCount} icon={<FaUser />} color="primary" delay="0s" />
             
             {/* Total Bookings */}
             <StatsCard title="Total Bookings" count={bookings.length} icon={<FaCalendarAlt />} color="warning" delay="0.1s" />

             {/* Rooms Occupied */}
             <div className="col-md-3">
               <div className="card border-0 shadow-sm h-100 rounded-4 hover-card">
                 <div className="card-body p-3">
                   <h6 className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: "0.7rem"}}>Rooms Occupied</h6>
                   <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0 fw-bold text-dark">{roomsBookedNow}</h4>
                      <div className="rounded-circle bg-danger bg-opacity-10 p-2 text-danger" style={{ fontSize: "1.2rem" }}><FaBed /></div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Rooms Free */}
             <div className="col-md-3">
               <div className="card border-0 shadow-sm h-100 rounded-4 hover-card">
                 <div className="card-body p-3">
                   <h6 className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: "0.7rem"}}>Rooms Available</h6>
                   <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0 fw-bold text-dark">{roomsFreeNow}</h4>
                      <div className="rounded-circle bg-success bg-opacity-10 p-2 text-success" style={{ fontSize: "1.2rem" }}><FaTag /></div>
                   </div>
                 </div>
               </div>
             </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              {/* BOOKINGS TABLE */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 text-secondary"><FaCalendarCheck /> Bookings</h5>
                    <span className="badge bg-light text-secondary">{bookings.length} Records</span>
                </div>
                <div className="card-body p-4">
                  {bookings.length === 0 ? <p className="text-muted text-center">No bookings found.</p> : 
                    <>
                    <div className="table-responsive">
                       <table className="table table-hover align-middle">
                          <thead className="table-light">
                              <tr>
                                  <th>Room / Guest</th>
                                  <th>Check-in</th>
                                  <th>Check-out</th>
                                  <th className="text-center">Nights</th>
                                  <th>Status</th>
                                  <th className="text-end">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(bookings, bookingsPage).map(b => {
                               const statusText = b.status || (b.isApproved ? "Approved" : "Pending");
                               const isEnded = (() => {
                                 if (!b?.endDate) return false;
                                 try { return new Date(b.endDate).getTime() <= new Date().getTime(); } catch { return false; }
                               })();
                               const statusLower = (statusText || "").toLowerCase();
                               const isFinal = ["cancelled", "rejected", "completed", "refunded"].includes(statusLower);

                               return (
                               <tr key={b.id}>
                                  <td>
                                      <div className="fw-bold">Room {b.Number || b.room?.number || "?"}</div>
                                      <small className="text-muted">{b.user?.fullName || "Guest"}</small>
                                  </td>
                                  <td>{new Date(b.startDate).toLocaleDateString()}</td>
                                  <td>{new Date(b.endDate).toLocaleDateString()}</td>
                                  <td className="text-center">
                                      <span className="badge bg-light text-dark border">
                                          <FaMoon className="me-1 text-secondary" size={10}/>
                                          {getDuration(b.startDate, b.endDate)}
                                      </span>
                                  </td>
                                  <td><span className={`status-badge status-${statusLower}`}>{statusText}</span></td>
                                  <td className="text-end">
                                      <div className="btn-group" role="group">
                                          <button onClick={()=>handleBookingAction(b.id, 'approve')} disabled={actionLoading || isFinal} className="btn btn-sm btn-outline-success" title="Approve"><FaCheckCircle/></button>
                                          <button onClick={()=>handleBookingAction(b.id, 'reject')} disabled={actionLoading || isFinal} className="btn btn-sm btn-outline-danger" title="Reject"><FaTimesCircle/></button>
                                          <button onClick={()=>handleBookingAction(b.id, 'complete')} disabled={actionLoading || isFinal || !isEnded} className="btn btn-sm btn-outline-primary" title="Complete"><FaCheckCircle/></button>
                                          <button onClick={()=>handleDeleteBooking(b.id)} disabled={actionLoading} className="btn btn-sm btn-outline-secondary" title="Delete"><FaTrash/></button>
                                      </div>
                                  </td>
                               </tr>
                               );
                            })}
                          </tbody>
                       </table>
                    </div>
                    
                    {/* Booking Pagination */}
                    {bookings.length > ITEMS_PER_PAGE && (
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <small className="text-muted">Page {bookingsPage} of {getTotalPages(bookings)}</small>
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" disabled={bookingsPage === 1} onClick={() => setBookingsPage(p => p - 1)}>Previous</button>
                          <button className="btn btn-sm btn-outline-primary" disabled={bookingsPage === getTotalPages(bookings)} onClick={() => setBookingsPage(p => p + 1)}>Next</button>
                        </div>
                      </div>
                    )}
                    </>
                  }
                </div>
              </div>

              {/* ✅ USERS TABLE WITH TABS */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h5 className="fw-bold mb-0 text-secondary"><FaUser /> Users Management</h5>
                    
                    {/* Filter Tabs */}
                    <div className="nav nav-pills">
                        <button className={`nav-link py-1 px-3 small fw-bold ${userFilter==='all'?'active':''}`} onClick={()=>setUserFilter('all')}>All</button>
                        <button className={`nav-link py-1 px-3 small fw-bold ${userFilter==='admin'?'active':''}`} onClick={()=>setUserFilter('admin')}>Admins</button>
                        <button className={`nav-link py-1 px-3 small fw-bold ${userFilter==='user'?'active':''}`} onClick={()=>setUserFilter('user')}>Guests</button>
                    </div>
                </div>

                <div className="card-body p-4">
                  {displayedUsers.length === 0 ? <p className="text-center text-muted">No users found.</p> :
                  <>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPaginatedData(displayedUsers, usersPage).map(u => {
                                const isAdmin = String(u.role || "").toLowerCase() === "admin";
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${isAdmin ? "bg-warning" : "bg-primary"}`} style={{width: 35, height: 35}}>
                                                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : <FaUser/>}
                                                </div>
                                                <div>
                                                    <div className="fw-bold">{u.fullName || "No Name"}</div>
                                                    <small className="text-muted">{u.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {isAdmin ? 
                                                <span className="badge bg-warning text-dark"><FaUserShield className="me-1"/> Admin</span> : 
                                                <span className="badge bg-light text-secondary border">Guest</span>
                                            }
                                        </td>
                                        <td className="text-end">
                                            <button 
                                                onClick={()=> isAdmin ? removeRole(u.id) : assignRole(u.id)} 
                                                disabled={actionLoading} 
                                                className={`btn btn-sm fw-bold ${isAdmin ? "btn-outline-danger" : "btn-outline-primary"}`}
                                            >
                                                {isAdmin ? "Demote to Guest" : "Promote to Admin"}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                  </div>

                  {/* Users Pagination */}
                  {displayedUsers.length > ITEMS_PER_PAGE && (
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <small className="text-muted">Page {usersPage} of {Math.ceil(displayedUsers.length / ITEMS_PER_PAGE)}</small>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary" disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)}>Previous</button>
                        <button className="btn btn-sm btn-outline-primary" disabled={usersPage === Math.ceil(displayedUsers.length / ITEMS_PER_PAGE)} onClick={() => setUsersPage(p => p + 1)}>Next</button>
                      </div>
                    </div>
                  )}
                  </>
                  }
                </div>
              </div>
            </div>

            {/* Sidebar (Forms) */}
            <div className="col-lg-4">
              
              {/* --- ADD NEW ROOM FORM --- */}
              <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-header bg-white border-0 pt-4 px-4">
                  <h5 className="fw-bold mb-0 text-primary"><FaPlus className="me-2" /> Add New Room</h5>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleCreateRoom}>
                    <div className="mb-3">
                      <label className="small text-muted fw-bold mb-1">Room Number</label>
                      <input className="form-control bg-light border-0 py-2" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. 101" />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-7">
                        <label className="small text-muted fw-bold mb-1">Type</label>
                        <select className="form-select bg-light border-0 py-2" value={type} onChange={(e) => setType(e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Single">Single</option>
                          <option value="Double">Double</option>
                          <option value="Suite">Suite</option>
                        </select>
                      </div>
                      <div className="col-5">
                        <label className="small text-muted fw-bold mb-1">Price</label>
                        <input type="number" className="form-control bg-light border-0 py-2" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Egp" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="small text-muted fw-bold mb-1">Description</label>
                      <textarea className="form-control bg-light border-0 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter room description..." />
                    </div>

                    <div className="mb-3">
                      <label className="small text-muted fw-bold mb-1">Included Services</label>
                      <div className="d-flex flex-wrap gap-2">
                        {services.map((s) => (
                          <div key={s.id} onClick={() => toggleService(s.id, selectedServiceIds, setSelectedServiceIds)} className={`badge border p-2 service-pill ${selectedServiceIds.includes(s.id) ? "active" : "bg-light text-dark"}`}>
                            {s.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ✅ Multiple Image Upload (Create) */}
                    <div className="mb-3">
                      <label className="custom-file-upload">
                        <input type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
                        <FaImage className="mb-1 text-primary" size={20} />
                        <div className="small text-muted">Click to upload images</div>
                      </label>
                      
                      {previews.length > 0 && (
                        <div className="mt-2 d-flex gap-2 overflow-auto pb-2">
                          {previews.map((src, i) => (
                              <div key={i} className="position-relative" style={{minWidth: 80}}>
                                  <img src={src} alt="Preview" className="rounded shadow-sm" style={{ width: 80, height: 60, objectFit: "cover" }} />
                              </div>
                          ))}
                          <div className="align-self-center">
                              <button type="button" className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => { setSelectedFiles([]); setPreviews([]); }}>
                                <FaTrash />
                              </button>
                          </div>
                        </div>
                      )}
                      {previews.length > 0 && <small className="text-muted">{selectedFiles.length} files selected</small>}
                    </div>

                    <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm" disabled={submitting}>
                      {submitting ? "Creating..." : "Create Room"}
                    </button>
                  </form>
                </div>
              </div>

              {/* SERVICES & ROOMS LIST */}
              <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                  <div className="card-header bg-white border-0 pt-4 px-4"><h5 className="fw-bold mb-0"><FaConciergeBell /> Manage Services</h5></div>
                  <div className="card-body p-4">
                     <form onSubmit={handleCreateService} className="mb-3 d-flex gap-2">
                        <input className="form-control bg-light" placeholder="Service" value={newServiceName} onChange={e=>setNewServiceName(e.target.value)} />
                        <input type="number" className="form-control bg-light" placeholder="Price" style={{width:80}} value={newServicePrice} onChange={e=>setNewServicePrice(e.target.value)} />
                        <button className="btn btn-outline-primary"><FaPlus/></button>
                     </form>
                     {services.map(s => (
                         <div key={s.id} className="d-flex justify-content-between p-2 mb-2 border rounded">
                             <span>{s.name} <small className="text-muted">({s.price} EGP)</small></span>
                             <div className="d-flex gap-2">
                                 <button className="btn btn-sm btn-outline-primary" onClick={()=>openEditService(s)}><FaEdit/></button>
                                 <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteService(s.id)}><FaTrash/></button>
                             </div>
                         </div>
                     ))}
                  </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 bg-white">
                  <div className="card-header bg-white border-0 pt-4 px-4"><h5 className="fw-bold mb-0"><FaBed /> Rooms List</h5></div>
                  <div className="card-body p-4" style={{maxHeight: 500, overflowY: "auto"}}>
                      {rooms.map(r => (
                          <div key={r.id} className="d-flex gap-2 align-items-center mb-3 border p-2 rounded">
                              <img src={safeImageSrc(r)} style={{width: 50, height: 50, objectFit: "cover"}} className="rounded" alt=""/>
                              <div className="flex-grow-1">
                                  <div className="fw-bold">Room {r.number}</div>
                                  <small className="text-muted">{r.type}</small>
                              </div>
                              <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(r)}><FaEdit/></button>
                              <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteRoom(r.id)}><FaTrash/></button>
                          </div>
                      ))}
                  </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-backdrop-custom">
          <div className="card p-4 shadow-lg border-0" style={{ width: 560, borderRadius: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold text-primary">Edit Room Details</h5>
              <button className="btn-close" onClick={cancelEdit}></button>
            </div>

            <form onSubmit={submitEdit}>
              <div className="mb-3">
                <label className="small text-muted fw-bold">Room Number</label>
                <input className="form-control bg-light border-0 py-2" value={editNumber} onChange={(e) => setEditNumber(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="small text-muted fw-bold">Type</label>
                <select className="form-select bg-light border-0 py-2" value={editType} onChange={(e) => setEditType(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="small text-muted fw-bold">Price</label>
                <input type="number" className="form-control bg-light border-0 py-2" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="small text-muted fw-bold mb-1">Description</label>
                <textarea className="form-control bg-light border-0 py-2" rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Room description..." />
              </div>

              <div className="mb-3">
                <label className="small text-muted fw-bold mb-1">Included Services</label>
                <div className="d-flex flex-wrap gap-2">
                  {services.map((s) => (
                    <div key={s.id} onClick={() => toggleService(s.id, editServiceIds, setEditServiceIds)} className={`badge border p-2 service-pill ${editServiceIds.includes(s.id) ? "active" : "bg-light text-dark"}`}>{s.name}</div>
                  ))}
                </div>
              </div>

              {/* ✅ Multiple Images in Edit + WARNING */}
              <div className="mb-4">
                <label className="custom-file-upload">
                  <input type="file" multiple style={{ display: "none" }} onChange={handleEditFileChange} />
                  <FaImage className="mb-1 text-primary" size={18} /> <span className="small text-muted">Select New Images</span>
                </label>
                
                {editPreviews.length > 0 && (
                   <div className="mt-2 d-flex gap-2 overflow-auto">
                      {editPreviews.map((src, i) => (
                          <img key={i} src={src} alt="New" className="rounded shadow-sm" style={{ width: 60, height: 60, objectFit: "cover" }} />
                      ))}
                      <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => { setEditFiles([]); setEditPreviews([]); }}>Clear New</button>
                   </div>
                )}
                
                {/* Warning Message */}
                <small className="d-block text-danger mt-1 fw-bold" style={{fontSize: "0.75rem"}}>
                  * Warning: Uploading new images will replace ALL existing images for this room.
                </small>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1 fw-bold" disabled={editingSubmitting}>{editingSubmitting ? "Saving..." : "Save Changes"}</button>
                <button type="button" className="btn btn-light fw-bold text-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Service Modal */}
      {isEditingService && (
        <div className="modal-backdrop-custom">
            <div className="card p-4 shadow-lg" style={{ width: 420 }}>
                <h6 className="mb-3">Edit Service</h6>
                <form onSubmit={submitEditService}>
                    <input className="form-control mb-2" value={editServiceName} onChange={e=>setEditServiceName(e.target.value)} />
                    <input type="number" className="form-control mb-3" value={editServicePrice} onChange={e=>setEditServicePrice(e.target.value)} />
                    <button className="btn btn-primary w-100">Save</button>
                    <button type="button" className="btn btn-light w-100 mt-2" onClick={closeEditService}>Cancel</button>
                </form>
            </div>
        </div>
      )}

    </>
  );
}

// Stats Card Component
const StatsCard = ({ title, count, icon, color, delay }) => (
  <div className="col-md-3" style={{ animation: `fadeIn 0.6s ease-out ${delay} forwards`, opacity: 0 }}>
    <div className="card border-0 shadow-sm h-100 rounded-4 hover-card">
      <div className="card-body p-3 d-flex align-items-center justify-content-between">
        <div>
          <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "0.7rem" }}>{title}</h6>
          <h4 className="mb-0 fw-bold text-dark">{count}</h4>
        </div>
        <div className={`rounded-circle bg-${color} bg-opacity-10 p-2 text-${color}`} style={{ fontSize: "1.2rem" }}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);