// src/pages/AddRoom.jsx
import React, { useState, useRef } from "react";
import { createRoom } from "../api";
import { useNavigate } from "react-router-dom";

export default function AddRoom() {
  const [number, setNumber] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [createdRoom, setCreatedRoom] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("Number", String(number).trim());
      formData.append("Type", String(type).trim());
      formData.append("PricePerNight", String(price).trim());
      if (image) formData.append("Image", image);

      const res = await createRoom(formData);
      const data = res.data ?? res;

      // save created room for preview
      setCreatedRoom(data);
      setStatus("success");

      // dispatch global event so Rooms list (or any listener) knows a new room was created
      window.dispatchEvent(new CustomEvent("room-created", { detail: data }));

      // reset form
      setNumber("");
      setType("");
      setPrice("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Create Room Error:", err);
      if (err?.response?.data) console.error(err.response.data);
      setStatus("error");
    }
  };

  return (
    <div className="container py-4">
      <h2>Add New Room</h2>

      <form onSubmit={handleSubmit} className="mb-3">
        <div className="mb-2">
          <label>Room Number</label>
          <input className="form-control" value={number} onChange={(e) => setNumber(e.target.value)} required />
        </div>

        <div className="mb-2">
          <label>Room Type</label>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select type</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
          </select>
        </div>

        <div className="mb-2">
          <label>Price per Night</label>
          <input type="number" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>

        <div className="mb-2">
          <label>Room Image</label>
          <input ref={fileInputRef} type="file" className="form-control" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} required />
        </div>

        <button className="btn btn-primary" type="submit">Add Room</button>
      </form>

      {status === "loading" && <div>Submitting...</div>}
      {status === "success" && <div className="text-success">Room successfully added!</div>}
      {status === "error" && <div className="text-danger">Error while adding room — check console</div>}

      {createdRoom && (
        <div className="card mt-4" style={{ maxWidth: 720 }}>
          <div className="card-header"><strong>Created Room Preview</strong></div>
          <div className="row g-0">
            <div className="col-md-5">
              <img
                src={createdRoom.imageUrl || createdRoom.ImageUrl || createdRoom.Image || createdRoom.image}
                alt={`Room ${createdRoom.number ?? createdRoom.Number}`}
                className="img-fluid"
                onError={(e) => { e.currentTarget.src = "/default.jpg"; }}
              />
            </div>
            <div className="col-md-7 p-3">
              <h5>Room #{createdRoom.number ?? createdRoom.Number}</h5>
              <p>Type: {createdRoom.type ?? createdRoom.Type}</p>
              <p>Price: {createdRoom.pricePerNight ?? createdRoom.PricePerNight} EGP / night</p>
              <div className="mt-2">
                <button className="btn btn-outline-primary me-2" onClick={() => navigate("/rooms")}>View All Rooms</button>
                <button className="btn btn-outline-secondary" onClick={() => setCreatedRoom(null)}>Close Preview</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
