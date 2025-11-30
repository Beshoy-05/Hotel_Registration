import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchForm() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (checkIn) qs.set("checkIn", checkIn);
    if (checkOut) qs.set("checkOut", checkOut);
    if (guests) qs.set("guests", guests);
    navigate(`/rooms?${qs.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="d-flex gap-2">
      <input type="date" className="form-control" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
      <input type="date" className="form-control" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
      <input type="number" min="1" className="form-control" value={guests} onChange={e => setGuests(e.target.value)} />
      <button className="btn btn-primary">Search</button>
    </form>
  );
}
