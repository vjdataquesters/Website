import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import PropTypes from "prop-types";
import GlowBackground from "./GlowBackground";
import "./AnniversaryLanding.css";

// A continuous illuminated stroke: diagonal, crossbar, then the upright of 4.
const vertices = [[0.2, -0.8], [-0.55, 0.25], [0.6, 0.25], [0.3, 0.25], [0.3, -0.8], [0.3, 0.85]];
const lengths = vertices.slice(1).map((p, i) => Math.hypot(p[0] - vertices[i][0], p[1] - vertices[i][1]));
const totalLength = lengths.reduce((a, b) => a + b, 0);
const fireworks = [
  { x: 16, y: 33, delay: 0.1 }, { x: 81, y: 24, delay: 0.48 },
  { x: 29, y: 68, delay: 0.9 }, { x: 91, y: 59, delay: 1.2 },
  { x: 8, y: 62, delay: 1.55 }, { x: 69, y: 73, delay: 1.85 },
  { x: 35, y: 23, delay: 2.1 }, { x: 75, y: 40, delay: 2.35 },
];
function fourPoint(progress) {
  let distance = progress * totalLength;
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const fraction = Math.min(distance / lengths[i], 1);
      return vertices[i].map((v, axis) => v + (vertices[i + 1][axis] - v) * fraction);
    }
    distance -= lengths[i];
  }
}

