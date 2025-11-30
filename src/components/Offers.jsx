import React from "react";

export default function Offers() {
  // لو عايزها dynamic نقدر نطلبها من /api/Offers
  const offers = [
    { id: 1, title: "Weekend Special", desc: "20% off on weekend stays", badge: "20% OFF" },
    { id: 2, title: "Monthly Stay", desc: "Save when you stay longer", badge: "Best Value" },
  ];

  return (
    <section className="container py-5">
      <h2 className="mb-4">Offers</h2>
      <div className="row g-3">
        {offers.map(o => (
          <div className="col-md-6" key={o.id}>
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>{o.title}</h5>
                  <p className="text-muted mb-0">{o.desc}</p>
                </div>
                <div className="badge bg-primary text-white">{o.badge}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
