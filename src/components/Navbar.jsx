// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart } from "react-icons/fa"; 
import Swal from "sweetalert2";
import { getAdminBookings, myBookings, getMessages } from "../api";
import {
  FaBars, FaTimes, FaUser, FaSignOutAlt, FaBed, FaConciergeBell,
  FaInfoCircle, FaCalendarCheck, FaUserShield, FaEnvelope, FaBell,
  FaCheckCircle, FaCommentDots
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist } = useWishlist();
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Menus
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setUser(null);
      }
    };
    loadUser();
    window.addEventListener("user-login", loadUser);

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("user-login", loadUser);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Polling for Notifications
  useEffect(() => {
    let interval;

    const checkNotifications = async () => {
      if (!user) return;

      try {
        const isAdmin = String(user.role).toLowerCase() === "admin";
        let newNotifs = [];

        if (isAdmin) {
          // 1. Get Pending Bookings
          const bookingRes = await getAdminBookings();
          const bookings = bookingRes.data || [];
          const pendingBookings = bookings
            .filter(
              (b) =>
                !b.status ||
                ["pending", "pendingpayment"].includes(b.status.toLowerCase())
            )
            .map((b) => ({
              ...b,
              type: "booking",
              title: `Room ${b.room?.number || "?"}`,
              desc: b.user?.fullName || "Guest Request",
              date: new Date(b.createdAt),
            }));

          // 2. Get Unread Messages
          const msgRes = await getMessages();
          const messages = msgRes.data || [];
          const unreadMessages = messages
            .filter((m) => !m.isRead)
            .map((m) => ({
              ...m,
              type: "message",
              title: "New Message",
              desc: m.subject || "Visitor Inquiry",
              date: new Date(m.createdAt),
            }));

          // Combine & Sort
          newNotifs = [...pendingBookings, ...unreadMessages];
        } else {
          // USER LOGIC (Bookings only)
          const res = await myBookings();
          const myData = res.data || [];
          newNotifs = myData
            .filter(
              (b) =>
                b.status &&
                ["approved", "rejected", "confirmed"].includes(
                  b.status.toLowerCase()
                )
            )
            .map((b) => ({
              ...b,
              type: "booking",
              title: `Room ${b.room?.number || "?"}`,
              desc: b.status,
              date: new Date(b.updatedAt || b.startDate),
            }));
        }

        // Sort by newest first
        newNotifs.sort((a, b) => b.date - a.date);
        setNotifications(newNotifs);
      } catch (err) {
        console.error("Notif check failed", err);
      }
    };

    if (user) {
      checkNotifications();
      interval = setInterval(checkNotifications, 15000);
    }

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    Swal.fire({
      title: "Sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d4af37",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        localStorage.removeItem("jwt_token");
        setUser(null);
        navigate("/signin");
      }
    });
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <>
      <nav className={`hotel-nav ${isScrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <div className="brand" onClick={() => navigate("/")}>
            <div className="logo-circle">H</div>
            <div className="brand-text">
              <div className="brand-title">Al-Rawad Hotel</div>
              <div className="brand-sub">Premium Stays</div>
            </div>
          </div>

          <ul className="nav-links">
            <li><Link to="/" className={isActive("/")}>Home</Link></li>
            <li><Link to="/rooms" className={isActive("/rooms")}>Rooms</Link></li>
            <li><Link to="/about" className={isActive("/about")}>About</Link></li>
            {(!user || String(user.role).toLowerCase() !== "admin") && (
                <li><Link to="/contact" className={isActive("/contact")}>Contact</Link></li>
            )}
          </ul>

          <div className="nav-actions">
            {/* 🔔 Notification Bell */}
            {user && (
              <div className="notif-wrapper">
                <div
                  className={`notification-btn ${
                    notifications.length > 0 ? "ringing" : ""
                  }`}
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setDropdownOpen(false);
                  }}
                >
                  <FaBell size={20} />
                  {notifications.length > 0 && (
                    <span className="badge-counter">
                      {notifications.length}
                    </span>
                  )}
                </div>

                {notifOpen && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setNotifOpen(false)}></div>
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <h6 className="mb-0">Notifications</h6>
                        {notifications.length > 0 && (
                          <span className="badge bg-danger rounded-pill px-2">
                            {notifications.length} New
                          </span>
                        )}
                      </div>
                      <div className="notif-body">
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            <FaCheckCircle className="text-success mb-2 opacity-50" size={24} />
                            <p className="mb-0 small">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((n, idx) => {
                            const isAdmin = String(user.role).toLowerCase() === "admin";
                            const isMsg = n.type === "message";

                            // Determine Icon & Color
                            let Icon = FaCalendarCheck;
                            let iconClass = "text-primary";
                            let badgeClass = "bg-secondary";

                            if (isMsg) {
                              Icon = FaCommentDots; // Using CommentDots for messages
                              iconClass = "text-info";
                              badgeClass = "bg-info text-dark";
                            } else {
                              const st = (n.status || "").toLowerCase();
                              if (st === "rejected") {
                                Icon = FaTimes;
                                iconClass = "text-danger";
                                badgeClass = "bg-danger";
                              } else if (st === "approved" || st === "confirmed") {
                                Icon = FaCheckCircle;
                                iconClass = "text-success";
                                badgeClass = "bg-success";
                              } else {
                                Icon = FaCalendarCheck;
                                iconClass = "text-primary";
                                badgeClass = "bg-primary";
                              }
                            }

                            return (
                              <div
                                key={idx}
                                className="notif-item"
                                onClick={() => {
                                  setNotifOpen(false);
                                  if (isAdmin) {
                                    navigate(isMsg ? "/admin/messages" : "/admin-dashboard");
                                  } else {
                                    navigate("/my-bookings");
                                  }
                                }}
                              >
                                <div className="notif-icon-wrapper">
                                  <Icon className={iconClass} />
                                </div>
                                <div className="notif-content">
                                  <div className="d-flex justify-content-between align-items-center w-100">
                                    <span className="fw-bold text-dark text-truncate" style={{ maxWidth: "120px" }}>
                                      {n.title}
                                    </span>
                                    <span className={`badge ${badgeClass} border`} style={{ fontSize: "0.6rem" }}>
                                      {isMsg ? "MSG" : (n.status || "").toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: "180px" }}>
                                    {n.desc}
                                  </p>
                                  <small className="text-muted" style={{ fontSize: "0.6rem" }}>
                                    {n.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </small>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div
                        className="notif-footer"
                        onClick={() => {
                          setNotifOpen(false);
                          if (String(user.role).toLowerCase() === "admin") navigate("/admin-dashboard");
                          else navigate("/my-bookings");
                        }}
                      >
                        View Dashboard
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* User Profile */}
            {user ? (
              <div className="user-wrapper">
                <div
                  className="user-box"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotifOpen(false);
                  }}
                >
                  <div className="user-initial">
                    {(user.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name d-none d-md-block">
                    {user.fullName ? user.fullName.split(" ")[0] : "User"}
                  </span>
                </div>

                {dropdownOpen && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)}></div>
                    <div className="custom-dropdown">
                      <div className="dropdown-header">
                        <strong>{user.fullName}</strong>
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>{user.email}</small>
                      </div>
                      <hr className="my-1 opacity-25" />
                      {String(user.role).toLowerCase() === "admin" && (
                        <>
                          <Link to="/admin-dashboard" className="dropdown-item text-warning" onClick={() => setDropdownOpen(false)}>
                            <FaUserShield className="me-2" /> Admin Panel
                          </Link>
                          <Link to="/admin/messages" className="dropdown-item text-warning" onClick={() => setDropdownOpen(false)}>
                            <FaEnvelope className="me-2" /> Messages
                          </Link>
                          <hr className="my-1 opacity-25" />
                        </>
                      )}
                      <Link to="/my-bookings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FaCalendarCheck className="me-2" /> My Bookings
                      </Link>
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FaUser className="me-2" /> My Profile
                      </Link>
                      <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FaHeart className="me-2 text-danger" /> Favorites
                        {wishlist.length > 0 && (
                          <span className="badge bg-danger ms-auto rounded-pill" style={{ fontSize: "0.6rem" }}>
                            {wishlist.length}
                          </span>
                        )}
                      </Link>
                      <hr className="my-1 opacity-25" />
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <FaSignOutAlt className="me-2" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="d-none d-md-flex gap-2">
                <Link to="/signin" className="btn btn-ghost">Log In</Link>
                <Link to="/signup" className="btn btn-primary">Join Us</Link>
              </div>
            )}

            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}><FaBed className="me-2" /> Home</Link>
          <Link to="/rooms" onClick={() => setMobileMenuOpen(false)}><FaConciergeBell className="me-2" /> Rooms</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}><FaInfoCircle className="me-2" /> About</Link>
          {(!user || String(user.role).toLowerCase() !== "admin") && (
             <Link to="/contact" onClick={() => setMobileMenuOpen(false)}><FaUser className="me-2" /> Contact</Link>
          )}
          <hr className="opacity-25 mx-3" />
          {user ? (
            <>
              {String(user.role).toLowerCase() === "admin" && (
                <>
                  <Link to="/admin-dashboard" className="text-warning d-flex justify-content-between" onClick={() => setMobileMenuOpen(false)}>
                    <span><FaUserShield className="me-2" /> Admin Dashboard</span>
                  </Link>
                  <Link to="/admin/messages" className="text-warning" onClick={() => setMobileMenuOpen(false)}>
                    <FaEnvelope className="me-2" /> Messages
                  </Link>
                </>
              )}
              <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}><FaCalendarCheck className="me-2" /> My Bookings</Link>
              <button className="mobile-logout" onClick={handleLogout}><FaSignOutAlt className="me-2" /> Logout</button>
            </>
          ) : (
            <div className="p-3 d-flex flex-column gap-2">
              <Link to="/signin" className="btn btn-ghost w-100 text-center" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn btn-primary w-100 text-center" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Styles */}
      <style>{`
        :root{ --navy:#0b2545; --gold:#d4af37; --gold-hover:#bfa030; }
        .hotel-nav { position: sticky; top: 0; z-index: 1000; background: rgba(11, 37, 69, 0.85); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease; }
        .hotel-nav.scrolled { background: rgba(7, 20, 38, 0.98); box-shadow: 0 4px 20px rgba(0,0,0,0.4); padding-top: 0; padding-bottom: 0; }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; }
        .brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .logo-circle { width: 42px; height: 42px; background: var(--gold); color: var(--navy); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; font-family: 'Playfair Display', serif; }
        .brand-title { color: #fff; font-weight: 700; line-height: 1.1; font-family: 'Playfair Display', serif; }
        .brand-sub { color: var(--gold); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
        .nav-links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
        @media (max-width: 991px) { .nav-links { display: none; } }
        .nav-links a { color: rgba(255,255,255,0.7); text-decoration: none; font-weight: 500; font-size: 0.95rem; padding: 6px 0; position: relative; transition: color 0.3s; }
        .nav-links a:hover, .nav-links a.active { color: #fff; }
        .nav-links a::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--gold); transition: width 0.3s; }
        .nav-links a:hover::after, .nav-links a.active::after { width: 100%; }
        
        .nav-actions { display: flex; align-items: center; gap: 20px; position: relative; }
        .notif-wrapper, .user-wrapper { position: relative; }

        .btn-primary { background: linear-gradient(135deg, var(--gold), #f0e68c); color: var(--navy); border: none; padding: 8px 20px; border-radius: 50px; font-weight: 600; }
        .btn-primary:hover { background: var(--gold-hover); transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 50px; font-weight: 600; }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
        
        .user-box { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 0; border: none; background: transparent; transition: 0.2s; }
        .user-box:hover { opacity: 0.8; }
        .user-initial { width: 36px; height: 36px; background: var(--gold); color: var(--navy); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .user-name { color: #fff; font-size: 0.95rem; font-weight: 600; }

        .notification-btn { position: relative; cursor: pointer; color: rgba(255,255,255,0.8); transition: 0.3s; display: flex; align-items: center; }
        .notification-btn:hover { color: #fff; transform: scale(1.1); }
        .badge-counter { position: absolute; top: -6px; right: -6px; background: #dc3545; color: #fff; font-size: 0.65rem; font-weight: bold; padding: 2px 5px; border-radius: 50%; border: 2px solid var(--navy); }
        
        .dropdown-overlay { position: fixed; inset: 0; z-index: 1001; }
        .custom-dropdown { position: absolute; top: 50px; right: 0; width: 220px; background: #fff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding: 8px; z-index: 1002; animation: fadeIn 0.2s ease; }
        .notif-dropdown { position: absolute; top: 50px; right: -50px; width: 320px; background: #fff; border-radius: 12px; box-shadow: 0 15px 50px rgba(0,0,0,0.3); z-index: 1002; overflow: hidden; animation: fadeIn 0.2s ease; border: 1px solid rgba(0,0,0,0.05); }
        
        .dropdown-header, .notif-header { padding: 8px 12px; display: flex; flex-direction: column; }
        .notif-header { background: #f8f9fa; padding: 14px 18px; flex-direction: row; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; font-weight: bold; color: #333; }
        .notif-body { max-height: 350px; overflow-y: auto; background: #fff; }
        .notif-item { display: flex; align-items: start; padding: 14px 18px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
        .notif-item:hover { background: #f0f7ff; }
        .notif-icon-wrapper { background: #e3f2fd; color: #2196f3; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; }
        .notif-content { flex-grow: 1; min-width: 0; }
        .notif-footer { text-align: center; padding: 12px; font-size: 0.85rem; color: var(--navy); cursor: pointer; font-weight: 600; background: #fcfcfc; border-top: 1px solid #eee; transition: 0.2s; }
        .notif-footer:hover { background: #f5f5f5; color: var(--gold); }
        
        .dropdown-item { display: flex; align-items: center; padding: 10px 12px; color: #333; text-decoration: none; border-radius: 8px; font-size: 0.9rem; transition: 0.2s; border: none; background: transparent; width: 100%; text-align: left; }
        .dropdown-item:hover { background: #f3f4f6; }
        
        .mobile-toggle { display: none; background: none; border: none; color: #fff; cursor: pointer; }
        @media (max-width: 991px) { .mobile-toggle { display: block; } }
        .mobile-menu { position: fixed; top: 70px; left: 0; right: 0; background: var(--navy); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0; overflow: hidden; max-height: 0; transition: max-height 0.4s ease; display: flex; flex-direction: column; }
        .mobile-menu.open { max-height: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .mobile-menu a, .mobile-logout { padding: 15px 25px; color: rgba(255,255,255,0.8); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; font-weight: 500; background: none; border: none; width: 100%; text-align: left; }
        .mobile-menu a:hover, .mobile-logout:hover { background: rgba(255,255,255,0.05); color: var(--gold); }
        .mobile-logout { color: #ff6b6b; }

        @keyframes bellRing { 0%,100%{transform:rotate(0)} 10%{transform:rotate(30deg)} 30%{transform:rotate(-28deg)} 50%{transform:rotate(34deg)} 70%{transform:rotate(-32deg)} 90%{transform:rotate(30deg)} }
        .ringing svg { animation: bellRing 4s infinite ease-in-out; transform-origin: top center; }
        @keyframes fadeIn { from{opacity:0; transform:translateY(-10px)} to{opacity:1; transform:translateY(0)} }
      `}</style>
    </>
  );
}