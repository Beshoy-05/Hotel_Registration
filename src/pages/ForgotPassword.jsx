// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { forgotPassword, resetPassword } from "../api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaLock, FaEnvelope, FaKey, FaCheckCircle } from "react-icons/fa";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Reset
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState(""); // ✅ حقل التأكيد الجديد

  const [loading, setLoading] = useState(false);

  // الخطوة 1: إرسال الكود
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      Swal.fire({
        icon: 'success',
        title: 'Code Sent!',
        text: 'Please check your email for the verification code.'
      });
      setStep(2);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to send code", "error");
    } finally {
      setLoading(false);
    }
  };

  // الخطوة 2: تغيير الباسورد
  const handleReset = async (e) => {
    e.preventDefault();

    // ✅ 1. التحقق من التطابق في الفرونت إند أولاً
    if (newPass !== confirmPass) {
        return Swal.fire({
            icon: 'warning',
            title: 'Mismatch',
            text: 'Passwords do not match! Please try again.'
        });
    }

    setLoading(true);
    try {
      // ✅ 2. إرسال البيانات (بما فيها ConfirmNewPassword)
      await resetPassword({ 
          token: code, 
          newPassword: newPass,
          confirmNewPassword: confirmPass 
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Password Reset!',
        text: 'Your password has been updated successfully. Please login.',
        confirmButtonText: 'Go to Login'
      }).then(() => navigate("/signin"));

    } catch (err) {
      // عرض رسالة الخطأ القادمة من الباك إند (مثل: Token expired)
      const msg = err.response?.data?.error || 
                  (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join('\n') : "Failed to reset password");
      
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "80vh" }}>
      <div className="card p-4 p-md-5 shadow-lg border-0 rounded-4" style={{ width: "450px", maxWidth: "95%" }}>
        
        <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
                {step === 1 ? <FaEnvelope size={24} /> : <FaLock size={24} />}
            </div>
            <h3 className="fw-bold text-dark">{step === 1 ? "Forgot Password?" : "Set New Password"}</h3>
            <p className="text-muted small mb-0">
                {step === 1 ? "Enter your email to receive a reset code." : "Create a new strong password for your account."}
            </p>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Email Address</label>
              <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaEnvelope /></span>
                  <input 
                    type="email" 
                    className="form-control border-start-0 ps-0" 
                    placeholder="name@example.com" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
              </div>
            </div>
            <button className="btn btn-primary w-100 py-2 rounded-3 fw-bold shadow-sm" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </button>
            <button 
                type="button" 
                className="btn btn-link w-100 mt-3 text-decoration-none text-muted small"
                onClick={() => navigate('/signin')}
            >
                Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Verification Code</label>
              <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaKey /></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0" 
                    placeholder="Enter 6-digit code" 
                    required 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                  />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">New Password</label>
              <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaLock /></span>
                  <input 
                    type="password" 
                    className="form-control border-start-0 ps-0" 
                    placeholder="********" 
                    required 
                    value={newPass} 
                    onChange={e => setNewPass(e.target.value)} 
                  />
              </div>
            </div>

            {/* ✅ حقل تأكيد كلمة المرور */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Confirm Password</label>
              <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaCheckCircle /></span>
                  <input 
                    type="password" 
                    className="form-control border-start-0 ps-0" 
                    placeholder="********" 
                    required 
                    value={confirmPass} 
                    onChange={e => setConfirmPass(e.target.value)} 
                  />
              </div>
            </div>

            <button className="btn btn-success w-100 py-2 rounded-3 fw-bold shadow-sm" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
            <button 
                type="button" 
                className="btn btn-link w-100 mt-3 text-decoration-none text-muted small"
                onClick={() => setStep(1)}
            >
                Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}