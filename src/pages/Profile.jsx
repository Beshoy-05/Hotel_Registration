// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { myBookings } from "../api";
import {
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaBed,
  FaMapMarkerAlt, FaHistory, FaCheckCircle,
  FaTimesCircle, FaClock, FaReceipt, FaMoneyBillWave, FaConciergeBell
} from "react-icons/fa";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } catch (e) {
      console.error("User not found");
    }

    async function loadData() {
      try {
        const res = await myBookings();
        const sortedBookings = (res.data || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setBookings(sortedBookings);

        // Calculate Total Spent (UX improvement)
        const total = sortedBookings
          .filter(b => b.status !== 'Cancelled' && b.status !== 'Rejected')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        setTotalSpent(total);

      } catch (err) {
        console.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Helper to show room image
  const safeImageSrc = (room) => {
    const raw = room?.imageUrl || room?.image || null;
    if (!raw) return "https://placehold.co/600x400?text=Room";
    if (raw.startsWith("http")) return raw;
    return `https://hotel-booking.runasp.net${raw}`;
  };

  if (!user) return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-light" style={{ minHeight: "80vh" }}>
      <div className="bg-white p-5 rounded-4 shadow text-center" style={{maxWidth: 400}}>
        <div className="mb-4 text-muted opacity-25"><FaUser size={60}/></div>
        <h4 className="fw-bold mb-2">Guest Access</h4>
        <p className="text-muted mb-4">Please sign in to manage your bookings and view your profile.</p>
        <Link to="/signin" className="btn btn-primary w-100 py-2 rounded-pill fw-bold">Sign In Now</Link>
      </div>
    </div>
  );

  return (
    <div className="profile-page bg-light" style={{ minHeight: "100vh" }}>
      
      {/* 🟢 Hero Header (Glassmorphism) */}
      <div className="header-bg bg-gradient-primary"></div>
      
      <div className="container" style={{ marginTop: "-80px" }}>
        
        {/* User Stats Header */}
        <div className="card border-0 shadow-lg rounded-4 mb-5 overflow-hidden glass-card">
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex flex-column flex-md-row align-items-center gap-4">
              
              {/* Avatar */}
              <div className="position-relative">
                <div className="avatar-circle bg-white p-1 shadow">
                  <div className="w-100 h-100 bg-light rounded-circle d-flex align-items-center justify-content-center text-primary display-4 fw-bold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>
                <span className="position-absolute bottom-0 end-0 p-2 bg-success border border-white border-2 rounded-circle"></span>
              </div>

              {/* Info */}
              <div className="text-center text-md-start flex-grow-1">
                <h2 className="fw-bold text-dark mb-1">{user.fullName}</h2>
                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 mt-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 rounded-pill">
                    {user.role === 'admin' ? 'Administrator' : 'Premium Member'}
                  </span>
                  <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill d-flex align-items-center">
                    <FaEnvelope className="me-2"/> {user.email}
                  </span>
                </div>
              </div>

              {/* Quick Stats (Desktop) */}
              <div className="d-none d-lg-flex gap-4 border-start ps-4">
                <div className="text-center">
                  <h5 className="fw-bold mb-0 text-dark">{bookings.length}</h5>
                  <small className="text-muted text-uppercase" style={{fontSize:'0.7rem', letterSpacing:1}}>Bookings</small>
                </div>
                <div className="text-center">
                  <h5 className="fw-bold mb-0 text-success">{totalSpent.toLocaleString()}</h5>
                  <small className="text-muted text-uppercase" style={{fontSize:'0.7rem', letterSpacing:1}}>EGP Spent</small>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="row g-4">
          
          {/* 🔵 LEFT: Sticky Sidebar */}
          <div className="col-lg-4">
            <div className="sticky-sidebar">
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-bold text-uppercase text-muted mb-4 small ls-1">Contact Details</h6>
                  
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="icon-square bg-light text-primary rounded-3">
                      <FaEnvelope />
                    </div>
                    <div className="overflow-hidden">
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-semibold text-dark text-truncate d-block">{user.email}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="icon-square bg-light text-success rounded-3">
                      <FaPhone />
                    </div>
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <span className="fw-semibold text-dark">
                        {user.phoneNumber || user.phone || <span className="text-muted fst-italic">Not Provided</span>}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-square bg-light text-warning rounded-3">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <small className="text-muted d-block">Joined</small>
                      <span className="fw-semibold text-dark">November 2025</span>
                    </div>
                  </div>

                  <hr className="my-4 opacity-10" />
                  
                  <button 
                    onClick={() => navigate("/edit-profile")} 
                    className="btn btn-outline-primary w-100 py-2 rounded-3 fw-bold hover-lift"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Promo Card (Optional UI enhancement) */}
              <div className="card border-0 shadow-sm rounded-4 bg-primary text-white overflow-hidden position-relative">
                <div className="card-body p-4 position-relative" style={{zIndex:1}}>
                  <h5 className="fw-bold"><FaConciergeBell className="mb-2"/> Need Help?</h5>
                  <p className="small opacity-75 mb-3">Contact our 24/7 support team for any issues with your bookings.</p>
                  <Link to="/contact" className="btn btn-sm btn-light text-primary fw-bold rounded-pill px-3">Contact Support</Link>
                </div>
                <div className="position-absolute top-0 end-0 opacity-10" style={{transform: 'translate(30%, -30%)'}}>
                  <FaConciergeBell size={150} />
                </div>
              </div>
            </div>
          </div>

          {/* 🔵 RIGHT: Booking History */}
          <div className="col-lg-8">
            <h4 className="fw-bold text-dark mb-4 d-flex align-items-center">
              <FaHistory className="text-primary me-2"/> Booking History
            </h4>

            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : bookings.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <div className="card-body">
                  <div className="mb-3 text-muted opacity-25"><FaBed size={60}/></div>
                  <h5 className="fw-bold">No trips yet</h5>
                  <p className="text-muted mb-4">You haven't made any reservations. Time for a vacation?</p>
                  <Link to="/rooms" className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm hover-lift">Find a Room</Link>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {bookings.map((b) => {
                  const status = (b.status || "pending").toLowerCase();
                  
                  let statusData = { color: 'warning', icon: <FaClock />, label: 'Pending', bg: '#fff3cd', text: '#856404' };
                  if (status === 'approved') statusData = { color: 'info', icon: <FaCheckCircle />, label: 'Approved', bg: '#d1ecf1', text: '#0c5460' };
                  if (status === 'confirmed') statusData = { color: 'success', icon: <FaCheckCircle />, label: 'Confirmed', bg: '#d4edda', text: '#155724' };
                  if (status === 'cancelled' || status === 'rejected') statusData = { color: 'danger', icon: <FaTimesCircle />, label: 'Cancelled', bg: '#f8d7da', text: '#721c24' };

                  return (
                    <div key={b.id} className="card border-0 shadow-sm rounded-4 overflow-hidden booking-card">
                      <div className="row g-0">
                        {/* Image Section */}
                        <div className="col-md-4 position-relative">
                          <img 
                            src={safeImageSrc(b.room)} 
                            alt="Room" 
                            className="h-100 w-100 object-fit-cover"
                            style={{minHeight: '180px'}}
                            onError={(e) => e.target.src="https://placehold.co/600x400?text=No+Image"}
                          />
                          <div className="position-absolute top-0 start-0 m-3">
                             <span className="badge rounded-pill px-3 py-2 shadow-sm" style={{backgroundColor: statusData.bg, color: statusData.text}}>
                                {statusData.icon} <span className="ms-1">{statusData.label}</span>
                             </span>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="col-md-8">
                          <div className="card-body p-4 h-100 d-flex flex-column justify-content-center">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h5 className="fw-bold text-dark mb-1">Room {b.room?.number || "Unknown"}</h5>
                                <small className="text-muted d-flex align-items-center gap-1">
                                  <FaMapMarkerAlt size={12}/> Cairo View
                                </small>
                              </div>
                              <div className="text-end">
                                <h5 className="fw-bold text-primary mb-0">{b.totalAmount} <small className="fs-6">EGP</small></h5>
                              </div>
                            </div>

                            <hr className="my-3 opacity-10" />

                            <div className="row g-2">
                              <div className="col-6">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="text-muted"><FaCalendarAlt /></div>
                                  <div>
                                    <span className="d-block text-muted" style={{fontSize:'0.65rem', fontWeight:'700', textTransform:'uppercase'}}>Check-In</span>
                                    <span className="fw-bold text-dark small">{new Date(b.startDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="text-muted"><FaCalendarAlt /></div>
                                  <div>
                                    <span className="d-block text-muted" style={{fontSize:'0.65rem', fontWeight:'700', textTransform:'uppercase'}}>Check-Out</span>
                                    <span className="fw-bold text-dark small">{new Date(b.endDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 d-flex justify-content-between align-items-end">
                                <small className="text-muted font-monospace">ID: {String(b.id).substring(0,8)}</small>
                                {/* Optional: View Receipt Button logic could go here */}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .bg-gradient-primary { background: linear-gradient(135deg, #0b2545 0%, #1e40af 100%); height: 220px; }
        .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
        .avatar-circle { width: 130px; height: 130px; border-radius: 50%; }
        .ls-1 { letter-spacing: 1px; }
        .icon-square { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        
        .sticky-sidebar { position: sticky; top: 100px; z-index: 10; }
        
        .booking-card { transition: transform 0.2s, box-shadow 0.2s; }
        .booking-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important; }
        
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateY(-2px); }
        
        @media (max-width: 991px) {
           .header-bg { height: 280px; }
           .sticky-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}