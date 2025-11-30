import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart, FaTrash, FaBed, FaArrowRight, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const safeImageSrc = (r) => {
    const raw = r?.imageUrl || r?.image || null;
    if (!raw) return "https://placehold.co/600x400?text=No+Image";
    if (raw.startsWith("http")) return raw;
    return `https://hotel-booking.runasp.net${raw}`;
  };

  const handleRemove = (room) => {
    Swal.fire({
      title: 'Remove from favorites?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, remove'
    }).then((result) => {
      if (result.isConfirmed) {
        toggleWishlist(room);
      }
    });
  };

  if (wishlist.length === 0) return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-light" style={{minHeight: "80vh"}}>
        <div className="bg-white p-5 rounded-circle shadow-sm mb-4 text-danger bg-opacity-10">
            <FaHeart size={60} className="text-danger" />
        </div>
        <h3 className="fw-bold text-dark">Your Wishlist is Empty</h3>
        <p className="text-muted mb-4">Start exploring and save your favorite rooms here.</p>
        <button onClick={() => navigate('/rooms')} className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm">
            Explore Rooms
        </button>
    </div>
  );

  return (
    <div className="bg-light py-5" style={{ minHeight: "90vh" }}>
      <div className="container">
        
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-5">
            <div className="bg-danger text-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow-sm">
                <FaHeart size={24}/>
            </div>
            <div>
                <h2 className="fw-bold mb-0">My Wishlist</h2>
                <p className="text-muted mb-0">{wishlist.length} saved items</p>
            </div>
        </div>

        {/* Grid */}
        <div className="row g-4">
          {wishlist.map((room) => (
            <div key={room.id} className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-shadow transition">
                <div className="row g-0 h-100">
                  
                  {/* Image */}
                  <div className="col-md-5 position-relative">
                     <img 
                        src={safeImageSrc(room)} 
                        className="w-100 h-100 object-fit-cover" 
                        alt="Room" 
                        style={{minHeight: '220px'}}
                        onError={(e) => e.target.src="https://placehold.co/600x400?text=Room"} 
                     />
                     <div className="position-absolute top-0 start-0 m-3">
                        <span className="badge bg-white text-dark shadow-sm px-2 py-1 rounded-pill d-flex align-items-center gap-1">
                            <FaStar className="text-warning"/> 4.9
                        </span>
                     </div>
                  </div>

                  {/* Details */}
                  <div className="col-md-7">
                    <div className="card-body p-4 d-flex flex-column h-100">
                      
                      <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                              <h5 className="fw-bold mb-1 text-dark">Room {room.number}</h5>
                              <small className="text-muted d-flex align-items-center gap-1">
                                <FaMapMarkerAlt size={12}/> Cairo View • {room.type}
                              </small>
                          </div>
                          <button 
                             onClick={() => handleRemove(room)}
                             className="btn btn-sm btn-light text-danger rounded-circle shadow-sm"
                             title="Remove"
                          >
                             <FaTrash />
                          </button>
                      </div>
                      
                      <div className="mt-3 mb-4">
                          <h4 className="fw-bold text-primary mb-0">
                            {room.pricePerNight} <small className="fs-6 text-muted">EGP / night</small>
                          </h4>
                      </div>
                      
                      <div className="mt-auto d-flex gap-2">
                          <Link to={`/book/${room.id}`} className="btn btn-primary flex-grow-1 rounded-pill fw-bold shadow-sm">
                              Book Now
                          </Link>
                          <Link to={`/rooms/${room.id}`} className="btn btn-outline-secondary rounded-circle px-3" title="View Details">
                              <FaArrowRight />
                          </Link>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <style>{`
        .hover-shadow:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important; }
        .transition { transition: all 0.3s ease; }
      `}</style>
    </div>
  );
}