// src/pages/SignUp.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Swal from "sweetalert2";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // ---------------------------------------------------------
  // 1. Helper: Sanitize Phone Input
  // ---------------------------------------------------------
  // يسمح بـ + في البداية، ويزيل أي حروف غير رقمية، ويقص الرقم عند 15 خانة
  const sanitizePhoneInput = (input) => {
    if (!input) return "";
    let hasPlus = input.startsWith("+");
    const digits = input.replace(/\D/g, "");
    const capped = digits.slice(0, 15); // الحد الأقصى الدولي 15
    return hasPlus ? `+${capped}` : capped;
  };

  // ---------------------------------------------------------
  // 2. Helper: Detect Repeating Digits (Fake Numbers)
  // ---------------------------------------------------------
  const isRepeatingDigits = (phone) => {
    const digits = phone.replace(/\D/g, "");
    // يكتشف إذا كان الرقم كله مكونًا من نفس الخانة (مثلاً 111111)
    return /^(\d)\1+$/.test(digits);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      // منع الأرقام في الاسم
      const cleaned = value.replace(/[0-9]/g, "");
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === "phoneNumber") {
      // تنظيف رقم الهاتف فورياً
      const sanitized = sanitizePhoneInput(value);
      setFormData(prev => ({ ...prev, phoneNumber: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = [];
    
    // --- PHONE VALIDATION ---
    const phone = formData.phoneNumber.trim();
    // Regex: Optional +, then 10-15 digits (Allows 0 start)
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!phoneRegex.test(phone)) {
      newErrors.push("Invalid Phone Number. Use 10-15 digits (e.g. 010... or +20...).");
    } else if (isRepeatingDigits(phone)) {
      // التحقق من الأرقام المكررة الوهمية
      newErrors.push("Invalid Phone Number. Cannot use repeating digits (e.g. 111111).");
    }

    // --- PASSWORD VALIDATION ---
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passRegex.test(formData.password)) {
      newErrors.push("Password must have 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special Character.");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords do not match.");
    }

    if (!formData.fullName.trim()) newErrors.push("Full name is required.");
    if (!formData.email.trim()) newErrors.push("Email is required.");

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // تشغيل التحقق (Validation)
    const frontendErrors = validateForm();
    if (frontendErrors.length > 0) {
      setErrors(frontendErrors);
      // تنبيه المستخدم بوجود أخطاء
      window.scrollTo(0, 0); 
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        // إزالة المسافات إن وجدت قبل الإرسال
        phoneNumber: formData.phoneNumber.replace(/\s+/g, ""),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      Swal.fire({
        icon: "success",
        title: "Account Created!",
        text: "Redirecting to login...",
        timer: 1800,
        showConfirmButton: false
      });

      setTimeout(() => navigate("/signin"), 1800);
    } catch (err) {
      console.error(err);
      const res = err.response?.data;
      let errorMessages = [];

      if (res?.errors) {
        Object.values(res.errors).forEach((errArray) => {
          if (Array.isArray(errArray)) errorMessages.push(...errArray);
          else errorMessages.push(String(errArray));
        });
      } else if (res?.message) {
        errorMessages.push(res.message);
      } else if (res?.error) {
        errorMessages.push(res.error);
      } else {
        errorMessages.push("Server error. Please try again later.");
      }

      setErrors(errorMessages);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* LEFT: Hero background (desktop only) */}
      <div className="d-none d-lg-block col-lg-6 p-0 m-0">
        <div
          style={{
            height: "100vh",
            width: "100%",
            backgroundImage:
              'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative"
          }}
        >
          {/* DARK OVERLAY */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.55)",
              padding: "60px 50px",
              color: "white"
            }}
            className="d-flex flex-column justify-content-center"
          >
            <h1 className="display-4 fw-bold mb-3">Join Us Today</h1>
            <p className="lead opacity-90">
              Unlock exclusive deals, track your bookings, and experience premium hospitality.
            </p>

            <ul className="list-unstyled mt-4">
              <li className="mb-2 d-flex align-items-center gap-2">
                <FaCheckCircle className="text-warning" /> Free Cancellation
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <FaCheckCircle className="text-warning" /> Exclusive Member Discounts
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaCheckCircle className="text-warning" /> 24/7 Priority Support
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT: Sign Up Form */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: "560px" }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1" style={{ color: "#4f46e5" }}>
              Create Account
            </h2>
            <p className="text-muted">Join Grand Hotel family today</p>
          </div>

          {errors.length > 0 && (
            <div className="alert alert-danger p-3 mb-4 rounded-3 small border-0 shadow-sm bg-danger bg-opacity-10 text-danger">
              <div className="d-flex align-items-center fw-bold mb-1">
                <FaExclamationCircle className="me-2" /> Please fix the following:
              </div>
              <ul className="mb-0 ps-3">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                name="fullName"
                type="text"
                className="form-control rounded-3 border-light bg-light"
                id="nameInput"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <label htmlFor="nameInput" className="text-muted">
                Full Name
              </label>
            </div>

            <div className="form-floating mb-3">
              <input
                name="email"
                type="email"
                className="form-control rounded-3 border-light bg-light"
                id="emailInput"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="emailInput" className="text-muted">
                Email Address
              </label>
            </div>

            <div className="form-floating mb-3">
              <input
                name="phoneNumber"
                type="tel"
                className="form-control rounded-3 border-light bg-light"
                id="phoneInput"
                // تحسين الـ placeholder لتوضيح الصيغ المقبولة
                placeholder="e.g. 010xxxxxxxxx"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                // السماح بـ 16 خانة (15 رقم + علامة زائد محتملة)
                maxLength={16}
              />
              <label htmlFor="phoneInput" className="text-muted">
                Phone Number
              </label>
            </div>

            <div className="form-floating mb-3">
              <input
                name="password"
                type="password"
                className="form-control rounded-3 border-light bg-light"
                id="passInput"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="passInput" className="text-muted">
                Password
              </label>
              <small className="text-muted ps-2" style={{ fontSize: "0.7rem" }}>
                * Must include Uppercase, Lowercase, Number, Symbol.
              </small>
            </div>

            <div className="form-floating mb-4">
              <input
                name="confirmPassword"
                type="password"
                className="form-control rounded-3 border-light bg-light"
                id="confirmInput"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <label htmlFor="confirmInput" className="text-muted">
                Confirm Password
              </label>
            </div>

            <button
              type="submit"
              className="btn w-100 text-white fw-bold py-3 rounded-pill shadow-sm transition-all"
              style={{ backgroundColor: "#4f46e5", transition: "0.3s" }}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center mt-4 text-muted">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary fw-bold text-decoration-none">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}