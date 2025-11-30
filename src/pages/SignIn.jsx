// src/pages/SignIn.jsx
import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaEye, FaEyeSlash, FaClock, FaCheckCircle, FaHotel } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../api"; 
import { GoogleLogin } from '@react-oauth/google';

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // --- Helpers (Same logic as before) ---
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) { return null; }
  };

  const handleAuthSuccess = (tokenString) => {
    if (!tokenString) throw new Error("No token returned.");
    localStorage.setItem("jwt_token", tokenString);
    const decodedData = parseJwt(tokenString);
    
    const rawRole = decodedData["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedData["role"] || "user";
    const rawName = decodedData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decodedData["unique_name"] || "";
    const rawEmail = decodedData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decodedData["email"] || "";
    const rawPhone = decodedData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"] || decodedData["mobilephone"] || "";

    let finalRole = String(rawRole).toLowerCase() === "admin" ? "admin" : "user";

    const userObj = { name: rawName, fullName: rawName, email: rawEmail, phoneNumber: rawPhone, role: finalRole };

    localStorage.setItem("user", JSON.stringify(userObj));
    window.dispatchEvent(new Event("user-login"));

    setFailedAttempts(0);
    setLockoutTimer(0);

    navigate(finalRole === "admin" ? "/admin-dashboard" : "/", { replace: true });
  };

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("jwt_token");
      if (token && storedUser) {
        const currentRole = storedUser.role ? String(storedUser.role).toLowerCase().trim() : "user";
        navigate(currentRole === "admin" ? "/admin-dashboard" : "/", { replace: true });
      }
    } catch (e) { localStorage.clear(); }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 5) {
      setFailedAttempts(0);
      setError(""); 
    }
    return () => clearInterval(timer);
  }, [lockoutTimer, failedAttempts]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (lockoutTimer > 0) return;

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await login({ email, password });
      handleAuthSuccess(res?.data?.token || res?.data?.accessToken || res?.data);
    } catch (err) {
      console.error("Login Error:", err);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockoutTimer(15);
        setError("Too many failed attempts. Please wait 15 seconds.");
      } else {
        if (err.response?.status === 401) setError("Invalid Email or Password.");
        else if (err.response?.data?.error) setError(err.response.data.error);
        else setError("Something went wrong. Please try again.");
      }
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
        const res = await googleLogin(credentialResponse.credential);
        handleAuthSuccess(res.data.token);
    } catch (err) {
        console.error("Google Login Error:", err);
        setError("Google Sign-In Failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      
      {/*  LEFT SIDE: Hero Image */}
      <div className="d-none d-lg-block col-lg-6 position-relative overflow-hidden">
        <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Luxury Hotel" 
            className="w-100 h-100 object-fit-cover"
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex flex-column justify-content-center px-5 text-white">
            <div className="mb-4">
                <FaHotel size={50} className="mb-3 text-warning"/>
                <h1 className="display-4 fw-bold">Al-Rawad Hotel</h1>
                <p className="lead opacity-75">Experience luxury like never before. Your premium stay awaits.</p>
            </div>
            <div className="d-flex gap-3">
                <div className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success"/> Best Prices</div>
                <div className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success"/> 24/7 Support</div>
            </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{maxWidth: '450px'}}>
            
            <div className="text-center mb-5">
                <h2 className="fw-bold text-dark mb-1">Welcome Back!</h2>
                <p className="text-muted">Please enter your details to sign in.</p>
            </div>

            {/* Google Button */}
            <div className="mb-4">
                <div className="d-flex justify-content-center w-100">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Login Failed")}
                        theme="outline"
                        size="large"
                        width="400"
                        text="continue_with"
                        shape="pill"
                    />
                </div>
            </div>

            <div className="d-flex align-items-center mb-4">
                <hr className="flex-grow-1 opacity-10" /> 
                <span className="text-muted small px-3 text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Or sign in with email</span> 
                <hr className="flex-grow-1 opacity-10" />
            </div>

            {error && (
                <div className={`alert ${lockoutTimer > 0 ? "alert-warning" : "alert-danger"} d-flex align-items-center gap-3 p-3 rounded-3 shadow-sm border-0 mb-4`}>
                    {lockoutTimer > 0 ? <FaClock size={20} /> : <FaExclamationTriangle size={20} />} 
                    <div>{error}</div>
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div className="form-floating mb-3">
                    <input 
                        type="email" 
                        className="form-control rounded-3 border-light bg-light" 
                        id="emailInput" 
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || lockoutTimer > 0}
                    />
                    <label htmlFor="emailInput" className="text-muted">Email address</label>
                </div>

                <div className="form-floating mb-4 position-relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control rounded-3 border-light bg-light" 
                        id="passInput" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading || lockoutTimer > 0}
                    />
                    <label htmlFor="passInput" className="text-muted">Password</label>
                    
                    <button 
                        type="button"
                        className="btn border-0 position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        disabled={lockoutTimer > 0}
                    >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    
                    <Link to="/forgot-password" className="small text-primary fw-bold text-decoration-none">Forgot Password?</Link>
                </div>

                <button 
                    type="submit" 
                    className={`btn w-100 py-3 rounded-pill fw-bold shadow-sm ${lockoutTimer > 0 ? "btn-secondary" : "btn-primary"}`}
                    disabled={loading || lockoutTimer > 0}
                    style={{transition: '0.3s'}}
                >
                    {lockoutTimer > 0 
                        ? `Please wait ${lockoutTimer}s...` 
                        : (loading ? "Signing in..." : "Sign In")}
                </button>
            </form>

            <p className="text-center mt-5 text-muted">
                Don't have an account? <Link to="/signup" className="text-primary fw-bold text-decoration-none">Sign up for free</Link>
            </p>

        </div>
      </div>
    </div>
  );
}