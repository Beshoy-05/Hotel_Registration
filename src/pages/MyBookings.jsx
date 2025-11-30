// src/pages/MyBookings.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { myBookings, cancelBooking } from "../api";
import Swal from "sweetalert2";
import { 
  FaCalendarAlt, FaBed, FaMapMarkerAlt, FaTimes, 
  FaArrowRight, FaMoneyBillWave, FaCreditCard, 
  FaCheckCircle, FaExclamationCircle, FaPlaneDeparture, FaTrashAlt
} from "react-icons/fa";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await myBookings();
        let data = res.data || [];

        // ✅ 1. تصفية الحجوزات الممسوحة سابقاً من الـ LocalStorage
        const clearedIds = JSON.parse(localStorage.getItem("cleared_bookings_ids") || "[]");
        data = data.filter(b => !clearedIds.includes(b.id));

        // الترتيب: الغير مدفوع أولاً، ثم الأحدث تاريخاً
        const sorted = data.sort((a, b) => {
            const aNeedsPay = a.paymentStatus !== 'Paid' && a.status !== 'Cancelled' && a.status !== 'Rejected';
            const bNeedsPay = b.paymentStatus !== 'Paid' && b.status !== 'Cancelled' && b.status !== 'Rejected';
            
            if (aNeedsPay && !bNeedsPay) return -1;
            if (!aNeedsPay && bNeedsPay) return 1;
            
            return new Date(b.startDate) - new Date(a.startDate);
        });
        setBookings(sorted);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "Failed to load bookings", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCancel = async (id) => {
    Swal.fire({
      title: 'Cancel Booking?',
      text: "Are you sure you want to cancel this reservation?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Cancel it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cancelBooking(id);
          setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
          Swal.fire('Cancelled', 'Booking cancelled successfully.', 'success');
        } catch (e) {
          Swal.fire('Error', 'Failed to cancel.', 'error');
        }
      }
    });
  };

  // ✅ دالة المسح المعدلة (بتحفظ في المتصفح)
  const handleClearHistory = () => {
    const historyItems = bookings.filter(b => 
        ['cancelled', 'rejected', 'completed'].includes((b.status || '').toLowerCase())
    );

    if (historyItems.length === 0) {
        Swal.fire("Info", "No past or cancelled bookings to clear.", "info");
        return;
    }

    Swal.fire({
        title: 'Clear History?',
        text: `This will hide ${historyItems.length} past bookings permanently from this view.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Clear',
        confirmButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            // 1. استخراج الـ IDs للحجوزات المراد إخفاؤها
            const idsToRemove = historyItems.map(b => b.id);
            
            // 2. حفظها في LocalStorage عشان تفضل ممسوحة حتى بعد الريفريش
            const existingCleared = JSON.parse(localStorage.getItem("cleared_bookings_ids") || "[]");
            const newCleared = [...existingCleared, ...idsToRemove];
            localStorage.setItem("cleared_bookings_ids", JSON.stringify(newCleared));

            // 3. تحديث الواجهة فوراً
            setBookings(prev => prev.filter(b => !idsToRemove.includes(b.id)));
            
            Swal.fire("Cleared", "History cleaned up.", "success");
        }
    });
  };

  const safeImageSrc = (room) => {
    const raw = room?.imageUrl || room?.image || null;
    if (!raw) return "https://placehold.co/600x400?text=Luxury+Room";
    if (raw.startsWith("http")) return raw;
    return `https://hotel-booking.runasp.net${raw}`;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "80vh" }}>
        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}></div>
        <p className="mt-3 text-muted fw-bold">Loading your journeys...</p>
      </div>
    );
  }

  return (
    <div className="bg-light" style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      <div className="container py-5" style={{ maxWidth: "1000px" }}>
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-end mb-5">
          <div>
            <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-3">
              My Bookings <span className="badge bg-primary fs-6 rounded-pill align-middle">{bookings.length}</span>
            </h2>
            <p className="text-muted mb-0">Manage your upcoming stays and history</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            
            {bookings.some(b => ['cancelled', 'rejected', 'completed'].includes((b.status||'').toLowerCase())) && (
                <button 
                    onClick={handleClearHistory} 
                    className="btn btn-white border bg-white text-muted shadow-sm rounded-pill px-3 fw-bold hover-scale"
                    title="Hide cancelled/past bookings"
                >
                    <FaTrashAlt className="me-2"/> Clear History
                </button>
            )}

            <Link to="/rooms" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm hover-scale">
                <FaPlaneDeparture className="me-2"/> Book New Trip
            </Link>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
            <div className="mb-4 text-muted opacity-25" style={{ fontSize: "5rem" }}><FaCalendarAlt /></div>
            <h4 className="fw-bold text-dark">No active bookings</h4>
            <p className="text-muted">Your history is clean. Ready for a new adventure?</p>
            <Link to="/rooms" className="btn btn-outline-primary rounded-pill px-5 mt-2 fw-bold">Find a Room</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {bookings.map((b, idx) => {
              const status = (b.status || "pending").toLowerCase();
              const isPaid = b.paymentStatus === 'Paid';
              const isCancelled = status === 'cancelled' || status === 'rejected';
              
              const needsPayment = !isCancelled && !isPaid && status !== 'rejected';

              return (
                <div 
                  key={b.id} 
                  className={`card booking-card border-0 rounded-4 overflow-hidden bg-white shadow-sm ${isCancelled ? 'opacity-75 grayscale' : ''}`}
                  style={{ 
                      animation: `fadeInUp 0.5s ease forwards ${idx * 0.1}s`,
                      borderLeft: needsPayment ? '6px solid #ffc107' : 'none' 
                  }}
                >
                  <div className="row g-0">
                    
                    <div className="col-md-4 position-relative">
                      <img 
                        src={safeImageSrc(b.room)} 
                        alt="Room" 
                        className="h-100 w-100 object-fit-cover"
                        style={{minHeight: "220px"}}
                        onError={(e) => {e.target.onerror=null; e.target.src="https://placehold.co/600x400?text=No+Image"}}
                      />
                      <div className="position-absolute top-0 start-0 m-3">
                        <StatusBadge status={status} isPaid={isPaid} needsPayment={needsPayment} />
                      </div>
                    </div>

                    <div className="col-md-8">
                      <div className="card-body p-4 h-100 d-flex flex-column">
                        
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold mb-1 text-dark">
                              {b.room?.number ? `Room ${b.room.number}` : `Room Details`}
                            </h5>
                            <div className="text-muted small d-flex align-items-center gap-2">
                              <FaBed className="text-primary"/> 
                              {b.room?.type || "Standard"} Suite 
                              <span className="mx-1">•</span> 
                              <FaMapMarkerAlt className="text-danger"/> Cairo View
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-primary fs-4 d-flex align-items-center justify-content-end gap-1">
                              {b.totalAmount} <small className="fs-6 text-muted">EGP</small>
                            </div>
                            {needsPayment && <span className="text-warning fw-bold small"><FaExclamationCircle/> Payment Required</span>}
                          </div>
                        </div>

                        <hr className="border-light opacity-50 my-3" />

                        <div className="d-flex align-items-center gap-3 mb-4 bg-light p-3 rounded-3">
                            <div className="text-center">
                                <small className="d-block text-muted text-uppercase fw-bold" style={{fontSize:'0.65rem'}}>Check-In</small>
                                <span className="fw-bold text-dark">{new Date(b.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex-grow-1 border-top border-2 border-secondary opacity-25 position-relative">
                                <FaArrowRight className="position-absolute top-0 start-50 translate-middle text-muted bg-light px-1" style={{marginTop: '-1px'}} />
                            </div>
                            <div className="text-center">
                                <small className="d-block text-muted text-uppercase fw-bold" style={{fontSize:'0.65rem'}}>Check-Out</small>
                                <span className="fw-bold text-dark">{new Date(b.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="mt-auto d-flex justify-content-between align-items-center">
                            <small className="text-muted font-monospace">ID: #{String(b.id).substring(0,8)}</small>
                            
                            <div className="d-flex gap-2">
                                {needsPayment && (
                                    <Link 
                                        to={`/payment/${b.id}`} 
                                        state={{ totalAmount: b.totalAmount }} 
                                        className="btn btn-warning text-dark fw-bold rounded-pill px-4 shadow-sm hover-scale d-flex align-items-center gap-2"
                                    >
                                        <FaCreditCard /> Complete Payment
                                    </Link>
                                )}

                                {!isCancelled && status !== 'completed' && (
                                <button 
                                    onClick={() => handleCancel(b.id)} 
                                    className="btn btn-outline-danger rounded-pill px-3 fw-bold border-0 bg-danger bg-opacity-10 text-danger hover-bg-danger"
                                >
                                    Cancel
                                </button>
                                )}
                            </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <style>{`
          .grayscale { filter: grayscale(100%); opacity: 0.8; }
          .booking-card { transition: transform 0.2s, box-shadow 0.2s; }
          .booking-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important; }
          .hover-scale:hover { transform: scale(1.05); }
          .hover-bg-danger:hover { background-color: #dc3545 !important; color: white !important; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}

// Helper Badge
const StatusBadge = ({ status, isPaid }) => {
  let config = { bg: "bg-secondary", text: "Unknown", icon: null };

  if (status === 'cancelled' || status === 'rejected') {
      config = { bg: "bg-danger", text: "Cancelled", icon: <FaTimes className="me-1"/> };
  } else if (isPaid) {
      config = { bg: "bg-success", text: "Confirmed & Paid", icon: <FaCheckCircle className="me-1"/> };
  } else if (status === 'pending' || status === 'pendingpayment') {
      config = { bg: "bg-warning text-dark", text: "Payment Pending", icon: <FaExclamationCircle className="me-1"/> };
  } else if (status === 'approved') {
      config = { bg: "bg-info text-dark", text: "Approved - Pay Now", icon: <FaCheckCircle className="me-1"/> };
  }

  return (
    <span className={`badge ${config.bg} shadow-sm py-2 px-3 rounded-pill d-flex align-items-center border border-white`} style={{fontSize: '0.75rem'}}>
      {config.icon} {config.text.toUpperCase()}
    </span>
  );
};