import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="hotel-footer pt-5 pb-4">
      <div className="container">
        <div className="row g-5">
          
          {/* 1. Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="logo-box">H</div>
              <div>
                <h4 className="fw-bold text-white mb-0 font-playfair">Al-Rawad</h4>
                <small className="text-gold text-uppercase letter-spacing-2" style={{fontSize: '0.7rem'}}>Luxury Hotel</small>
              </div>
            </div>
            <p className="text-light-gray lh-lg mb-4">
              Immerse yourself in an atmosphere of luxury and comfort. 
              We redefine hospitality with our premium services and elegant stays.
            </p>
            <div className="d-flex gap-2">
              <SocialIcon icon={<FaFacebookF />} />
              <SocialIcon icon={<FaTwitter />} />
              <SocialIcon icon={<FaInstagram />} />
              <SocialIcon icon={<FaLinkedinIn />} />
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="text-white fw-bold mb-4 font-playfair">Explore</h5>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/rooms" className="footer-link">Our Rooms</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
              <li><Link to="/my-bookings" className="footer-link">My Bookings</Link></li>
            </ul>
          </div>

          {/* 3. Contact Info */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-white fw-bold mb-4 font-playfair">Contact</h5>
            <ul className="list-unstyled d-flex flex-column gap-4">
              <li className="d-flex gap-3 align-items-start">
                <FaMapMarkerAlt className="text-gold mt-1 flex-shrink-0" />
                <span className="text-light-gray">123 Nile Corniche, Cairo, Egypt</span>
              </li>
              <li className="d-flex gap-3 align-items-center">
                <FaPhoneAlt className="text-gold flex-shrink-0" />
                <span className="text-light-gray">+20 123 456 7890</span>
              </li>
              <li className="d-flex gap-3 align-items-center">
                <FaEnvelope className="text-gold flex-shrink-0" />
                <span className="text-light-gray">info@alrawad-hotel.com</span>
              </li>
            </ul>
          </div>

          {/* 4. Gallery (Instead of Newsletter) */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-white fw-bold mb-4 font-playfair">Gallery</h5>
            <div className="row g-2">
              {[
                "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=150",
                "https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=150",
                "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=150",
                "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=150",
                "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=150",
                "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=150"
              ].map((src, i) => (
                <div className="col-4" key={i}>
                  <div className="gallery-item rounded-2 overflow-hidden">
                    <img src={src} alt="Hotel" className="w-100 h-100 object-fit-cover" style={{minHeight: '60px'}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <hr className="border-secondary opacity-25 my-5" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-light-gray small">
          <p className="mb-2 mb-md-0">&copy; {new Date().getFullYear()} Al-Rawad Hotel. All Rights Reserved.</p>
          <div className="d-flex gap-4">
            <Link to="#" className="footer-link-sm">Privacy Policy</Link>
            <Link to="#" className="footer-link-sm">Terms of Service</Link>
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --footer-bg: #0b1120; /* كحلي غامق جداً */
          --footer-gold: #d4af37;
          --footer-text: #e2e8f0; /* رمادي فاتح جداً للقراءة */
        }
        .hotel-footer {
          background-color: var(--footer-bg);
          color: var(--footer-text);
          border-top: 4px solid var(--footer-gold);
        }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .text-gold { color: var(--footer-gold) !important; }
        .text-light-gray { color: #cbd5e1 !important; }
        .letter-spacing-2 { letter-spacing: 2px; }

        /* Logo Box */
        .logo-box {
          width: 45px; height: 45px;
          background: linear-gradient(135deg, var(--footer-gold), #f0e68c);
          color: #000;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 1.5rem;
          font-family: 'Playfair Display', serif;
          border-radius: 8px;
        }

        /* Links */
        .footer-link {
          color: #94a3b8; text-decoration: none; transition: 0.3s;
          display: inline-block;
        }
        .footer-link:hover {
          color: var(--footer-gold); padding-left: 5px;
        }
        .footer-link-sm {
          color: #64748b; text-decoration: none; transition: 0.3s;
        }
        .footer-link-sm:hover { color: #fff; }

        /* Social Icons */
        .social-btn {
          width: 38px; height: 38px;
          background: rgba(255,255,255,0.05);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          transition: 0.3s;
          text-decoration: none;
        }
        .social-btn:hover {
          background: var(--footer-gold);
          color: #000;
          transform: translateY(-3px);
        }

        /* Gallery Hover */
        .gallery-item img { transition: transform 0.3s ease; opacity: 0.8; cursor: pointer; }
        .gallery-item:hover img { transform: scale(1.1); opacity: 1; }
      `}</style>
    </footer>
  );
}

const SocialIcon = ({ icon }) => (
  <a href="#" className="social-btn">
    {icon}
  </a>
);