export default function AnniversaryLanding({ ready, onReady }) {
  const root = useRef(null);
  const canvas = useRef(null);
  const callback = useRef(onReady);
  callback.current = onReady;
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!ready) return;
    const surface = canvas.current;
    const ctx = surface.getContext("2d");
    const state = { trace: 0, morph: 0, size: 1, alpha: 1 };
    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      surface.width = width * dpr;
      surface.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    const draw = (time = 0) => {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width * 0.33, height * 0.34, 240);
      const halfTrace = state.trace / 2;
      const point = (t) => {
        const [fx, fy] = fourPoint(t);
        const angle = t * Math.PI * 2 - Math.PI / 2;
        return [
          width / 2 + (fx * (1 - state.morph) + Math.cos(angle) * 0.7 * state.morph) * scale * state.size,
          height / 2 + (fy * (1 - state.morph) + Math.sin(angle) * 0.7 * state.morph) * scale * state.size,
        ];
      };
      // Broad translucent ribbons surround a bright core; highlights travel along it.
      const ribbon = ctx.createLinearGradient(width / 2 - scale, height / 2 - scale, width / 2 + scale, height / 2 + scale);
      ribbon.addColorStop(0, "#8b7de0");
      ribbon.addColorStop(0.22, "#0c9acf");
      ribbon.addColorStop(0.45, "#2dd4bf");
      ribbon.addColorStop(0.65, "#8ee6a5");
      ribbon.addColorStop(0.82, "#2dd4bf");
      ribbon.addColorStop(1, "#8b7de0");
      for (let strand = 0; strand < 13; strand++) {
        ctx.beginPath();
        let connected = false;
        for (let i = 0; i <= 240; i++) {
          const t = i / 240;
          if (t > halfTrace && t < 1 - halfTrace) {
            connected = false;
            continue;
          }
          const [fx, fy] = fourPoint(t);
          const angle = t * Math.PI * 2 - Math.PI / 2;
          const ripple = Math.sin(t * 24 + time * 1.2 + strand * 0.6) * 0.018;
          const offset = (strand - 6) * 0.018;
          const x = ((fx + offset + ripple) * (1 - state.morph) + Math.cos(angle) * 0.7 * state.morph) * scale * state.size;
          const y = ((fy + offset) * (1 - state.morph) + Math.sin(angle) * 0.7 * state.morph) * scale * state.size;
          if (!connected) ctx.moveTo(width / 2 + x, height / 2 + y);
          else ctx.lineTo(width / 2 + x, height / 2 + y);
          connected = true;
        }
        ctx.globalAlpha = state.alpha * (strand === 6 ? 0.85 : 0.12);
        ctx.strokeStyle = strand === 6 ? "#f8f9fa" : ribbon;
        ctx.shadowColor = ["#2dd4bf", "#0c9acf", "#8b7de0", "#8ee6a5"][strand % 4];
        ctx.shadowBlur = strand === 6 ? 16 : 26;
        ctx.lineWidth = (strand === 6 ? 2.5 : 11) * Math.max(0.3, state.size);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      ctx.shadowBlur = 10;
      for (let i = 0; i < 150; i++) {
        const t = (i / 150 + time * 0.085) % 1;
        if (t > halfTrace && t < 1 - halfTrace) continue;
        const [x, y] = point(t);
        const spread = (7 + (i % 9) * 3) * state.size;
        const orbit = time * 1.4 + i * 2.399;
        const shimmer = 0.3 + 0.7 * Math.pow(Math.sin(time * 1.8 + i), 2);
        ctx.globalAlpha = state.alpha * shimmer * (1 - state.morph * 0.6);
        ctx.fillStyle = ["#2dd4bf", "#8ee6a5", "#0c9acf", "#8b7de0", "#f8f9fa"][i % 5];
        ctx.beginPath();
        ctx.arc(x + Math.cos(orbit) * spread, y + Math.sin(orbit) * spread, i % 7 === 0 ? 1.8 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Three moving gleams give the completed numeral motion during its hold.
      for (let i = 0; i < 3; i++) {
        const t = (time * 0.22 + i / 3) % 1;
        if (t > halfTrace && t < 1 - halfTrace) continue;
        const [x, y] = point(t);
        ctx.globalAlpha = state.alpha * 0.8;
        ctx.strokeStyle = "#f8f9fa";
        ctx.lineWidth = 1;
        const arm = 7 * Math.max(0.3, state.size);
        ctx.beginPath();
        ctx.moveTo(x - arm, y); ctx.lineTo(x + arm, y);
        ctx.moveTo(x, y - arm); ctx.lineTo(x, y + arm);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };
    const context = gsap.context(() => {
      if (reduced) {
        gsap.set(".landing-final-background, .landing-logo, .landing-copy > *, .landing-copy", { opacity: 1 });
        callback.current?.();
        return;
      }
      gsap.ticker.add(draw);
      const centerOffset = (axis) => {
        const seal = root.current.querySelector(".landing-seal").getBoundingClientRect();
        const scene = root.current.getBoundingClientRect();
        return axis === "x"
          ? scene.left + width / 2 - (seal.left + seal.width / 2)
          : scene.top + height / 2 - (seal.top + seal.height / 2);
      };
      gsap.utils.toArray(".landing-firework").forEach((burst, burstIndex) => {
        const sparks = burst.querySelectorAll(".landing-firework-spark");
        const pieces = burst.querySelectorAll(".landing-party-piece");
        const radius = Math.min(width * 0.24, 110 + burstIndex % 3 * 30);
        const angle = (i, count) => i / count * Math.PI * 2 + burstIndex * 0.7;
        const distance = (i) => radius * (0.5 + (i * 0.618 % 1) * 0.6);
        const burstTime = fireworks[burstIndex].delay;
        gsap.timeline({ delay: burstTime })
          .fromTo(burst.querySelector(".landing-firework-launch"), { opacity: 0, y: 110, scaleY: 1 }, { opacity: 0.8, y: 0, duration: 0.4, ease: "power2.out" })
          .to(burst.querySelector(".landing-firework-launch"), { opacity: 0, scaleY: 0.1, duration: 0.15 })
          .fromTo(sparks, { opacity: 0, x: 0, y: 0, scale: 0.2 }, {
            opacity: 0.9, scale: 1,
            x: (i) => Math.cos(angle(i, sparks.length)) * distance(i),
            y: (i) => Math.sin(angle(i, sparks.length)) * distance(i),
            duration: 0.55, ease: "power3.out",
          }, 0.4)
          .to(sparks, { opacity: 0, y: "+=35", scale: 0.3, duration: 0.85, stagger: 0.006 }, 0.9)
          .fromTo(pieces, { opacity: 0, x: 0, y: 0, rotation: 0 }, {
            opacity: 0.85,
            x: (i) => Math.cos(angle(i, pieces.length)) * distance(i),
            y: (i) => Math.sin(angle(i, pieces.length)) * distance(i) * 0.8,
            rotation: (i) => i * 57, duration: 0.8, ease: "power2.out",
          }, 0.5)
          .to(pieces, { opacity: 0, y: "+=115", rotation: "+=160", duration: 1.2, stagger: 0.008, ease: "sine.in" }, 1.2);
      });
      gsap.timeline({ onComplete: () => gsap.ticker.remove(draw) })
        .to(state, { trace: 1, duration: 1.25, ease: "power1.out" }, 0)
        .fromTo(".landing-twinkle", { opacity: 0, scale: 0.2, rotation: 0 }, {
          opacity: 0.8, scale: 1, rotation: 90, duration: 0.5,
          stagger: 0.045, repeat: 1, yoyo: true, ease: "sine.inOut",
        }, 1.4)
        .to(".landing-celebration", { opacity: 0, y: -8, duration: 0.45 }, 2.4)
        .to(state, { morph: 1, duration: 1.2, ease: "power3.inOut" }, 2.8)
        .to(state, { size: 0.13, duration: 0.85, ease: "power3.inOut" }, 3.65)
        .to(state, { alpha: 0, duration: 0.6 }, 4.8)
        .to(".landing-final-background", { opacity: 1, duration: 1.2 }, 5.35)
        .fromTo(".landing-logo", {
          opacity: 0, scale: 0.06,
          x: () => centerOffset("x"),
          y: () => centerOffset("y"),
        }, { opacity: 1, scale: 1.08, x: () => centerOffset("x"), y: () => centerOffset("y"), duration: 1, ease: "power3.out" }, 4.5)
        .to(".landing-logo", { x: 0, y: 0, scale: 1, duration: 1.1, ease: "power3.inOut" }, 5.65)
        .fromTo(".landing-copy", { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.8 }, 6.15)
        .fromTo(".landing-copy > *", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.15 }, 6.3)
        .call(() => callback.current?.(), [], 7);
    }, root);
    return () => {
      context.revert();
      gsap.ticker.remove(draw);
      observer.disconnect();
    };
  }, [ready, reduced]);

  return (
    <section ref={root} className="anniversary-landing" aria-label="VJ Data Questers fourth anniversary">
      <div className="landing-final-background" aria-hidden="true"><GlowBackground /><div className="landing-grid" /></div>
      <canvas ref={canvas} className="landing-light-stroke" aria-hidden="true" />
      {!reduced && <>
        <div className="landing-celebration"><p>CELEBRATING FOUR YEARS</p><span>November 6th / VJ Data Questers Formation Day</span></div>
        <div className="landing-party" aria-hidden="true">
          {fireworks.map((firework, index) => <div key={index} className="landing-firework" style={{ left: `${firework.x}%`, top: `${firework.y}%`, color: ["#2dd4bf", "#8ee6a5", "#8b7de0"][index % 3] }}>
            <span className="landing-firework-launch" />
            {Array.from({ length: 28 }, (_, i) => <span key={`spark-${i}`} className="landing-firework-spark" />)}
            {Array.from({ length: 24 }, (_, i) => <span key={i} className={`landing-party-piece landing-party-shape-${i % 3}`} style={{ background: ["#2dd4bf", "#8ee6a5", "#0c9acf", "#8b7de0", "#f8f9fa"][i % 5] }} />)}
          </div>)}
          {Array.from({ length: 24 }, (_, i) => <span key={`star-${i}`} className="landing-twinkle" style={{ left: `${i % 2 === 0 ? 3 + i * 0.9 : 97 - i * 0.9}%`, top: `${18 + (i * 17) % 65}%` }} />)}
        </div>
      </>}
      <div className="landing-composition">
        <div className="landing-seal"><img className="landing-logo" src="/logo.png" alt="VJ Data Questers logo" /></div>
        <div className="landing-copy box">
          <h1>VJ DATA QUESTERS</h1>
          <p>VNRVJIET, Hyderabad</p>
          <p className="landing-motto">Differentiated by inputs / Integrated by outputs</p>
        </div>
      </div>
    </section>
  );
}

AnniversaryLanding.propTypes = { ready: PropTypes.bool, onReady: PropTypes.func };
