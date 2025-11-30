import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getRooms, searchRooms, getServices } from "../api";
import { useWishlist } from "../context/WishlistContext";
import {
  FaArrowRight,
  FaBed,
  FaWifi,
  FaStar,
  FaSearch,
  FaBath,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFilter,
  FaConciergeBell,
  FaCheck,
  FaCoffee,
  FaTv,
  FaSwimmingPool,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

export default function RoomsSection() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const [filterType, setFilterType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [priceError, setPriceError] = useState("");
  const [dateError, setDateError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const { toggleWishlist, isInWishlist } = useWishlist();

  const formatPrice = (p) => Number(p).toLocaleString("en-US");

  const safeImageSrc = (r) => {
    const raw = r?.imageUrl || r?.image || null;
    if (!raw) return "https://placehold.co/600x400?text=No+Image";
    if (raw.startsWith("http")) return raw;
    return `https://hotel-booking.runasp.net${raw}`;
  };

  const getServiceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("wifi") || n.includes("internet")) return <FaWifi />;
    if (n.includes("bed") || n.includes("sleep")) return <FaBed />;
    if (n.includes("bath") || n.includes("shower") || n.includes("water"))
      return <FaBath />;
    if (n.includes("coffee") || n.includes("breakfast") || n.includes("food"))
      return <FaCoffee />;
    if (n.includes("tv") || n.includes("screen")) return <FaTv />;
    if (n.includes("pool")) return <FaSwimmingPool />;
    return <FaCheck />;
  };

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await getServices();
        setAvailableServices(res.data || []);
      } catch (e) {
        console.error("Failed to load services list", e);
      }
    }
    loadServices();
  }, []);

  useEffect(() => {
    let mounted = true;
    const qs = new URLSearchParams(location.search);

    if (qs.get("type")) setFilterType(qs.get("type"));
    if (qs.get("minPrice")) setMinPrice(qs.get("minPrice"));
    if (qs.get("maxPrice")) setMaxPrice(qs.get("maxPrice"));
    if (qs.get("from")) setDateFrom(qs.get("from"));
    if (qs.get("to")) setDateTo(qs.get("to"));
    if (qs.get("services")) setSelectedServices(qs.get("services").split(","));
    else setSelectedServices([]);

    async function load() {
      setLoading(true);
      try {
        const type = qs.get("type") || undefined;
        const minP = qs.get("minPrice")
          ? Number(qs.get("minPrice"))
          : undefined;
        const maxP = qs.get("maxPrice")
          ? Number(qs.get("maxPrice"))
          : undefined;
        const from = qs.get("from") || undefined;
        const to = qs.get("to") || undefined;
        const srvs = qs.get("services") || undefined;

        const hasFilters = !!(type || minP || maxP || from || to || srvs);
        const params = {};
        if (type) params.type = type;
        if (minP !== undefined) params.minPrice = minP;
        if (maxP !== undefined) params.maxPrice = maxP;
        if (from) params.from = from;
        if (to) params.to = to;
        if (srvs) params.services = srvs;

        const res = hasFilters ? await searchRooms(params) : await getRooms();
        const data = res && res.data ? res.data : res;

        if (mounted) setRooms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load rooms:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [location.search]);

  const applyFilters = (e) => {
    e.preventDefault();

    setPriceError("");
    setDateError("");

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    if (min !== null && max !== null && max < min) {
      setPriceError("Max price must be greater than or equal to Min price.");
      return;
    }

    if (dateFrom && dateTo) {
      const fromTime = new Date(dateFrom).getTime();
      const toTime = new Date(dateTo).getTime();
      if (toTime < fromTime) {
        setDateError("End date must be the same or after Start date.");
        return;
      }
    }

    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (selectedServices.length > 0)
      params.set("services", selectedServices.join(","));

    navigate(`/rooms?${params.toString()}`);
  };

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices((prev) => prev.filter((s) => s !== id));
    } else {
      setSelectedServices((prev) => [...prev, id]);
    }
  };

  const resetFilters = () => {
    setFilterType("");
    setMinPrice("");
    setMaxPrice("");
    setDateFrom("");
    setDateTo("");
    setSelectedServices([]);
    setPriceError("");
    setDateError("");
    navigate("/rooms");
  };

  return (
    <section className="rooms-section pt-5 pb-5">
      <div className="container-fluid px-lg-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <div
              className="sidebar-widget bg-white p-4 rounded-4 shadow-sm sticky-top"
              style={{ top: "100px", zIndex: 900 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-dark">
                  <FaFilter className="me-2 text-primary" /> Filter
                </h5>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-link text-decoration-none text-muted small p-0"
                >
                  Reset
                </button>
              </div>

              <form onSubmit={applyFilters}>
                <div className="mb-4">
                  <label className="filter-label">
                    <FaCalendarAlt className="me-2" /> Dates
                  </label>
                  <div className="d-flex flex-column gap-2">
                    <input
                      type="date"
                      className="form-control bg-light border-0"
                      value={dateFrom}
                      onChange={(e) => {
                        const val = e.target.value;
                        // إذا المستخدم كتب تاريخ قبل اليوم، نمنع ونظهر خطأ
                        if (val && val < today) {
                          setDateError("Start date cannot be in the past.");
                          // اختياري: نُصحّح التاريخ بدلاً من إظهار الخطأ:
                          // setDateFrom(today);
                          return;
                        }
                        setDateFrom(val);
                        if (dateError) setDateError("");
                      }}
                      min={today}
                    />
                    <input
                      type="date"
                      className="form-control bg-light border-0"
                      value={dateTo}
                      onChange={(e) => {
                        const val = e.target.value;
                        // لا تقبل تاريخ أقل من today أو أقل من dateFrom (لو محدد)
                        const minAllowed = dateFrom || today;
                        if (val && val < minAllowed) {
                          setDateError(
                            "End date cannot be before start date or in the past."
                          );
                          // اختياري: setDateTo(minAllowed);
                          return;
                        }
                        setDateTo(val);
                        if (dateError) setDateError("");
                      }}
                      min={dateFrom || today}
                    />
                  </div>

                  {dateError && (
                    <div className="mt-2">
                      <div className="alert alert-danger small py-1 px-2 mb-0">
                        {dateError}
                      </div>
                    </div>
                  )}
                </div>
                <hr className="opacity-10 my-4" />

                <div className="mb-4">
                  <label className="filter-label">
                    <FaMoneyBillWave className="me-2" /> Budget (EGP)
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        min="0"
                        className="form-control bg-light border-0"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => {
                          const v = e.target.value;
                          const cleaned =
                            v === "" ? "" : Number(v) < 0 ? "0" : v;
                          setMinPrice(cleaned);
                          if (priceError) setPriceError("");
                        }}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        min="0"
                        className="form-control bg-light border-0"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => {
                          const v = e.target.value;
                          const cleaned =
                            v === "" ? "" : Number(v) < 0 ? "0" : v;
                          setMaxPrice(cleaned);
                          if (priceError) setPriceError("");
                        }}
                      />
                    </div>
                  </div>

                  {priceError && (
                    <div className="mt-2">
                      <div className="alert alert-danger small py-1 px-2 mb-0">
                        {priceError}
                      </div>
                    </div>
                  )}
                </div>

                <hr className="opacity-10 my-4" />

                <div className="mb-4">
                  <label className="filter-label">
                    <FaBed className="me-2" /> Room Type
                  </label>
                  <div className="d-flex flex-column gap-2">
                    <label className="custom-radio-container d-flex align-items-center p-2 rounded-3 border-0 bg-light cursor-pointer">
                      <input
                        type="radio"
                        name="roomType"
                        value=""
                        checked={filterType === ""}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="form-check-input me-2"
                      />
                      <span className="small fw-bold">All Types</span>
                    </label>
                    {["Single", "Double", "Suite"].map((type) => (
                      <label
                        key={type}
                        className="custom-radio-container d-flex align-items-center p-2 rounded-3 border-0 bg-light cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="roomType"
                          value={type}
                          checked={filterType === type}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="form-check-input me-2"
                        />
                        <span className="small fw-bold">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="opacity-10 my-4" />

                <div className="mb-4">
                  <label className="filter-label">
                    <FaConciergeBell className="me-2" /> Amenities
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {availableServices.length === 0 && (
                      <small className="text-muted">No amenities found.</small>
                    )}
                    {availableServices.map((service) => {
                      const isSelected = selectedServices.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`badge border p-2 cursor-pointer transition-all d-flex align-items-center gap-2 ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-secondary"
                          }`}
                        >
                          {isSelected ? <FaCheck size={10} /> : null}
                          {service.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-3 rounded-3 shadow-sm mt-2"
                >
                  <FaSearch className="me-2" /> Apply Filters
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <span className="badge-pill-premium mb-2">PREMIUM STAYS</span>
                <h2 className="fw-bold text-dark">Available Rooms</h2>
                <p className="text-muted small mb-0">
                  Showing {rooms.length} results
                </p>
              </div>
            </div>

            {loading ? (
              <div className="row g-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div className="col-xl-4 col-md-6" key={n}>
                    <div className="skeleton-card">
                      <div className="skeleton-img"></div>
                      <div className="p-4">
                        <div className="skeleton-line w-50 mb-3"></div>
                        <div className="skeleton-line w-75"></div>
                        <div className="skeleton-line w-25 mt-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="empty-state text-center py-5 bg-white rounded-4 shadow-sm">
                <div
                  className="mb-3 text-muted opacity-25"
                  style={{ fontSize: "4rem" }}
                >
                  <FaSearch />
                </div>
                <h3>No rooms found</h3>
                <p className="text-muted">Try adjusting your filters.</p>
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-primary mt-3"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {rooms.map((r) => (
                  <div className="col-xl-4 col-md-6" key={r.id}>
                    <div className="room-card h-100">
                      <div className="card-image-wrapper">
                        <img
                          src={safeImageSrc(r)}
                          alt={r.number}
                          className="room-image"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/600x400?text=No+Image")
                          }
                        />
                        <div className="price-badge">
                          <span className="amount">
                            {formatPrice(r.pricePerNight)}
                          </span>
                          <span className="currency">EGP</span>
                          <span className="period">/night</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(r);
                          }}
                          className="btn btn-light position-absolute top-0 end-0 m-3 shadow-sm rounded-circle d-flex align-items-center justify-content-center border-0"
                          style={{ width: 40, height: 40 }}
                          title="Add to Favorites"
                        >
                          {isInWishlist(r.id) ? (
                            <FaHeart className="text-danger" />
                          ) : (
                            <FaRegHeart className="text-muted" />
                          )}
                        </button>
                      </div>

                      <div className="card-content">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="room-type text-uppercase">
                              {r.type}
                            </span>
                            <h4 className="room-title">Room {r.number}</h4>
                          </div>
                          <div className="rating d-flex align-items-center">
    <FaStar className="text-warning" size={14} />
    <span className="ms-1 fw-bold small">
        {r.averageRating?.toFixed(1) || "0.0"}
    </span>
</div>

                        </div>

                        <div className="room-features">
                          {r.services && r.services.length > 0 ? (
                            r.services.slice(0, 3).map((s) => (
                              <span
                                key={s.id}
                                className="badge bg-light text-secondary border fw-normal d-flex align-items-center gap-1"
                              >
                                <span className="text-primary">
                                  {getServiceIcon(s.name)}
                                </span>
                                {s.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small fst-italic">
                              No specific amenities
                            </span>
                          )}

                          {r.services && r.services.length > 3 && (
                            <span className="text-muted small ms-1">
                              +{r.services.length - 3} more
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/rooms/${r.id}`}
                          className="btn-view-details"
                        >
                          View Details <FaArrowRight className="ms-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .rooms-section { background-color: #f8f9fc; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
        .sidebar-widget { border: 1px solid rgba(0,0,0,0.04); }
        .filter-label { font-size: 0.75rem; font-weight: 800; color: #4a5568; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .custom-radio-container:hover { background-color: #e2e8f0 !important; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease; }
        .badge-pill-premium { background-color: #eef2ff; color: #4f46e5; padding: 6px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; display: inline-block; }
        .room-card { background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: all 0.3s ease; display: flex; flex-direction: column; }
        .room-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }
        .card-image-wrapper { position: relative; height: 200px; overflow: hidden; }
        .room-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .room-card:hover .room-image { transform: scale(1.05); }
        .price-badge { position: absolute; bottom: 10px; right: 10px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: baseline; gap: 3px; }
        .price-badge .amount { font-weight: 800; font-size: 1rem; color: #0b2545; }
        .price-badge .currency { font-size: 0.7rem; font-weight: 600; color: #0b2545; }
        .price-badge .period { font-size: 0.7rem; color: #6c757d; }
        .card-content { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
        .room-type { font-size: 0.65rem; font-weight: 700; color: #d4af37; letter-spacing: 0.5px; }
        .room-title { font-size: 1.15rem; font-weight: 800; color: #2d3748; margin-top: 4px; }
        .room-features { display: flex; gap: 8px; margin: 15px 0; font-size: 0.8rem; color: #718096; flex-wrap: wrap; }
        .btn-view-details { margin-top: auto; background: #f7fafc; color: #4a5568; padding: 10px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.9rem; display: flex; justify-content: center; align-items: center; transition: all 0.3s ease; }
        .btn-view-details:hover { background: #0b2545; color: #fff; }
        .skeleton-card { background: #fff; border-radius: 16px; overflow: hidden; height: 100%; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        .skeleton-img { height: 200px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .skeleton-line { height: 10px; background: #eee; border-radius: 4px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (max-width: 991px) { .sidebar-widget { position: static !important; margin-bottom: 2rem; } }
      `}</style>
    </section>
  );
}
