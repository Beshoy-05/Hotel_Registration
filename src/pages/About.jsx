import React from "react";
import { FaStar, FaUtensils, FaSpa, FaConciergeBell } from "react-icons/fa";

export default function About() {
  const styles = {
    fadeIn: { animation: "fadeIn 1s ease-out forwards" },
    gradientText: { background: "linear-gradient(45deg, #1e40af, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .feature-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
      `}</style>

      <div className="container py-5" style={styles.fadeIn}>
        {/* Header */}
        <div className="text-center mb-5">
          <h6 className="text-uppercase text-primary fw-bold letter-spacing-2">Welcome to Luxury</h6>
          <h1 className="display-4 fw-bold mb-3">About <span style={styles.gradientText}>Grand Hotel</span></h1>
          <div className="mx-auto bg-primary" style={{ width: "80px", height: "4px", borderRadius: "2px" }}></div>
          <p className="text-secondary mt-4 fs-5 w-75 mx-auto">
            Experience comfort, elegance, and warm hospitality in the heart of Cairo. 
            Where modern luxury meets timeless tradition.
          </p>
        </div>

        {/* Story Section */}
        <div className="row align-items-center mb-5 g-5">
          <div className="col-lg-6">
            <div className="position-relative">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
                alt="Lobby"
                className="img-fluid rounded-4 shadow-lg"
              />
              <div className="position-absolute bg-white p-4 rounded-3 shadow-sm" style={{ bottom: "-20px", right: "-20px", maxWidth: "200px" }}>
                <h5 className="fw-bold text-primary mb-0">25+ Years</h5>
                <small className="text-muted">of Excellence</small>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <h3 className="fw-bold mb-3">Our Story</h3>
            <p className="text-secondary lh-lg">
              Established in 1995, Grand Hotel has been a symbol of luxury and comfort in Cairo for over two decades.
              We’ve welcomed travelers from around the world, blending modern hospitality with classic elegance.
            </p>
            <p className="text-secondary lh-lg">
              Our mission is to offer every guest a memorable stay — from spacious rooms and exquisite dining to personalized service that makes you feel at home.
            </p>
            <div className="d-flex gap-3 mt-4">
              <div className="d-flex align-items-center gap-2">
                <FaStar className="text-warning" /> <span>5-Star Rated</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FaConciergeBell className="text-primary" /> <span>24/7 Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-light p-5 rounded-5 mb-5">
          <div className="text-center mb-5">
            <h3 className="fw-bold">Why Choose Us?</h3>
          </div>
          <div className="row g-4 text-center">
            <FeatureCard 
              icon={<FaStar size={30} />} 
              title="Elegant Suites" 
              text="Spacious rooms with modern designs and stunning city or river views." 
              color="warning"
            />
            <FeatureCard 
              icon={<FaUtensils size={30} />} 
              title="Fine Dining" 
              text="Indulge in a variety of international dishes crafted by our renowned chefs." 
              color="danger"
            />
            <FeatureCard 
              icon={<FaSpa size={30} />} 
              title="Wellness & Spa" 
              text="Enjoy our spa, gym, and rooftop pool for a truly rejuvenating experience." 
              color="success"
            />
          </div>
        </div>
      </div>
    </>
  );
}

const FeatureCard = ({ icon, title, text, color }) => (
  <div className="col-md-4">
    <div className="feature-card bg-white p-4 rounded-4 shadow-sm h-100 transition-all border border-light">
      <div className={`d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-${color} bg-opacity-10 text-${color} mb-3`}>
        {icon}
      </div>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted small">{text}</p>
    </div>
  </div>
);