// src/components/ChatBot.jsx
import React, { useState, useEffect, useRef } from "react";
import { getRooms } from "../api";
import { FaCommentDots, FaPaperPlane, FaTimes, FaRobot } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Welcome to Al-Rawad Hotel! 🏨 How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullContext, setFullContext] = useState("");
  const messagesEndRef = useRef(null);

  const lastSentRef = useRef(0);
  const MIN_SEND_INTERVAL = 800; 

  useEffect(() => {
    async function prepareData() {
      try {
        const staticInfo = `
        --- General Hotel Info ---
        - Name: Al-Rawad Hotel (Premium Stays).
        - Location: 123 Nile Corniche, Cairo, Egypt.
        - Contact Phone: +20 123 456 7890.
        - Contact Email: info@alrawad-hotel.com.
        
        --- Website Sections ---
        1. Contact Page: Users can send messages to the admin/staff using the form on the 'Contact' page.
        2. About Page: Established in 1995, offering gym, spa, and rooftop pool.
        3. Rooms Page: Displays all available rooms with prices.
        4. My Bookings: Users can view and cancel their reservations.
        
        --- Policies ---
        - Check-in: 2:00 PM.
        - Check-out: 11:00 AM.
        - Payment: We accept credit cards via Stripe and Cash.
        `;

        const res = await getRooms();
        const rooms = res.data || [];
        const roomsText = rooms
          .map(
            (r) =>
              `- Room ${r.number}: ${r.type} Suite, Price: ${r.pricePerNight} EGP.`
          )
          .join("\n");

        setFullContext(
          `${staticInfo}\n\n--- Available Rooms ---\n${roomsText}`
        );
      } catch (err) {
        console.error("Error loading bot context", err);
      }
    }
    prepareData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleSend = async (e) => {
    e.preventDefault();

    if (loading) return;
    const now = Date.now();
    if (now - lastSentRef.current < MIN_SEND_INTERVAL) return;
    lastSentRef.current = now;

    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text: `You are the AI Assistant for "Al-Rawad Hotel".
Here is your Knowledge Base (Use this to answer):
${fullContext}
Instructions:
1. Answer questions about rooms, prices, location, and services based on the text above.
2. If the user wants to send a message to admin, tell them: "You can send a message directly from our Contact page."
3. Be helpful, concise, and friendly.
4. If asked about something not in the text, say you don't know but they can call support.`,
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "Understood. I have the full hotel details and room list. I am ready to help.",
              },
            ],
          },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "model" : m.role,
            parts: [{ text: m.text || m.content }],
          })),
        ],
      });

      let attempts = 0;
      const maxAttempts = 3;
      let finalText = null;
      while (attempts < maxAttempts) {
        try {
          attempts++;
          const result = await chat.sendMessage(input);
          const response = result.response;
          finalText = response.text();
          break; 
        } catch (err) {
          const errMsg = String(err).toLowerCase();
          console.warn(`Chat attempt ${attempts} failed:`, err);

          if (
            errMsg.includes("429") ||
            errMsg.includes("quota") ||
            errMsg.includes("rate-limit") ||
            errMsg.includes("exceeded")
          ) {
            if (attempts >= maxAttempts) {
              finalText = null;
              break;
            }
            const backoffMs = attempts * 1000; 
            await wait(backoffMs);
            continue; 
          } else {
     
            throw err;
          }
        }
      }

      if (finalText !== null) {
        setMessages((prev) => [...prev, { role: "model", text: finalText }]);
      } else {
        // بعد محاولات الريتراي فشل بسبب quota أو limit
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text:
              "Sorry — I'm temporarily unable to process that (API quota/rate limit). Please try again in a bit, or contact support.",
          },
        ]);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          zIndex: 9999,
        }}
      >
        {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={28} />}
      </button>

      {isOpen && (
        <div
          className="card shadow-lg border-0"
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "350px",
            height: "500px",
            zIndex: 9999,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div className="card-header bg-primary text-white p-3 d-flex align-items-center gap-2">
            <FaRobot />
            <h6 className="mb-0 fw-bold">Smart Assistant</h6>
          </div>

          <div
            className="card-body bg-light p-3"
            style={{ overflowY: "auto", height: "380px" }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`d-flex mb-2 ${
                  m.role === "user" ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 px-3 rounded-4 ${
                    m.role === "user" ? "bg-primary text-white" : "bg-white text-dark shadow-sm"
                  }`}
                  style={{ maxWidth: "85%", fontSize: "0.9rem" }}
                >
                  {m.text || m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-muted small ms-2">Typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="card-footer bg-white p-2">
            <form onSubmit={handleSend} className="d-flex gap-2">
              <input
                className="form-control border-0 bg-light"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-circle"
                disabled={loading}
              >
                <FaPaperPlane size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
