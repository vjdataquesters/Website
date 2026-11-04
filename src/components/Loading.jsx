import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import PropTypes from "prop-types";
import "./Loading.css";

export default function Loading({ load, onComplete }) {
  const root = useRef(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!load) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: () => complete.current?.() });
      if (reduced) {
        timeline.from(".anniversary-content", { opacity: 0, duration: 0.3 })
          .to(".anniversary-backdrop", { opacity: 0, duration: 0.4 }, "+=1.5");
      } else {
        timeline.fromTo(".anniversary-ring", { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 2.2, stagger: 0.18, ease: "power2.inOut" }, 0)
          .from(".anniversary-logo", { opacity: 0, scale: 0.2, duration: 1.25, ease: "power3.out" }, 1.05)
          .fromTo(".anniversary-confetti", { opacity: 0, x: 0, y: 100, rotation: 0 }, {
            opacity: 0.8,
            x: (i) => Math.sin(i * 2.399) * 110,
            y: (i) => -100 - (i % 9) * 28,
            rotation: (i) => (i % 2 ? 1 : -1) * 160,
            duration: 1.8, stagger: 0.012, ease: "power2.out",
          }, 1)
          .to(".anniversary-confetti", {
            opacity: 0, y: "+=110", rotation: "+=90",
            duration: 1.6, stagger: 0.012, ease: "sine.in",
          }, 3)
          .fromTo(".anniversary-spark", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.2, stagger: 0.018 }, 0)
          .to(".anniversary-spark", { opacity: 0, x: (i) => Math.cos(i * 2.399) * 65, y: (i) => 30 + Math.sin(i * 2.399) * 65, duration: 1.5, stagger: 0.018 }, 0.4)
          .fromTo(".anniversary-dust", { opacity: 0, y: 55 }, { opacity: (i) => 0.25 + (i % 4) * 0.15, y: -50, duration: 2.8, stagger: 0.025, ease: "sine.out" }, 0.6)
          .from(".anniversary-caption > *", { opacity: 0, y: 22, filter: "blur(5px)", stagger: 0.2, duration: 0.8, ease: "power3.out" }, 1.8)
          .from(".anniversary-rule", { scaleX: 0, duration: 1.2, ease: "expo.out" }, 2.2)
          .to(".anniversary-content", { opacity: 0, scale: 1.035, duration: 0.6 }, 4.5)
          .to(".anniversary-backdrop", { opacity: 0, duration: 0.65 }, 4.8);
      }
    }, root);
    return () => context.revert();
  }, [load, reduced]);

  if (!load) return null;
  return (
    <div ref={root} className="anniversary-intro" role="status" aria-label="Celebrating VJ Data Questers fourth year anniversary">
      <div className="anniversary-backdrop">
        {!reduced && <div className="anniversary-atmosphere" aria-hidden="true">
          {["left", "right"].map((side) => <div key={side} className={`anniversary-celebration anniversary-celebration-${side}`}>
            {Array.from({ length: 42 }, (_, i) => <span key={i} className={`anniversary-confetti ${i % 4 === 0 ? "anniversary-confetti-star" : ""}`} style={{ left: `${25 + (i * 17) % 50}%`, top: `${45 + (i * 13) % 35}%`, backgroundColor: i % 3 === 0 ? "#2dd4bf" : "#f8f9fa" }} />)}
          </div>)}
          {Array.from({ length: 60 }, (_, i) => <span className="anniversary-dust" key={i} style={{ left: `${(i * 61.8) % 100}%`, top: `${20 + (i * 37.3) % 80}%`, width: i % 5 === 0 ? 3 : 1, height: i % 5 === 0 ? 3 : 1 }} />)}
        </div>}
        <div className="anniversary-content">
          <div className="anniversary-emblem">
            <svg viewBox="0 0 360 360" aria-hidden="true">
              <circle className="anniversary-ring" cx="180" cy="180" r="146" pathLength="100" />
              <circle className="anniversary-ring anniversary-ring-inner" cx="180" cy="180" r="138" pathLength="100" />
            </svg>
            {!reduced && Array.from({ length: 90 }, (_, i) => {
              const angle = i / 90 * Math.PI * 2 - Math.PI / 2;
              const radius = 40.5 + Math.sin(i * 12.7) * 3;
              return <span key={i} className="anniversary-spark" style={{ left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%`, width: 1 + i % 3, height: 1 + i % 3 }} />;
            })}
            <img className="anniversary-logo" src="/logo.png" alt="VJ Data Questers" draggable={false} />
          </div>
          <div className="anniversary-caption">
            <p className="anniversary-eyebrow">FOUR YEARS OF CURIOSITY & CONNECTION</p>
            <h1>4th Year Anniversary</h1>
            <div className="anniversary-rule" aria-hidden="true" />
            <p className="anniversary-subtitle">VJ DATA QUESTERS</p>
            <p className="anniversary-date">November 6th <span>/</span> Formation Day</p>
          </div>
        </div>
      </div>
    </div>
  );
}

Loading.propTypes = { load: PropTypes.bool.isRequired, onComplete: PropTypes.func };
