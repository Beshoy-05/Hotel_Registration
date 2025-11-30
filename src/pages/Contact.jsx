// src/pages/Contact.jsx
import React, { useState } from "react";
import { sendMessage } from "../api";
import Swal from "sweetalert2";
import { 
  FaPaperPlane, FaUser, FaEnvelope, FaCommentDots, 
  FaMapMarkerAlt, FaPhoneAlt, FaFacebook, FaTwitter, FaInstagram 
} from "react-icons/fa";

export default function Contact() {
  const [form, setForm] = useState({ username: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

const handleChange = (e) => {
  let { name, value } = e.target;


  if (name === "username") {
    value = value.replace(/[0-9]/g, ""); 
  }

  setForm({ ...form, [name]: value });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      await sendMessage({
        Username: form.username,
        Email: form.email,
        Message: form.message
      });

      // نجاح
      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: 'Thank you for contacting us. We will get back to you soon.',
        confirmButtonColor: '#d4af37'
      });

      setForm({ username: "", email: "", message: "" }); 
    } catch (err) {
      
      console.error("Contact error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      
      {/* Header Section */}
      <div className="text-center mb-5" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <h6 className="text-primary fw-bold text-uppercase letter-spacing-2">Get In Touch</h6>
        <h2 className="fw-bold display-5 mb-3">Contact Us</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>
          Have questions about your stay or need assistance? Fill out the form below and our team will reach out to you shortly.
        </p>
      </div>

      <div className="row g-5 align-items-stretch">
        
        {/* Left Column: Contact Info */}
        <div className="col-lg-5" style={{ animation: "fadeInLeft 0.8s ease-out" }}>
          <div className="h-100 bg-primary bg-opacity-10 p-5 rounded-5 position-relative overflow-hidden">
            {/* Decorative Circle */}
            <div className="position-absolute top-0 end-0 bg-primary rounded-circle opacity-10" style={{ width: 200, height: 200, transform: "translate(50%, -50%)" }}></div>
            
            <h3 className="fw-bold mb-4 text-dark">Contact Information</h3>
            
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-start gap-3">
                <div className="bg-white p-3 rounded-circle shadow-sm text-primary"><FaMapMarkerAlt size={20}/></div>
                <div>
                  <h6 className="fw-bold mb-1">Address</h6>
                  <p className="text-muted small mb-0">123 Nile Corniche, Cairo, Egypt</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-white p-3 rounded-circle shadow-sm text-primary"><FaPhoneAlt size={20}/></div>
                <div>
                  <h6 className="fw-bold mb-1">Phone</h6>
                  <p className="text-muted small mb-0">+20 123 456 7890</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-white p-3 rounded-circle shadow-sm text-primary"><FaEnvelope size={20}/></div>
                <div>
                  <h6 className="fw-bold mb-1">Email</h6>
                  <p className="text-muted small mb-0">info@alrawad-hotel.com</p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h6 className="fw-bold mb-3">Follow Us</h6>
              <div className="d-flex gap-3">
                <SocialBtn icon={<FaFacebook />} />
                <SocialBtn icon={<FaTwitter />} />
                <SocialBtn icon={<FaInstagram />} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="col-lg-7" style={{ animation: "fadeInRight 0.8s ease-out" }}>
          <div className="bg-white p-5 rounded-5 shadow-lg border-0 h-100">
            <form onSubmit={handleSubmit}>
              
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-secondary ps-3"><FaUser /></span>
                  <input 
                    name="username" 
                    type="text" 
                    className="form-control bg-light border-0 py-3" 
                    placeholder="e.g. Ahmed Mohamed" 
                    value={form.username} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-secondary ps-3"><FaEnvelope /></span>
                  <input 
                    name="email" 
                    type="email" 
                    className="form-control bg-light border-0 py-3" 
                    placeholder="name@example.com" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">Message</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-secondary ps-3 pt-3 align-items-start"><FaCommentDots /></span>
                  <textarea 
                    name="message" 
                    className="form-control bg-light border-0 py-3" 
                    rows="5" 
                    placeholder="How can we help you?" 
                    value={form.message} 
                    onChange={handleChange} 
                    required
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm transition-transform"
                disabled={loading}
                style={{ transition: "transform 0.2s" }}
                onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                {loading ? "Sending..." : <><FaPaperPlane className="me-2" /> Send Message</>}
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .letter-spacing-2 { letter-spacing: 2px; }
      `}</style>
    </div>
  );
}

// Helper Component for Social Buttons
const SocialBtn = ({ icon }) => (
  <a href="#" className="d-flex align-items-center justify-content-center bg-white text-primary rounded-circle shadow-sm text-decoration-none" 
     style={{ width: 40, height: 40, transition: 'all 0.3s' }}
     onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
     onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#2563eb'; }}
  >
    {icon}
  </a>
);