// src/pages/AdminMessages.jsx
import React, { useEffect, useState } from "react";
import { getMessages, markMessageRead, deleteMessage } from "../api";
import Swal from "sweetalert2";
import { 
  FaEnvelope, FaEnvelopeOpen, FaTrash, FaReply, 
  FaCheckDouble, FaSpinner, FaUserCircle, FaClock 
} from "react-icons/fa";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // تحميل الرسائل
  const load = async () => {
    setLoading(true);
    try {
      const res = await getMessages();
      // 🔧 الإصلاح هنا: البيانات موجودة في res.data
      // نتأكد أنها مصفوفة، لو لا نضع مصفوفة فارغة
      const data = res.data || []; 
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load messages", err);
      Swal.fire("Error", "Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // تعليم كـ مقروء
  const handleMarkRead = async (id) => {
    try {
      await markMessageRead(id);
      // تحديث فوري للواجهة
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
      });
      Toast.fire({ icon: 'success', title: 'Marked as read' });
    } catch (err) { 
      console.error(err); 
    }
  };

  // حذف رسالة
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteMessage(id);
          setMessages(prev => prev.filter(m => m.id !== id));
          Swal.fire('Deleted!', 'Message has been deleted.', 'success');
        } catch (err) { 
          Swal.fire("Error", "Failed to delete message", "error");
        }
      }
    });
  };

  // حساب عدد الرسائل غير المقروءة
  const unreadCount = messages.filter(m => !m.isRead).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center text-primary">
          <FaSpinner className="fa-spin fs-1 mb-3" />
          <h5>Loading Inbox...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "1000px" }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5 fade-in">
        <div>
          <h2 className="fw-bold mb-1 text-primary">
            <FaEnvelope className="me-2" /> User Messages
          </h2>
          <p className="text-muted mb-0">View and manage inquiries from guests</p>
        </div>
        <div className="d-flex gap-2">
          <div className="bg-white px-4 py-2 rounded-pill shadow-sm border d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">{messages.length}</span> <span className="text-muted small">Total</span>
          </div>
          {unreadCount > 0 && (
            <div className="bg-danger text-white px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2 animate-pulse">
              <span className="fw-bold">{unreadCount}</span> <span className="small">New</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {messages.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 shadow-sm fade-in">
          <div className="mb-3 text-muted opacity-50" style={{ fontSize: "4rem" }}>
            <FaEnvelopeOpen />
          </div>
          <h4 className="fw-bold text-secondary">Inbox is Empty</h4>
          <p className="text-muted">No new messages at the moment.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {messages.map((m, idx) => (
            <div 
              key={m.id} 
              className={`card border-0 shadow-sm rounded-4 overflow-hidden message-card fade-in-up ${!m.isRead ? 'border-start border-5 border-primary bg-azure' : 'bg-white'}`}
              style={{ animationDelay: `${idx * 0.1}s`, transition: 'all 0.3s ease' }}
            >
              <div className="card-body p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                  
                  {/* User Info & Message */}
                  <div className="d-flex gap-3 w-100">
                    <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center ${!m.isRead ? 'bg-primary text-white' : 'bg-light text-secondary'}`} style={{ width: 50, height: 50, minWidth: 50 }}>
                      <FaUserCircle size={24} />
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap justify-content-between align-items-center mb-1">
                        <h6 className="fw-bold mb-0 text-dark">
                          {m.senderName || "Guest"} 
                          {!m.isRead && <span className="badge bg-primary ms-2 rounded-pill" style={{fontSize: '0.6rem'}}>NEW</span>}
                        </h6>
                        <div className="text-muted small d-flex align-items-center gap-1">
                          <FaClock size={12} />
                          {new Date(m.sentAt || m.createdAt || Date.now()).toLocaleString()}
                        </div>
                      </div>
                      
                      <a href={`mailto:${m.senderEmail}`} className="text-decoration-none small text-secondary mb-2 d-block hover-underline">
                        {m.senderEmail}
                      </a>
                      
                      <div className="bg-light p-3 rounded-3 text-dark mt-2" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {m.text || m.message || m.body}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-row flex-md-column gap-2 ms-md-3 mt-2 mt-md-0 align-self-start">
                    {!m.isRead && (
                      <button 
                        onClick={() => handleMarkRead(m.id)} 
                        className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-2 justify-content-center"
                        title="Mark as Read"
                        style={{ minWidth: '110px' }}
                      >
                        <FaCheckDouble /> Read
                      </button>
                    )}
                    
                    <a 
                      href={`mailto:${m.senderEmail}`} 
                      className="btn btn-sm btn-outline-success rounded-pill d-flex align-items-center gap-2 justify-content-center"
                      title="Reply by Email"
                      style={{ minWidth: '110px' }}
                    >
                      <FaReply /> Reply
                    </a>

                    <button 
                      onClick={() => handleDelete(m.id)} 
                      className="btn btn-sm btn-outline-danger rounded-pill d-flex align-items-center gap-2 justify-content-center"
                      title="Delete Message"
                      style={{ minWidth: '110px' }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .bg-azure { background-color: #f0f9ff; }
        .hover-underline:hover { text-decoration: underline !important; color: #0d6efd !important; }
        .message-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.5s ease forwards; opacity: 0; }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}