// src/App.jsx
import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Routes, Route } from "react-router-dom"; 


import PaymentPage from "./pages/PaymentPage";
// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RoomsSection from "./components/Rooms";
import Offers from "./components/Offers";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot"; 

// Pages (routes)
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import RoomsPage from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import EditProfile from "./pages/EditProfile";

// Admin / extra pages
import AdminMessages from "./pages/AdminMessages";
import AddRoom from "./pages/AddRoom";

// ✅ استيراد المفضلة فقط (تم حذف السلة)
import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <> 
      <ChatBot />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <RoomsSection />
              <Offers />
              <About />
              <Contact />
              <Footer />
            </>
          }
        />

        {/* Authentication */}
        <Route path="/signin" element={<><Navbar /><SignIn /><Footer /></>} />
        <Route path="/signup" element={<><Navbar /><SignUp /><Footer /></>} />
        <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Public pages */}
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/profile" element={<><Navbar /><Profile /><Footer /></>} />

        {/* Rooms & bookings */}
        <Route path="/rooms" element={<><Navbar /><RoomsPage /><Footer /></>} />
        <Route path="/rooms/:id" element={<><Navbar /><RoomDetails /><Footer /></>} />
        
        {/* مسارات الحجز المباشر */}
        <Route path="/book/:id" element={<><Navbar /><BookingForm /><Footer /></>} />
        <Route path="/book" element={<><Navbar /><BookingForm /><Footer /></>} />
        
        <Route path="/my-bookings" element={<><Navbar /><MyBookings /><Footer /></>} />

        {/* Admin */}
        <Route path="/admin-dashboard" element={<><Navbar /><AdminDashboard /><Footer /></>} />
        <Route path="/admin/messages" element={<><Navbar /><AdminMessages /><Footer /></>} />
        <Route path="/rooms/add" element={<><Navbar /><AddRoom /><Footer /></>} />
        
        {/* Payment */}
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        
        {/* مسار المفضلة */}
        <Route path="/wishlist" element={<><Navbar /><Wishlist /><Footer /></>} />
      
      </Routes>
    </>
  );
}

export default App;