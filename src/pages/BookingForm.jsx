// src/pages/BookingForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getServices } from "../api";
import Swal from "sweetalert2";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaConciergeBell, 
  FaCheckCircle, 
  FaBed, 
  FaMoneyBillWave 
} from "react-icons/fa";

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- All Original State & Logic Preserved ---
  const [room, setRoom] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [daysCount, setDaysCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem("jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    let mounted = true;
    async function loadRoomAndServices() {
      setLoadingRoom(true);
      try {
        const roomRes = await api.get(`/Rooms/${id}`);
        if (!mounted) return;
        const r = roomRes.data || roomRes;
        setRoom(r);

        let allServices = [];
        try {
          const sRes = await getServices();
          allServices = sRes.data || [];
        } catch (e) {
          console.warn("Failed to load services list", e);
        }

        const svcMap = new Map();
        for (const s of allServices) {
          svcMap.set(String(s.id).toLowerCase(), {
            id: s.id,
            name: s.name ?? s.Name ?? "Service",
            price: Number(s.price ?? s.Price ?? 0) || 0,
            description: s.description ?? s.Description ?? "",
          });
        }

        const roomSvcs = (r?.services || []).map((s) => {
          const sid = (s.id ?? s.serviceId ?? s.ServiceId ?? s.id) || null;
          const key = sid ? String(sid).toLowerCase() : null;
          if (key && svcMap.has(key)) {
            return svcMap.get(key);
          }
          return {
            id: sid ?? s.id ?? s.serviceId ?? null,
            name: s.name ?? s.Name ?? "Service",
            price: Number(s.price ?? s.Price ?? s.cost ?? 0) || 0,
            description: s.description ?? s.Description ?? "",
          };
        });

        setAvailableServices(roomSvcs);
      } catch (err) {
        console.error("Failed loading room or services:", err);
        Swal.fire("Error", "Failed to load room details.", "error");
      } finally {
        if (mounted) setLoadingRoom(false);
      }
    }

    if (id) loadRoomAndServices();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setDaysCount(1);
      return;
    }
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(0, 0, 0, 0);
      const diffMs = e.getTime() - s.getTime();
      const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      setDaysCount(days);
    } catch {
      setDaysCount(1);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const roomPrice = Number(room?.pricePerNight || room?.price || 0);
    const roomTotal = roomPrice * Math.max(1, daysCount || 1);
    const servicesTotal = (availableServices || [])
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    setCalculatedTotal(roomTotal + servicesTotal);
  }, [room, availableServices, selectedServices, daysCount]);

  const toggleService = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) return prev.filter((x) => x !== serviceId);
      return [...prev, serviceId];
    });
  };

  const safeFmt = (num) => {
    if (num == null || isNaN(num)) return "0";
    return Number(num).toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return Swal.fire("Dates required", "Please select check-in and check-out dates.", "warning");
    }
    const s = new Date(startDate);
    const eD = new Date(endDate);
    if (eD <= s) {
      return Swal.fire("Invalid dates", "Check-out must be after check-in.", "warning");
    }

    const token = localStorage.getItem("jwt_token");
    if (!token) {
      Swal.fire("Login Required", "Please sign in to complete booking.", "warning").then(() => {
        navigate("/signin");
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        roomId: id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        serviceIds: selectedServices,
      };

      const res = await api.post("/Bookings", payload, { headers: { "Content-Type": "application/json", ...getAuthHeader() } });
      const data = res.data || {};
      Swal.fire("Success", "Booking created. Proceed to payment.", "success");

      if (data.paymentIntentId) {
        navigate(`/payment/${data.bookingId || ""}`);
      } else {
        navigate("/my-bookings");
      }
    } catch (err) {
      console.error("Create booking error:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to create booking.";
      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Styles ---
  const styles = {
    pageBg: { backgroundColor: "#f8f9fa", minHeight: "100vh" },
    card: { border: "none", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
    headerGradient: { 
      background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", 
      color: "white", 
      borderRadius: "16px 16px 0 0",
      padding: "2rem"
    },
    serviceCard: (active) => ({
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: active ? "2px solid #0d6efd" : "1px solid #dee2e6",
      backgroundColor: active ? "#f8faff" : "white",
      transform: active ? "translateY(-2px)" : "none",
      boxShadow: active ? "0 4px 12px rgba(13, 110, 253, 0.1)" : "none"
    })
  };

  if (loadingRoom) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-muted">
        <FaBed size={48} className="mb-3 opacity-50" />
        <h4>Room details unavailable</h4>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-3 rounded-pill px-4">Go Back</button>
      </div>
    );
  }

  return (
    <div style={styles.pageBg} className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            
            {/* Back Button */}
            <button 
              className="btn btn-link text-decoration-none text-muted mb-3 p-0 fw-bold d-flex align-items-center gap-2"
              onClick={() => window.history.back()}
            >
              <FaArrowLeft /> Back to Rooms
            </button>

            <div className="card" style={styles.card}>
              {/* Header */}
              <div style={styles.headerGradient} className="text-center position-relative">
                <h3 className="fw-bold mb-1">Confirm Your Stay</h3>
                <p className="mb-0 opacity-75">You are booking Room <span className="fw-bold">#{room.number}</span></p>
                <div className="badge bg-white text-primary mt-2 px-3 py-2 rounded-pill shadow-sm">
                  {room.type || "Standard"} Room
                </div>
              </div>

              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  
                  {/* Dates Section */}
                  <h6 className="text-uppercase text-muted fw-bold mb-3 small tracking-wide">
                    <FaCalendarAlt className="me-2" /> Dates
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="date" 
                          className="form-control bg-light border-0" 
                          id="floatingStart"
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)} 
                        />
                        <label htmlFor="floatingStart">Check-in Date</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="date" 
                          className="form-control bg-light border-0" 
                          id="floatingEnd"
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)} 
                        />
                        <label htmlFor="floatingEnd">Check-out Date</label>
                      </div>
                    </div>
                  </div>

                  {/* Services Section */}
                  {availableServices.length > 0 && (
                    <>
                      <h6 className="text-uppercase text-muted fw-bold mb-3 small tracking-wide mt-4">
                        <FaConciergeBell className="me-2" /> Enhance Your Stay
                      </h6>
                      <div className="d-flex flex-column gap-2 mb-4">
                        {availableServices.map((svc) => {
                          const active = selectedServices.includes(svc.id);
                          return (
                            <div 
                              key={svc.id}
                              className="d-flex align-items-center p-3 rounded-3"
                              style={styles.serviceCard(active)}
                              onClick={() => toggleService(svc.id)}
                            >
                              <div className={`rounded-circle p-2 me-3 d-flex align-items-center justify-content-center ${active ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                                {active ? <FaCheckCircle /> : <FaConciergeBell size={14} />}
                              </div>
                              <div className="flex-grow-1">
                                <div className={`fw-bold ${active ? 'text-primary' : 'text-dark'}`}>{svc.name}</div>
                                {svc.description && <small className="text-muted d-block" style={{fontSize: "0.85rem"}}>{svc.description}</small>}
                              </div>
                              <div className="text-end">
                                <span className={`badge ${active ? 'bg-primary' : 'bg-light text-dark border'}`}>
                                  {Number(svc.price) > 0 ? `+${safeFmt(svc.price)} EGP` : "Free"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <hr className="my-4 text-muted opacity-25" />

                  {/* Price Summary (Receipt Style) */}
                  <div className="bg-light p-4 rounded-3 mb-4 border border-dashed">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <FaMoneyBillWave className="text-success" /> Payment Summary
                    </h6>
                    
                    <div className="d-flex justify-content-between mb-2 small text-muted">
                      <span>Room ({daysCount} night{daysCount > 1 ? 's' : ''})</span>
                      <span>{safeFmt(Number(room.pricePerNight || room.price || 0) * daysCount)} EGP</span>
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="d-flex justify-content-between mb-2 small text-muted">
                        <span>Extra Services ({selectedServices.length})</span>
                        <span>
                          {safeFmt(
                            (availableServices || [])
                              .filter((s) => selectedServices.includes(s.id))
                              .reduce((sum, s) => sum + (Number(s.price) || 0), 0)
                          )} EGP
                        </span>
                      </div>
                    )}

                    <div className="border-top my-2"></div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold fs-5 text-dark">Total</span>
                      <span className="fw-bold fs-4 text-primary">{safeFmt(calculatedTotal)} <small className="fs-6 text-muted">EGP</small></span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 rounded-3 fw-bold fs-5 shadow-sm hover-scale"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      "Confirm & Pay"
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="text-center mt-4 text-muted small">
              <p>Secure payment processed via Stripe • Free cancellation up to 24h before check-in</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}