import React, { useEffect, useState } from "react";
import "./Staging.css";

const cases = [
  {
    id: "001",
    title: "Entrance",
    detail: "Virtual Stage · Residential Listing",
    before: "/staging/wurkzi-staging-case-001-entrance-before.jpg",
    after: "/staging/wurkzi-staging-case-001-entrance-after.jpg",
  },
  {
    id: "002",
    title: "Living Room",
    detail: "Virtual Stage · Residential Listing",
    before: "/staging/wurkzi-staging-case-002-living-room-before.jpg",
    after: "/staging/wurkzi-staging-case-002-living-room-after.jpg",
  },
  {
    id: "003",
    title: "Bedroom",
    detail: "Virtual Declutter + Stage · Residential Listing",
    before: "/staging/wurkzi-staging-case-003-bedroom-before.jpg",
    after: "/staging/wurkzi-staging-case-003-bedroom-after.jpg",
  },
];

function Staging() {
  const [activeCase, setActiveCase] = useState(cases[0]);
  const [split, setSplit] = useState(52);

  useEffect(() => {
    document.title = "Virtual Staging Co. — $35/photo, 24hr Delivery";
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://staging.wurkzi.com/";
    return () => {
      document.title = "Wurkzi";
    };
  }, []);

  const chooseCase = (item) => {
    setActiveCase(item);
    setSplit(52);
  };

  return (
    <div className="staging-page">
      <header className="staging-header">
        <div className="staging-wordmark">Wurkzi Labs Staging Co.</div>
        <div className="staging-rate">$35/photo <span>•</span> 24hr delivery</div>
      </header>

      <main className="staging-main">
        <section className="case-viewer" aria-label={`${activeCase.title} before and after comparison`}>
          <img className="case-image" src={activeCase.after} alt={`Staged ${activeCase.title}`} />
          <div className="before-image" style={{ width: `${split}%` }}>
            <img src={activeCase.before} alt={`Original ${activeCase.title}`} />
          </div>
          <div className="case-label case-label-before">BEFORE</div>
          <div className="case-label case-label-after">AFTER</div>
          <input
            className="comparison-range"
            type="range"
            min="0"
            max="100"
            value={split}
            onChange={(event) => setSplit(event.target.value)}
            aria-label="Move slider to compare original and staged room"
          />
          <div className="comparison-line" style={{ left: `${split}%` }} aria-hidden="true">
            <span>↔</span>
          </div>
          <div className="viewer-caption">
            <span>CASE {activeCase.id}</span>
            <span>{activeCase.title}</span>
          </div>
        </section>

        <section className="staging-workspace">
          <div className="case-index" aria-label="Select a staging case">
            {cases.map((item) => (
              <button
                key={item.id}
                className={`case-thumb ${activeCase.id === item.id ? "is-active" : ""}`}
                type="button"
                onClick={() => chooseCase(item)}
                aria-pressed={activeCase.id === item.id}
              >
                <img src={item.after} alt="" />
                <span>CASE {item.id} — {item.title}</span>
                <small>{item.detail}</small>
              </button>
            ))}
          </div>

          <div className="order-column">
            <form className="staging-form" action="https://formsubmit.co/ashwinshrivastav4@gmail.com" method="POST">
              <input type="hidden" name="_subject" value="New Wurkzi Labs Staging Co. order request" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value="https://staging.wurkzi.com/" />
              <input className="form-honeypot" type="text" name="_honey" tabIndex="-1" autoComplete="off" />
              <div className="form-heading">
                <p>REQUEST AN ORDER</p>
                <span>01 / 01</span>
              </div>
              <label>Name<input required name="name" autoComplete="name" /></label>
              <label>Email<input required type="email" name="email" autoComplete="email" /></label>
              <label>Property address<input required name="address" autoComplete="street-address" /></label>
              <label>Rooms / image count<input required name="rooms" placeholder="e.g. 4" inputMode="numeric" /></label>
              <label>Image link<textarea required name="link" placeholder="Google Drive, Dropbox, or WeTransfer" /></label>
              <button type="submit">SEND ORDER REQUEST <span>→</span></button>
            </form>

            <details className="service-details">
              <summary>ORDER DETAILS <span>+</span></summary>
              <dl>
                <div><dt>Virtual staging</dt><dd>$35 / image</dd></div>
                <div><dt>Turnaround</dt><dd>24 hours</dd></div>
                <div><dt>Rush</dt><dd>4 hours +$15</dd></div>
                <div><dt>Revisions</dt><dd>2 rounds included</dd></div>
                <div><dt>Delivery</dt><dd>Drive / Dropbox / WeTransfer</dd></div>
                <div><dt>License</dt><dd>Full MLS / marketing rights</dd></div>
                <div><dt>File specs</dt><dd>4000px long edge, sRGB, JPG &lt;10MB</dd></div>
                <div><dt>Source required</dt><dd>1 raw/JPG per room, 24MP+ preferred, verticals corrected</dd></div>
              </dl>
            </details>
          </div>
        </section>
      </main>

      <footer className="staging-footer">
        <a className="email-link" href="mailto:ashwinshrivastav4@gmail.com" aria-label="Email Wurkzi Labs Staging Co.">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5.5h17v13h-17zM4.5 6.5 12 13l7.5-6.5" /></svg>
        </a>
        <a href="tel:+12487640275">+1 248 764 0275</a>
        <span>Wurkzi Labs</span>
      </footer>
    </div>
  );
}

export default Staging;
