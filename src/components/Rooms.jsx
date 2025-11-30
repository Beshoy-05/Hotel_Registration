// src/components/Rooms.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../api";
import { FaArrowRight, FaBed } from "react-icons/fa";

export default function RoomsSection() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getRooms();
        if (mounted) {
          // Limit to first 3 rooms for the homepage section
          const data = res.data || [];
          setRooms(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load rooms:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // Helper for image URL
  const safeImageSrc = (r) => {
    const raw = r?.imageUrl ?? r?.image ?? null;
    if (!raw) return "/rooms/default.jpg";
    if (raw.startsWith("http")) return raw;
    return `https://hotel-booking.runasp.net${raw}`;
  };

  return (
    <section className="py-5 bg-light position-relative overflow-hidden">
      {/* Background Pattern (Optional) */}
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" 
           style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none'}}></div>

      <div className="container position-relative z-2">
        
        {/* Section Header */}
        <div className="text-center mb-5" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-bold letter-spacing-1">
            PREMIUM STAYS
          </span>
          <h2 className="display-5 fw-bold mb-3">Featured Rooms</h2>
          <p className="text-muted fs-5 mx-auto" style={{ maxWidth: "600px" }}>
            Handpicked selections for your ultimate comfort and relaxation.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map((n) => (
              <div className="col-lg-4 col-md-6" key={n}>
                <div className="card border-0 rounded-4 shadow-sm overflow-hidden" style={{height: '400px'}}>
                  <div className="bg-secondary bg-opacity-10 w-100 h-50 animate-pulse"></div>
                  <div className="card-body p-4">
                    <div className="bg-secondary bg-opacity-10 w-75 h-25 mb-3 rounded animate-pulse"></div>
                    <div className="bg-secondary bg-opacity-10 w-50 h-25 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-5 text-muted">No rooms available at the moment.</div>
        ) : (
          <div className="row g-4">
            {rooms.map((r, idx) => (
              <div className="col-lg-4 col-md-6" key={r.id || idx} style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.2}s forwards`, opacity: 0 }}>
                <div className="card room-card h-100 border-0 rounded-4 shadow-sm overflow-hidden bg-white">
                  
                  {/* Image Container */}
                  <div className="room-img-wrapper position-relative overflow-hidden" style={{ height: "240px" }}>
                    <img 
                      src={safeImageSrc(r)} 
                      alt={r.number} 
                      className="w-100 h-100 object-fit-cover transition-transform duration-500"
                      onError={(e) => e.target.src="/rooms/default.jpg"}
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-white text-dark shadow-sm py-2 px-3 rounded-pill fw-bold">
                        {r.pricePerNight} EGP <small className="text-muted fw-normal">/ night</small>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title fw-bold mb-0 font-playfair text-dark">Room {r.number}</h5>
                      <span className="text-muted small border px-2 py-1 rounded-pill">
                        {r.type} Suite
                      </span>
                    </div>
                    
                    <p className="text-muted small mb-4 line-clamp-2">
                      Experience luxury with our {r.type} room, featuring modern amenities and a stunning view.
                    </p>

                    <div className="mt-auto pt-3 border-top d-flex gap-2">
                      <Link to={`/rooms/${r.id}`} className="btn btn-light flex-grow-1 fw-bold rounded-3 text-secondary">
                        Details
                      </Link>
                      <Link to={`/book/${r.id}`} className="btn btn-primary flex-grow-1 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2">
                        Book Now <FaArrowRight size={12}/>
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-5">
          <Link to="/rooms" className="btn btn-outline-dark rounded-pill px-5 py-3 fw-bold shadow-sm hover-scale">
            View All Rooms <FaBed className="ms-2"/>
          </Link>
        </div>

      </div>

      {/* Custom CSS embedded */}
      <style>{`
        .font-playfair { font-family: 'Playfair Display', serif; }
        
        /* Card Hover Effect */
        .room-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .room-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        
        /* Image Zoom Effect */
        .room-img-wrapper img { transition: transform 0.6s ease; }
        .room-card:hover .room-img-wrapper img { transform: scale(1.08); }

        /* Button Hover */
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.05); }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}