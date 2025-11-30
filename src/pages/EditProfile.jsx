// src/pages/EditProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaSave, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import { getMe, updateProfile } from "../api";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: ""
  });

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) { return null; }
  };

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setFormData({
          fullName: storedUser.fullName || storedUser.name || "",
          email: storedUser.email || "",
          phoneNumber: storedUser.phoneNumber || ""
        });
      } else {
        navigate("/signin");
      }
    } catch (err) {
      navigate("/signin");
    }
  }, [navigate]);

  const sanitizePhoneInput = (input) => {
    if (!input) return "";
    let hasPlus = input.startsWith("+");
    const digits = input.replace(/\D/g, "");
    const capped = digits.slice(0, 15);
    return hasPlus ? `+${capped}` : capped;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fullName") {
      const cleaned = value.replace(/[0-9]/g, "");
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === "phoneNumber") {
      const sanitized = sanitizePhoneInput(value);
      setFormData(prev => ({ ...prev, phoneNumber: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ---------------------------------------------------------
  // دالة مساعدة للتحقق من الأرقام المكررة
  // ---------------------------------------------------------
  const isRepeatingDigits = (phone) => {
    // استخرج الأرقام فقط (بدون +)
    const digits = phone.replace(/\D/g, "");
    // التعبير النمطي /^(\d)\1+$/ يعني:
    // (\d) : التقط رقمًا
    // \1+  : وتأكد أن كل ما يليه هو نفس ذلك الرقم
    return /^(\d)\1+$/.test(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const phone = formData.phoneNumber.trim();

      // 1. التحقق الأساسي (الطول والبداية)
      // يسمح بـ 010... أو +2010...
      const phoneRegex = /^\+?\d{10,15}$/;
      
      if (!phoneRegex.test(phone)) {
        await Swal.fire({
          icon: "error",
          title: "Invalid Phone Number",
          text: "Please enter a valid phone number (10-15 digits). Example: 01012345678 or +2010...",
        });
        setLoading(false);
        return;
      }

      // 2. التحقق الجديد: منع الأرقام المكررة (مثل 11111111111)
      if (isRepeatingDigits(phone)) {
        await Swal.fire({
          icon: "error",
          title: "Fake Number Detected",
          text: "You cannot use a sequence of repeating digits as a phone number.",
        });
        setLoading(false);
        return;
      }

      // ... باقي الكود كما هو
      if (!formData.fullName.trim()) {
        await Swal.fire({ icon: "error", title: "Invalid Name", text: "Please enter a valid name." });
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        await Swal.fire({ icon: "error", title: "Invalid Email", text: "Please enter a valid email address." });
        setLoading(false);
        return;
      }

      const payload = new FormData();
      payload.append("FullName", formData.fullName.trim());
      payload.append("Email", formData.email.trim());
      payload.append("PhoneNumber", phone.replace(/\s+/g, ""));

      const res = await updateProfile(payload);

      const newToken = res?.data?.token;
      const returnedUser = res?.data?.user || null;

      if (newToken) {
        localStorage.setItem("jwt_token", newToken);
        const decoded = parseJwt(newToken);
        const rawRole = decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded?.["role"] || "user";
        const rawName = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded?.["unique_name"] || formData.fullName;
        const rawEmail = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded?.["email"] || formData.email;
        const rawPhone = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"] || decoded?.["mobilephone"] || formData.phoneNumber;

        const updatedUser = {
          fullName: rawName,
          email: rawEmail,
          phoneNumber: rawPhone,
          role: String(rawRole).toLowerCase() === "admin" ? "admin" : "user"
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else if (returnedUser) {
        const updatedUser = {
          fullName: returnedUser.fullName || formData.fullName,
          email: returnedUser.email || formData.email,
          phoneNumber: returnedUser.phoneNumber || formData.phoneNumber,
          role: returnedUser.role || "user"
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      window.dispatchEvent(new Event("user-login"));

      await Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your information has been saved successfully.',
        timer: 1400,
        showConfirmButton: false
      });

      navigate("/profile");
    } catch (err) {
      console.error("Update profile error:", err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.response?.data || err?.message;
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: serverMsg || "Something went wrong. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "85vh", backgroundColor: "#f8f9fa" }}>
      <div className="bg-white p-5 rounded-4 shadow-lg" style={{ width: "500px", maxWidth: "95%" }}>
        
        <div className="d-flex align-items-center mb-4">
            <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle me-3 text-muted" aria-label="back">
                <FaArrowLeft />
            </button>
            <h3 className="fw-bold mb-0 text-dark">Edit Profile</h3>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
             <label className="form-label fw-bold small text-muted text-uppercase">Full Name</label>
             <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-0 text-primary"><FaUser /></span>
                <input 
                    name="fullName" 
                    type="text" 
                    className="form-control bg-light border-0 fs-6" 
                    placeholder="Your Name"
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                />
             </div>
          </div>

          <div className="mb-4">
             <label className="form-label fw-bold small text-muted text-uppercase">Email Address</label>
             <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-0 text-primary"><FaEnvelope /></span>
                <input 
                    name="email" 
                    type="email" 
                    className="form-control bg-light border-0 fs-6" 
                    placeholder="name@example.com"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                />
             </div>
          </div>

          <div className="mb-5">
             <label className="form-label fw-bold small text-muted text-uppercase">Phone Number</label>
             <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-0 text-primary"><FaPhone /></span>
                <input 
                    name="phoneNumber" 
                    type="tel" 
                    className="form-control bg-light border-0 fs-6" 
                    placeholder="e.g. 01012345678"
                    value={formData.phoneNumber} 
                    onChange={handleChange} 
                    required 
                    maxLength={16}
                />
             </div>
             <small className="text-muted">Enter valid phone number.</small>
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary btn-lg fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                {loading ? "Saving..." : <><FaSave /> Save Changes</>}
            </button>
            <button type="button" className="btn btn-light text-muted fw-bold rounded-3" onClick={() => navigate("/profile")} disabled={loading}>
                Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}