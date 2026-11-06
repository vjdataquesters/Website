import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import "./AnniversaryDiary.css";

const chapters = [
  { year: "2022", title: "A little spark.", note: "Every great story starts with a first page. Ours was a shared curiosity.", photos: [] },
  { year: "2023", title: "We found our people.", note: "New faces. First ideas. The beginning of something worth remembering.", photos: [["/events/VjdqOrientation2023/img2.png", "VJDQ Orientation"], ["/events/BlogAThon2023/img3.png", "BlogAThon"]] },
  { year: "2024", title: "Curiosity became community.", note: "Learning together. Building together. Making memories in between.", photos: [["/home-6.jpg", "The VJDQ family"], ["/events/Technovista2024/img3.png", "Technovista"]] },
  { year: "2025", title: "Oh, the things we made.", note: "Bigger ideas, a little more courage, and so many stories to tell.", photos: [["/events/CloudCraft2025/img3.jpg", "CloudCraft"], ["/events/HitReloaded2025Nov/img2.png", "HIT Reloaded"]] },
  { year: "2026", title: "And here we are.", note: "Four years of turning ‘what if’ into ‘we did’. This page belongs to all of us.", photos: [["/events/DataHack-2k26/datahack-2.jpeg", "Data Hack"], ["/events/HIT-5.0-2K26/hit-3.jpeg", "HIT 5.0"]] },
];

export default function AnniversaryDiary() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const trigger = useRef(null);
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const final = page === chapters.length;
  const chapter = chapters[Math.min(page, chapters.length - 1)];
  const close = () => { setOpen(false); setPlaying(false); trigger.current?.focus(); };
  const replay = () => { setPage(reduced ? chapters.length : 0); setPlaying(!reduced); };

  useEffect(() => {
    if (!open) return;
    // Warm the next spreads while the opening page is visible.
    chapters.flatMap(chapter => chapter.photos).forEach(([src]) => {
      const photo = new Image();
      photo.src = src;
    });
  }, [open]);

  useEffect(() => {
    if (!open || !playing) return;
    const timer = setTimeout(() => {
      if (page >= chapters.length - 1) { setPage(chapters.length); setPlaying(false); }
      else setPage(page + 1);
    }, page === 0 ? 1000 : 850);
    return () => clearTimeout(timer);
  }, [open, playing, page]);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") { setOpen(false); setPlaying(false); trigger.current?.focus(); }
      if (event.key === "Tab") {
        const buttons = [...dialog.current.querySelectorAll("button:not(:disabled)")];
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); };
  }, [open]);

  return createPortal(<>
    <button ref={trigger} className="ad-companion" onClick={() => { setOpen(true); replay(); }} aria-label="Open our fourth anniversary memory diary" aria-haspopup="dialog" aria-expanded={open}>
      <span className="ad-invitation">a little book of us <span>✦</span></span>
      <span className="ad-mini-book" aria-hidden="true">
        <span className="ad-mini-left"><img src={chapters[4].photos[0][0]} alt="" /><span>our memories</span></span>
        <span className="ad-mini-right"><small>6 NOVEMBER</small><strong>Happy 4th<br />Anniversary</strong><span>♡</span></span>
      </span>
      <span className="ad-open-hint">tap to turn back time</span>
    </button>
    {open && <div className="ad-overlay" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="ad-title" className="ad-dialog">
        <header className="ad-toolbar"><span>VJDQ <i> / </i> THE MEMORY DIARY</span><button ref={closeButton} onClick={close} aria-label="Close diary">✕</button></header>
        <div className={`ad-book ${final ? "ad-book-final" : ""}`}>
          <div key={page} className="ad-spread">
            <div className="ad-page ad-left-page">
              <div className="ad-eyebrow">{final ? "COLLECTED MOMENTS" : `CHAPTER 0${page + 1}`}</div>
              <div className="ad-year">{final ? "four years" : chapter.year}<span>of us.</span></div>
              {chapter.photos.length ? <div className="ad-photos">{chapter.photos.map(([src, caption], index) => <figure key={src} className={`ad-photo ad-photo-${index}`}><img src={src} alt={`${caption} event memory`} /><figcaption>{caption} <span>♡</span></figcaption></figure>)}</div> : <div className="ad-origin"><span>✧</span><p>One idea.<br />Endless possibilities.</p><small>THE FIRST PAGE OF OUR STORY</small></div>}
              <span className="ad-page-number">VJDQ · {final ? "2022 — 2026" : chapter.year}</span>
            </div>
            <div className="ad-page ad-right-page">
              <time className="ad-date" dateTime={final ? "2026-11-06" : undefined}>{final ? "FRIDAY, 6 NOVEMBER 2026" : "FROM THE MEMORY ARCHIVE"}</time>
              {final ? <><div className="ad-anniversary-seal">4<span>YEARS</span></div><h2 id="ad-title" className="ad-celebration">Happy 4th<br /><em>Anniversary.</em></h2><p className="ad-handwritten">To every one of us who made it a story.</p><div className="ad-rule" /><p className="ad-note">The ideas. The late nights. The friendships.<br />Here’s to everything we’ve been —<br />and everything we’re yet to become.</p><span className="ad-signature">With love, VJDQ ♡</span></> : <><span className="ad-chapter-star">✧</span><h2 id="ad-title">{chapter.title}</h2><p className="ad-note">{chapter.note}</p><span className="ad-signature">A page we’ll keep forever.</span></>}
              <span className="ad-page-number">{final ? "THE STORY CONTINUES…" : `0${page + 1} / 05`}</span>
            </div>
          </div>
          {playing && !reduced && <div key={`flip-${page}`} className="ad-turning-leaf" aria-hidden="true"><span>{chapter.year}</span><span>little moments, lasting memories</span></div>}
          <span className="ad-bookmark" aria-hidden="true" />
        </div>
        <footer className="ad-controls"><button onClick={replay}>↺ Replay the memories</button><div className="ad-chapters" aria-label="Diary chapters">{[...chapters.map(c => c.year), "♡"].map((label, index) => <button key={label} aria-label={index === chapters.length ? "Anniversary page" : `View ${label} memories`} aria-current={page === index ? "step" : undefined} onClick={() => { setPlaying(false); setPage(index); }}>{label}</button>)}</div><button onClick={() => { setPage(chapters.length); setPlaying(false); }}>{final ? "♡ 6 November" : "Skip to today →"}</button></footer>
        <span className="ad-status" role="status">{playing ? "Turning through our memories…" : final ? "Happy fourth anniversary, VJDQ." : `${chapter.year} memories`}</span>
      </section>
    </div>}
  </>, document.body);
}
