// src/components/Hero.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBed, FaDollarSign, FaCalendarAlt } from "react-icons/fa";

export default function Hero() {
  const navigate = useNavigate();
  
  // States for Filters
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  // Added Date States
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build URL Params
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    // Append Dates
    if (dateFrom) params.append("from", dateFrom);
    if (dateTo) params.append("to", dateTo);

    // Redirect to Rooms page with filters
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <section
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "85vh",
        backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Dark Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))" }}></div>

      <div className="container position-relative z-2 text-center text-white">
        <h1 className="display-3 fw-bold mb-3" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
          Find Your Perfect Stay
        </h1>
        <p className="lead mb-5 opacity-90">Discover luxury rooms and suites tailored to your comfort.</p>

        {/* Luxury Search Box */}
        <div className="bg-white p-4 rounded-4 shadow-lg mx-auto" style={{ maxWidth: "1100px" }}>
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              
              {/* 1. Room Type */}
              <div className="col-lg-3 col-md-6 text-start">
                <label className="form-label text-dark fw-bold small"><FaBed className="me-2 text-primary"/>Room Type</label>
                <select 
                  className="form-select border-0 bg-light py-3" 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{cursor: 'pointer'}}
                >
                  <option value="">All Types</option>
                  <option value="Single">Single Room</option>
                  <option value="Double">Double Room</option>
                  <option value="Suite">Luxury Suite</option>
                </select>
              </div>

              {/* 2. Dates (Check-in / Out) - NEW */}
              <div className="col-lg-3 col-md-6 text-start">
                 <label className="form-label text-dark fw-bold small"><FaCalendarAlt className="me-2 text-primary"/>Check-in / Out</label>
                 <div className="input-group">
                   <input 
                      type="date" 
                      className="form-control border-0 bg-light py-3" 
                      value={dateFrom} 
                      onChange={(e) => setDateFrom(e.target.value)} 
                      placeholder="From"
                      title="Check-in Date"
                   />
                   <span className="input-group-text bg-light border-0 px-1"></span>
                   <input 
                      type="date" 
                      className="form-control border-0 bg-light py-3" 
                      value={dateTo} 
                      onChange={(e) => setDateTo(e.target.value)} 
                      placeholder="To" 
                      title="Check-out Date"
                   />
                 </div>
              </div>

              {/* 3. Price Range */}
              <div className="col-lg-3 col-md-6 text-start">
                <label className="form-label text-dark fw-bold small w-100 text-start"><FaDollarSign className="me-2 text-success"/>Price (EGP)</label>
                <div className="input-group">
                  <input 
                    type="number" 
                    className="form-control border-0 bg-light py-3" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="input-group-text bg-light border-0">-</span>
                  <input 
                    type="number" 
                    className="form-control border-0 bg-light py-3" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* 4. Search Button */}
              <div className="col-lg-3 col-md-6">
                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm h-100 d-flex align-items-center justify-content-center gap-2">
                  <FaSearch /> Search
                </button>
              </div>

            </div>
          </form>
        </div>

      </div>
    </section>
  );
}