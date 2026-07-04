import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ExternalLink,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2,
  X,
  Calendar,
  Newspaper,
  Bot,
} from "lucide-react";
import { api } from "../utils/api";
import mockReads from "../data/mockRead";

/* ------------------------------------------------------------------ */
/*  Theme                                                              */
/* ------------------------------------------------------------------ */

const INK = "#0f323f";

const CATEGORY_STYLES = {
  "AI Advancement": { bg: "#e8f0ee", fg: "#0f323f", dot: "#12b886" },
  "Prod Issue": { bg: "#fdecec", fg: "#8a2a2a", dot: "#e03131" },
  "Global Tech News": { bg: "#e9eef7", fg: "#264d8a", dot: "#3b6fd4" },
  Podcasts: { bg: "#f3ecf7", fg: "#5f3a86", dot: "#9c56d4" },
  Hiring: { bg: "#fdf0e6", fg: "#9a5a1e", dot: "#e8820e" },
  Other: { bg: "#eeeeee", fg: "#444444", dot: "#888888" },
};

function catStyle(cat) {
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES.Other;
}

// chapter order — categories appear as chapters in this sequence
const CATEGORY_ORDER = [
  "AI Advancement",
  "Prod Issue",
  "Global Tech News",
  "Podcasts",
  "Hiring",
  "Other",
];

const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five",
  "Six", "Seven", "Eight", "Nine", "Ten",
];

function numberWord(n) {
  return NUMBER_WORDS[n] || String(n);
}

// extract a YouTube video id from common url shapes; null if not a YouTube link
function youtubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/live/")) return u.pathname.split("/")[2] || null;
    }
  } catch {
    /* not a url */
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Page faces                                                         */
/* ------------------------------------------------------------------ */

const paperStyle = {
  background:
    "linear-gradient(135deg, #fdfbf5 0%, #f7f1e3 100%)",
  boxShadow: "inset 0 0 60px rgba(120, 95, 50, 0.06)",
};

function PageFrame({ children, side = "right" }) {
  // subtle inner spine shadow so the two halves read as one book
  const spine =
    side === "right"
      ? "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0) 6%)"
      : "linear-gradient(to left, rgba(0,0,0,0.10), rgba(0,0,0,0) 6%)";
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={paperStyle}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: spine }}
      />
      <div className="relative w-full h-full p-6 sm:p-8 md:p-10 flex flex-col">
        {children}
      </div>
    </div>
  );
}

function CoverFace({ edition }) {
  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-center px-8"
      style={{
        background: `radial-gradient(circle at 30% 20%, #14485a 0%, ${INK} 55%, #08222b 100%)`,
        color: "#f4ece0",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center gap-2 text-xs tracking-[0.35em] uppercase opacity-80">
          VJ Data Questers
        </div>
        <div className="my-6 h-px w-16 bg-amber-200/60" />
        <h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
        >
          {edition?.title || "The Data Questers Reader"}
        </h1>
        {edition?.subtitle && (
          <p className="mt-4 max-w-sm text-sm sm:text-base text-amber-100/80 italic font-serif">
            {edition.subtitle}
          </p>
        )}
        <div className="mt-10 flex items-center gap-2 text-xs tracking-widest uppercase opacity-70 animate-pulse">
          <BookOpen size={14} /> open the book
        </div>
      </motion.div>
    </div>
  );
}

function TocFace({ chapters, onJump }) {
  return (
    <PageFrame>
      <h2 className="font-serif text-2xl md:text-3xl" style={{ color: INK }}>
        Contents
      </h2>
      <div className="mt-2 h-px w-full bg-black/10" />
      <div className="mt-4 flex-1 overflow-auto space-y-5 pr-1 reads-scroll">
        {chapters.map((ch) => {
          const s = catStyle(ch.category);
          return (
            <div key={ch.number}>
              <button
                onClick={() => onJump?.(ch.flatIndex)}
                className="w-full text-left group flex items-baseline gap-2"
              >
                <span className="text-[10px] tracking-[0.25em] uppercase opacity-40" style={{ color: INK }}>
                  Ch. {numberWord(ch.number)}
                </span>
                <span
                  className="font-serif text-lg md:text-xl group-hover:underline"
                  style={{ color: INK }}
                >
                  {ch.category}
                </span>
                <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
              </button>
              <ol className="mt-1.5 ml-2 space-y-1">
                {ch.reads.map((r) => (
                  <li key={r.flatIndex}>
                    <button
                      onClick={() => onJump?.(r.flatIndex)}
                      className="w-full text-left flex items-baseline gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: s.dot, opacity: 0.6 }} />
                      <span
                        className="font-serif text-sm leading-snug opacity-80 group-hover:opacity-100 group-hover:underline"
                        style={{ color: INK }}
                      >
                        {r.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
      <p className="pt-3 text-[11px] italic opacity-50 font-serif" style={{ color: INK }}>
        Curated by hand, drafted by an agent, published for the community.
      </p>
    </PageFrame>
  );
}

function ArticleFace({ article, index, total }) {
  const s = catStyle(article.category);
  const isPodcast = article.category === "Podcasts";
  const videoId = isPodcast ? youtubeId(article.url) : null;

  return (
    <PageFrame>
      <div className="flex items-center text-[11px] uppercase tracking-widest opacity-60" style={{ color: INK }}>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full normal-case tracking-normal"
          style={{ background: s.bg, color: s.fg }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
          {article.category}
        </span>
      </div>

      <h2
        className="mt-4 font-serif text-xl sm:text-2xl md:text-[26px] leading-snug"
        style={{ color: INK }}
      >
        {article.title}
      </h2>

      {/* Podcasts are watch-only: embed the video, no notes/takeaways */}
      {isPodcast ? (
        <div className="mt-4 flex-1 flex flex-col justify-center min-h-0">
          {videoId ? (
            <div
              className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black"
              style={{ aspectRatio: "16 / 9" }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={article.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl border border-dashed"
              style={{ borderColor: "rgba(15,50,63,0.2)", color: INK }}
            >
              <ExternalLink size={22} className="opacity-60" />
              <span className="text-sm font-serif">Open the episode</span>
            </a>
          )}
        </div>
      ) : (
        <div className="mt-4 flex-1 overflow-auto pr-1 reads-scroll">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-50" style={{ color: INK }}>
            TL;DR
          </p>
          <p
            className="mt-1 font-serif text-[15px] leading-relaxed"
            style={{ color: "#2a2a2a" }}
          >
            {article.summary}
          </p>

          {article.takeaways?.length > 0 && (
            <>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest opacity-50" style={{ color: INK }}>
                Key takeaways
              </p>
              <ul className="mt-2 space-y-2">
                {article.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-2 text-[14px] leading-relaxed" style={{ color: "#2a2a2a" }}>
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                    <span className="font-serif">{t}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="pt-4 mt-2 border-t border-black/10">
        <div className="flex items-center justify-between gap-4">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-transform hover:scale-105"
            style={{ background: INK, color: "#f4ece0" }}
          >
            {isPodcast ? "Watch on YouTube" : "Read original"} <ExternalLink size={14} />
          </a>
          <span className="text-[10px] opacity-40 font-serif" style={{ color: INK }}>
            {index} / {total}
          </span>
        </div>
      </div>
    </PageFrame>
  );
}

// 12 motivational quotes for the opening page (shown italic)
const QUOTES = [
  { text: "The best way to predict the future is to invent it.", by: "Alan Kay" },
  { text: "First, solve the problem. Then, write the code.", by: "John Johnson" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", by: "Harold Abelson" },
  { text: "Simplicity is the soul of efficiency.", by: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", by: "Kent Beck" },
  { text: "The only way to learn a new programming language is by writing programs in it.", by: "Dennis Ritchie" },
  { text: "Talk is cheap. Show me the code.", by: "Linus Torvalds" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", by: "Martin Fowler" },
  { text: "It always seems impossible until it's done.", by: "Nelson Mandela" },
  { text: "Stay hungry, stay foolish.", by: "Steve Jobs" },
  { text: "The people who are crazy enough to think they can change the world are the ones who do.", by: "Rob Siltanen" },
  { text: "Learning never exhausts the mind.", by: "Leonardo da Vinci" },
];

// 12 "did you know?" facts for the closing page
const FACTS = [
  "The first computer bug was a real moth, found stuck in a Harvard Mark II relay in 1947.",
  "The word \"software\" was coined by statistician John Tukey in 1958.",
  "The first 1GB hard drive, released in 1980, weighed over 500 pounds and cost $40,000.",
  "A huge share of all the world's data was created in just the last few years.",
  "The very first web page is still online — it went live at CERN in 1991.",
  "Python is named after Monty Python's Flying Circus, not the snake.",
  "The '@' symbol was picked for email in 1971 because it was rarely used anywhere else.",
  "Code written in the 1970s is still running aboard NASA's Voyager probes in interstellar space.",
  "The world's first programmer was Ada Lovelace, who wrote an algorithm in the 1840s.",
  "A single Google search taps thousands of machines and answers in under half a second.",
  "The QWERTY layout was designed in the 1870s partly to slow typists down and prevent jams.",
  "There are more possible games of chess than there are atoms in the observable universe.",
];

// deterministic pick so an edition always shows the same quote / fact
function pickIndex(seed, mod) {
  let h = 0;
  const s = String(seed || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

// 3-5 distinct facts for an edition's closing page
function pickFacts(seed) {
  const start = pickIndex(seed + "f", FACTS.length);
  const count = 3 + pickIndex(seed + "c", 3); // 3, 4 or 5
  const out = [];
  for (let i = 0; i < count; i++) out.push(FACTS[(start + i) % FACTS.length]);
  return out;
}

function QuoteFace({ quote }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-center px-10" style={paperStyle}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0) 6%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7 }}
        className="flex flex-col items-center max-w-md"
      >
        <span className="font-serif text-6xl leading-none opacity-20" style={{ color: INK }}>&ldquo;</span>
        <p className="font-serif italic text-xl sm:text-2xl md:text-[26px] leading-relaxed" style={{ color: INK }}>
          {quote.text}
        </p>
        <div className="my-6 h-px w-12 bg-black/20" />
        <p className="text-xs tracking-[0.25em] uppercase opacity-50" style={{ color: INK }}>
          {quote.by}
        </p>
      </motion.div>
    </div>
  );
}

function DidYouKnowFace({ facts }) {
  const list = Array.isArray(facts) ? facts : [facts];
  return (
    <div
      className="w-full h-full flex flex-col justify-center px-8 sm:px-10 py-8"
      style={{
        background: `radial-gradient(circle at 30% 20%, #14485a 0%, ${INK} 55%, #08222b 100%)`,
        color: "#f4ece0",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7 }}
        className="flex flex-col w-full max-w-md mx-auto min-h-0"
      >
        <div className="flex items-center gap-2 text-[11px] tracking-[0.35em] uppercase opacity-70 justify-center">
           Do you know?
        </div>
        <div className="my-5 h-px w-14 bg-amber-200/50 mx-auto" />
        <ul className="space-y-4 overflow-auto pr-1 reads-scroll">
          {list.map((f, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-serif text-lg text-amber-200/70 leading-none mt-0.5">{i + 1}.</span>
              <span className="font-serif text-[15px] sm:text-base leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs tracking-[0.3em] uppercase opacity-60 text-center">VJ Data Questers</p>
      </motion.div>
    </div>
  );
}

function EndFace({ edition, count, onFeedback }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center px-8"
      style={{
        background: `radial-gradient(circle at 70% 80%, #14485a 0%, ${INK} 55%, #08222b 100%)`,
        color: "#f4ece0",
      }}
    >
      <p className="font-serif text-3xl md:text-4xl leading-tight">Thank you<br />for reading</p>
      <div className="my-5 h-px w-16 bg-amber-200/50" />
      <p className="text-sm opacity-80 max-w-xs font-serif italic">
        {count} stories worth your attention this month.
      </p>
      {onFeedback && (
        <button
          onClick={onFeedback}
          className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105"
          style={{ background: "#f4d06a", color: "#0a2b36" }}
        >
          Share your feedback
        </button>
      )}
      <p className="mt-8 text-xs tracking-[0.3em] uppercase opacity-70">VJ Data Questers</p>
    </div>
  );
}

function ChapterFace({ number, category, count }) {
  const s = catStyle(category);
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-center px-8" style={paperStyle}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0) 6%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <p className="text-xs tracking-[0.4em] uppercase opacity-50" style={{ color: INK }}>
          Chapter {numberWord(number)}
        </p>
        <div className="my-6 h-px w-14" style={{ background: s.dot }} />
        <span
          className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
          style={{ background: s.bg, color: s.fg }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
          {count} {count === 1 ? "read" : "reads"}
        </span>
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight max-w-xs"
          style={{ color: INK }}
        >
          {category}
        </h2>
      </motion.div>
    </div>
  );
}

/* renders a single page index into a face */
function Face({ pages, index, onJump, onFeedback }) {
  const page = pages[index];
  if (!page) return <div className="w-full h-full" style={paperStyle} />;
  switch (page.type) {
    case "cover":
      return <CoverFace edition={page.edition} />;
    case "quote":
      return <QuoteFace quote={page.quote} />;
    case "fact":
      return <DidYouKnowFace facts={page.facts} />;
    case "toc":
      return <TocFace chapters={page.chapters} onJump={onJump} />;
    case "chapter":
      return <ChapterFace number={page.number} category={page.category} count={page.count} />;
    case "article":
      return <ArticleFace article={page.article} index={page.index} total={page.total} />;
    case "end":
      return <EndFace edition={page.edition} count={page.count} onFeedback={onFeedback} />;
    default:
      return <div className="w-full h-full" style={paperStyle} />;
  }
}

/* ------------------------------------------------------------------ */
/*  The book                                                           */
/* ------------------------------------------------------------------ */

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return desktop;
}

/** Desktop: real turning leaves (front/back), spine in the middle. */
function DesktopBook({ pages, leaf, setLeaf, onJump, onFeedback, isFullscreen, onToggleFullscreen }) {
  const totalLeaves = Math.ceil(pages.length / 2);

  const next = () => setLeaf((l) => Math.min(l + 1, totalLeaves));
  const prev = () => setLeaf((l) => Math.max(l - 1, 0));

  // click anywhere on the book to turn (left half = back, right half = forward),
  // but never hijack clicks on links or buttons inside a page
  const handleClick = (e) => {
    if (e.target.closest("a, button, iframe, [data-noflip]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 2) prev();
    else next();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative select-none cursor-pointer"
        onClick={handleClick}
        style={{
          perspective: "2200px",
          width: isFullscreen ? "min(96vw, 142vh)" : "min(92vw, 860px)",
          aspectRatio: "3 / 2",
        }}
      >
        {/* static book shadow */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />
        {/* left backing (visible once opened) */}
        <div
          className="absolute top-0 left-0 h-full rounded-l-md"
          style={{ width: "50%", background: "#e7dec9", boxShadow: "inset 0 0 40px rgba(0,0,0,0.12)" }}
        />
        {/* right backing */}
        <div
          className="absolute top-0 right-0 h-full rounded-r-md"
          style={{ width: "50%", background: "#e7dec9", boxShadow: "inset 0 0 40px rgba(0,0,0,0.12)" }}
        />

        {Array.from({ length: totalLeaves }).map((_, i) => {
          const flipped = i < leaf;
          const frontIndex = i * 2;
          const backIndex = i * 2 + 1;
          // stacking: unflipped leaves stack right-to-left; flipped stack left-to-right
          const z = flipped ? i : totalLeaves - i;
          return (
            <motion.div
              key={i}
              className="absolute top-0 right-0 h-full"
              style={{
                width: "50%",
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                zIndex: z,
              }}
              initial={false}
              animate={{ rotateY: flipped ? -180 : 0 }}
              transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
            >
              {/* front */}
              <div
                className="absolute inset-0 rounded-r-md overflow-hidden shadow-md"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <Face pages={pages} index={frontIndex} onJump={onJump} onFeedback={onFeedback} />
                {/* page curl sheen */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(0,0,0,0.06), transparent 15%)",
                  }}
                />
              </div>
              {/* back */}
              <div
                className="absolute inset-0 rounded-l-md overflow-hidden shadow-md"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <Face pages={pages} index={backIndex} onJump={onJump} onFeedback={onFeedback} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isFullscreen && (
        <BookControls
          canPrev={leaf > 0}
          canNext={leaf < totalLeaves}
          onPrev={prev}
          onNext={next}
          progress={totalLeaves ? leaf / totalLeaves : 0}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      )}
    </div>
  );
}

/** Mobile: single page, flip transition. */
function MobileBook({ pages, page, setPage, onJump, onFeedback, isFullscreen, onToggleFullscreen }) {
  const total = pages.length;
  const [dir, setDir] = useState(1);
  const next = () => {
    setDir(1);
    setPage((p) => Math.min(p + 1, total - 1));
  };
  const prev = () => {
    setDir(-1);
    setPage((p) => Math.max(p - 1, 0));
  };
  const handleClick = (e) => {
    if (e.target.closest("a, button, iframe, [data-noflip]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 2) prev();
    else next();
  };
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative select-none cursor-pointer"
        onClick={handleClick}
        style={{
          perspective: "1600px",
          width: isFullscreen ? "min(94vw, 63vh)" : "min(92vw, 420px)",
          aspectRatio: "2 / 3",
        }}
      >
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-full blur-2xl"
          style={{ background: "rgba(0,0,0,0.3)" }}
        />
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={page}
            custom={dir}
            className="absolute inset-0 rounded-md overflow-hidden shadow-xl"
            style={{ transformOrigin: dir > 0 ? "left center" : "right center", transformStyle: "preserve-3d" }}
            initial={{ rotateY: dir > 0 ? 90 : -90, opacity: 0.4 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: dir > 0 ? -90 : 90, opacity: 0.4 }}
            transition={{ duration: 0.55, ease: [0.645, 0.045, 0.355, 1] }}
          >
            <Face pages={pages} index={page} onJump={onJump} onFeedback={onFeedback} />
          </motion.div>
        </AnimatePresence>
      </div>
      {!isFullscreen && (
        <BookControls
          canPrev={page > 0}
          canNext={page < total - 1}
          onPrev={prev}
          onNext={next}
          progress={total > 1 ? page / (total - 1) : 0}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      )}
    </div>
  );
}

function BookControls({ canPrev, canNext, onPrev, onNext, progress, isFullscreen, onToggleFullscreen }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-md">
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-transform hover:scale-105"
          style={{ background: INK, color: "#f4ece0", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}
          aria-label={isFullscreen ? "Exit full screen" : "Read in full screen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      )}
      <div className="flex items-center gap-6">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="p-3 rounded-full transition disabled:opacity-30 hover:scale-110"
          style={{ background: "#fff", color: INK, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="p-3 rounded-full transition disabled:opacity-30 hover:scale-110"
          style={{ background: INK, color: "#f4ece0", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="w-full h-1 rounded-full bg-black/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: INK }}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Book reader (opened from an edition card)                          */
/* ------------------------------------------------------------------ */

const THIN_SCROLL_CSS = `
  .reads-scroll { scrollbar-width: thin; scrollbar-color: rgba(15,50,63,0.35) transparent; }
  .reads-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .reads-scroll::-webkit-scrollbar-track { background: transparent; }
  .reads-scroll::-webkit-scrollbar-thumb { background: rgba(15,50,63,0.30); border-radius: 999px; }
  .reads-scroll::-webkit-scrollbar-thumb:hover { background: rgba(15,50,63,0.55); }
`;

function buildPages(edition, articles, isDesktop) {
  if (!edition) return [];
  const groups = new Map();
  (articles || []).forEach((a) => {
    const key = a.category || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  });
  // known categories first (in order), then any custom ones in insertion order
  const known = CATEGORY_ORDER.filter((c) => groups.has(c));
  const custom = [...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c));
  const orderedCats = [...known, ...custom];

  let chapterNum = 0;
  const chapters = orderedCats.map((category) => {
    chapterNum += 1;
    return { number: chapterNum, category, reads: groups.get(category) };
  });

  const quote = QUOTES[pickIndex(edition.id, QUOTES.length)];
  const facts = pickFacts(edition.id);

  const list = [{ type: "cover", edition }];
  list.push({ type: "quote", quote }); // opening page — motivational quote
  const tocIndex = list.length;
  list.push({ type: "toc", chapters: [] });

  const toc = [];
  chapters.forEach((ch) => {
    const chapterFlatIndex = list.length;
    list.push({ type: "chapter", number: ch.number, category: ch.category, count: ch.reads.length });
    const reads = ch.reads.map((article, i) => {
      const flatIndex = list.length;
      list.push({ type: "article", article, index: i + 1, total: ch.reads.length });
      return { title: article.title, flatIndex };
    });
    toc.push({ number: ch.number, category: ch.category, flatIndex: chapterFlatIndex, reads });
  });

  list.push({ type: "end", edition, count: (articles || []).length });
  list.push({ type: "fact", facts }); // closing page — did you know?
  if (isDesktop && list.length % 2 !== 0) list.push({ type: "blank" });
  list[tocIndex] = { type: "toc", chapters: toc };
  return list;
}

function BookReader({ edition, articles, onClose, onFeedback }) {
  const isDesktop = useIsDesktop();
  const [leaf, setLeaf] = useState(0);
  const [page, setPage] = useState(0);
  const rootRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }, []);

  const pages = useMemo(
    () => buildPages(edition, articles, isDesktop),
    [edition, articles, isDesktop],
  );

  const jumpToPage = useCallback(
    (flatIndex) => {
      if (isDesktop) setLeaf(Math.ceil(flatIndex / 2));
      else setPage(flatIndex);
    },
    [isDesktop],
  );

  const totalLeaves = Math.ceil(pages.length / 2);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        if (isDesktop) setLeaf((l) => Math.min(l + 1, totalLeaves));
        else setPage((p) => Math.min(p + 1, pages.length - 1));
      } else if (e.key === "ArrowLeft") {
        if (isDesktop) setLeaf((l) => Math.max(l - 1, 0));
        else setPage((p) => Math.max(p - 1, 0));
      } else if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDesktop, totalLeaves, pages.length, onClose]);

  return (
    <motion.div
      ref={rootRef}
      className="fixed inset-0 z-[120] overflow-y-auto"
      style={{ background: "radial-gradient(circle at 50% 0%, #eaf1f0 0%, #dfe8ea 40%, #cdd9dc 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <style>{THIN_SCROLL_CSS}</style>

      {!isFullscreen && (
        <button
          onClick={onClose}
          className="fixed right-4 top-4 z-10 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-transform hover:scale-105"
          style={{ background: "#fff", color: INK, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
          aria-label="Close book"
        >
          <X size={15} /> Close
        </button>
      )}

      {/* inner wrapper grows to fill height and keeps the book vertically centred,
          while still allowing scroll (with top/bottom breathing room) if it's taller */}
      <div
        className={`min-h-full flex flex-col items-center justify-center px-4 ${
          isFullscreen ? "py-0" : "py-16"
        }`}
      >
        {isDesktop ? (
          <DesktopBook
            pages={pages}
            leaf={leaf}
            setLeaf={setLeaf}
            onJump={jumpToPage}
            onFeedback={onFeedback}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        ) : (
          <MobileBook
            pages={pages}
            page={page}
            setPage={setPage}
            onJump={jumpToPage}
            onFeedback={onFeedback}
            isFullscreen={isFullscreen}
          />
        )}

        {!isFullscreen && (
          <p className="mt-6 text-xs opacity-40 text-center" style={{ color: INK }}>
            Click a page side or use ← → to turn · Esc to close
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing page                                                       */
/* ------------------------------------------------------------------ */

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthYear(id) {
  const [y, m] = String(id || "").split("-");
  const name = MONTHS_FULL[Number(m) - 1];
  return name ? { month: name, year: y } : { month: id, year: "" };
}

function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function EditionCard({ item, index, onOpen, featured }) {
  const { month, year } = monthYear(item.edition.id);
  const count = item.articles ? item.articles.length : null;
  return (
    <motion.button
      onClick={() => onOpen(item)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -8, rotate: -0.6 }}
      className="group relative text-left rounded-xl overflow-hidden shrink-0"
      style={{
        width: "100%",
        aspectRatio: "3 / 4",
        background: `radial-gradient(circle at 30% 15%, #14485a 0%, ${INK} 55%, #08222b 100%)`,
        boxShadow: featured
          ? "0 16px 40px rgba(8,34,43,0.4), 0 0 0 2px rgba(245,197,66,0.7)"
          : "0 12px 30px rgba(8,34,43,0.28)",
      }}
    >
      {/* spine */}
      <span className="absolute left-0 top-0 h-full w-2.5" style={{ background: "rgba(0,0,0,0.28)" }} />
      <span className="absolute left-2.5 top-0 h-full w-px bg-amber-200/25" />
      {/* texture */}
      <span
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)" }}
      />
      {featured && (
        <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-amber-300 text-[#0a2b36]">
          Latest
        </span>
      )}
      <div className="relative h-full w-full flex flex-col p-6 pl-8" style={{ color: "#f4ece0" }}>
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase opacity-70">
          <Calendar size={12} /> Edition
        </div>
        <div className="mt-auto">
          <p className="font-serif text-3xl leading-none">{month}</p>
          <p className="font-serif text-lg opacity-70">{year}</p>
          {item.edition.subtitle && (
            <p className="mt-3 text-xs leading-snug text-amber-100/70 line-clamp-2 font-serif italic">
              {item.edition.subtitle}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            {count !== null ? (
              <span className="text-[11px] opacity-70">{count} reads</span>
            ) : <span />}
            <span className="inline-flex items-center gap-1 text-xs font-medium opacity-90 group-hover:gap-2 transition-all">
              Open <BookOpen size={14} />
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// A large 3D book featuring the latest edition (desktop hero).
function FeaturedBook({ item, onRead }) {
  const { month, year } = monthYear(item.edition.id);
  return (
    <div style={{ perspective: "1800px" }} className="flex justify-center">
      <motion.button
        onClick={onRead}
        initial={{ opacity: 0, rotateY: -38, x: -30 }}
        animate={{ opacity: 1, rotateY: -26, x: 0 }}
        whileHover={{ rotateY: -10, scale: 1.03 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative group cursor-pointer"
        style={{ transformStyle: "preserve-3d", width: 320, height: 440 }}
        aria-label={`Open ${month} ${year} edition`}
      >
        {/* page-block thickness on the right edge */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-sm"
          style={{
            right: 0,
            width: 42,
            transform: "rotateY(90deg)",
            transformOrigin: "right center",
            background: "repeating-linear-gradient(to bottom, #f6efdc 0 2px, #e7dbbe 2px 4px)",
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.2)",
          }}
        />
        {/* front cover */}
        <div
          className="absolute inset-0 rounded-r-xl rounded-l-sm overflow-hidden flex flex-col p-8"
          style={{
            background: `radial-gradient(circle at 30% 18%, #14485a 0%, ${INK} 55%, #08222b 100%)`,
            color: "#f4ece0",
            boxShadow: "0 30px 60px rgba(8,34,43,0.45)",
            transform: "translateZ(1px)",
          }}
        >
          {/* spine sheen */}
          <span className="absolute left-0 top-0 h-full w-3" style={{ background: "rgba(0,0,0,0.35)" }} />
          <span className="absolute left-3 top-0 h-full w-px bg-amber-200/30" />
          <span
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)" }}
          />
          <div className="relative flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase opacity-75 pl-2">
             Latest edition
          </div>
          <div className="relative mt-auto pl-2">
            <p className="font-serif text-5xl leading-none">{month}</p>
            <p className="font-serif text-2xl opacity-70 mt-1">{year}</p>
            <div className="my-4 h-px w-14 bg-amber-200/50" />
            {item.edition.subtitle && (
              <p className="text-sm leading-snug text-amber-100/75 font-serif italic line-clamp-3">
                {item.edition.subtitle}
              </p>
            )}
          </div>
        </div>
      </motion.button>
    </div>
  );
}

function WhatIsReads() {
  const points = [
    { icon: Newspaper, title: "Curated, not scraped", text: "Each read is a hand-picked article, paper, or podcast that actually mattered — no noise, no filler." },
    { icon: Bot, title: "Drafted by an agent", text: "An AI assistant reads each source and drafts a crisp TL;DR, key takeaways, and a category — reviewed by a human before it ships." },
    { icon: BookOpen, title: "Read like a book", text: "Every month becomes an edition you flip through, chapter by chapter — a calm, permanent home for what's worth remembering." },
  ];
  return (
    <div className="w-full max-w-5xl mx-auto grid gap-4 md:grid-cols-3">
      {points.map((p, i) => (
        <motion.div
          key={p.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60"
          style={{ boxShadow: "0 8px 24px rgba(15,50,63,0.06)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "#e8f0ee", color: INK }}>
            <p.icon size={20} />
          </div>
          <h3 className="font-serif text-lg" style={{ color: INK }}>{p.title}</h3>
          <p className="mt-2 text-sm leading-relaxed opacity-70" style={{ color: INK }}>{p.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

function FeedbackForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      await api.post("/reads/feedback", { name: name.trim(), message: message.trim() });
      setStatus("sent");
      setName("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full h-full rounded-3xl border border-white/60 p-8 md:p-11 flex flex-col"
      style={{
        background: `linear-gradient(160deg, #14485a 0%, ${INK} 60%, #0a2b36 100%)`,
        color: "#f4ece0",
        boxShadow: "0 16px 44px rgba(15,50,63,0.18)",
      }}
    >
      <p className="text-[11px] tracking-[0.35em] uppercase opacity-60">We're listening</p>
      <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-tight">Share your feedback</h2>
      <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-amber-100/80 font-serif italic">
        How's the reading experience? Too long, too short, missing a topic you care about? Your
        feedback shapes what we curate and how we present it — help us make The Reader better.
      </p>

      {status === "sent" ? (
        <div className="mt-6 flex-1 flex flex-col items-center justify-center text-center">
          
          <p className="font-serif text-lg">Thank you!</p>
          <p className="text-sm text-amber-100/70 mt-1">Your suggestion reached the editors.</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 text-xs underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 flex-1 flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 placeholder-amber-100/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200/40"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What did you think? What could we do better?"
            rows={4}
            required
            className="w-full flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 placeholder-amber-100/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200/40"
          />
          {status === "error" && (
            <p className="text-xs text-red-300">Couldn't send — please try again.</p>
          )}
          <button
            type="submit"
            disabled={status === "sending" || !message.trim()}
            className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-200 text-[#0a2b36] text-sm font-semibold transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Send feedback
          </button>
        </form>
      )}
    </motion.div>
  );
}

function WhyWeBuilt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full h-full rounded-3xl bg-white/75 backdrop-blur border border-white/60 p-8 md:p-11"
      style={{ boxShadow: "0 16px 44px rgba(15,50,63,0.10)" }}
    >
      <p className="text-[11px] tracking-[0.35em] uppercase opacity-50" style={{ color: INK }}>
        From the makers
      </p>
      <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-tight" style={{ color: INK }}>
        Why we built The Reader
      </h2>

      <div className="mt-6 space-y-5 font-serif text-[15px] md:text-base leading-relaxed" style={{ color: "#2a2a2a" }}>
        <p>
          <span className="font-semibold" style={{ color: INK }}>The problem.</span>{" "}
          For years, the best things our community read — a sharp paper, a hard-won production
          postmortem, a podcast worth an evening — were shared in a WhatsApp group and then gone.
          Long-form, high-value content got buried under the next hundred messages within hours.
          The real effort — reading something carefully and distilling why it mattered — evaporated
          the moment the chat scrolled.
        </p>
        <p>
          <span className="font-semibold" style={{ color: INK }}>How we solved it.</span>{" "}
          The Reader turns that fleeting stream into a permanent, searchable archive. Drop a link,
          and an AI agent scrapes it, drafts a TL;DR, pulls out the key takeaways, and files it under
          the right category. A human reviews and approves, and once a month those reads are bound
          into an edition you can flip through like a book — organised into chapters, kept forever,
          and open to everyone.
        </p>
      </div>

      
    </motion.div>
  );
}

export default function Reads() {
  const [items, setItems] = useState(null); // [{ edition, articles? }]
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // { edition, articles }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/reads/editions");
        if (!alive) return;
        const editions = res.data?.data || [];
        if (editions.length === 0) {
          setItems(mockReads);
        } else {
          setItems(editions.map((edition) => ({ edition })));
        }
      } catch {
        if (!alive) return;
        setItems(mockReads); // backend unreachable / no editions — preview with mock
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openEdition = useCallback(async (item) => {
    if (item.articles) {
      setActive(item);
      return;
    }
    try {
      const res = await api.get(`/reads/editions/${item.edition.id}`);
      setActive(res.data.data);
    } catch {
      setActive({ edition: item.edition, articles: [] });
    }
  }, []);

  const latest = items && items.length > 0 ? items[0] : null;

  const goToFeedback = useCallback(() => {
    setActive(null);
    setTimeout(() => {
      document.getElementById("reader-feedback")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: "radial-gradient(circle at 50% 0%, #eaf1f0 0%, #dfe8ea 45%, #cdd9dc 100%)" }}
    >
      <style>{THIN_SCROLL_CSS}</style>

      {/* hero */}
      <section className="px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* desktop: 3D featured book + intro */}
          <div className="hidden lg:grid grid-cols-[minmax(0,440px),1fr] gap-16 items-center">
            <div className="flex flex-col items-center">
              {latest ? (
                <FeaturedBook item={latest} onRead={() => openEdition(latest)} />
              ) : (
                <div className="rounded-xl bg-white/40 animate-pulse" style={{ width: 320, height: 440 }} />
              )}
              {latest && (
                <motion.button
                  onClick={() => openEdition(latest)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-9 inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold shadow-lg transition-transform hover:scale-105"
                  style={{ background: INK, color: "#f4ece0" }}
                >
                  <BookOpen size={17} /> Read now
                </motion.button>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 text-xs tracking-[0.35em] uppercase opacity-60 mb-5" style={{ color: INK }}>
                 VJ Data Questers
              </div>
              <h1 className="font-serif text-6xl leading-none" style={{ color: INK }}>The Reader</h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed opacity-70" style={{ color: INK }}>
                A monthly, book-style edition of the articles, papers and podcasts worth your
                attention — curated by the community, distilled by an agent, and kept forever.
              </p>
              {latest && (
                <p className="mt-6 text-sm opacity-60 font-serif italic" style={{ color: INK }}>
                  Now reading: <span className="font-semibold not-italic">{monthYear(latest.edition.id).month} {monthYear(latest.edition.id).year}</span>
                  {latest.articles ? ` · ${latest.articles.length} reads` : ""}
                </p>
              )}
            </motion.div>
          </div>

          {/* mobile: simple centered hero */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.35em] uppercase opacity-60 mb-4" style={{ color: INK }}>
              VJ Data Questers
            </div>
            <h1 className="font-serif text-5xl leading-none" style={{ color: INK }}>The Reader</h1>
            <p className="mt-5 max-w-xl mx-auto text-base leading-relaxed opacity-70" style={{ color: INK }}>
              A monthly, book-style edition of the articles, papers and podcasts worth your
              attention — curated, distilled, and kept forever.
            </p>
            {latest && (
              <button
                onClick={() => openEdition(latest)}
                className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-lg"
                style={{ background: INK, color: "#f4ece0" }}
              >
                <BookOpen size={16} /> Read the latest edition
              </button>
            )}
          </div>
        </div>
      </section>

      {/* what is reads */}
      <section className="px-4 pb-16">
        <WhatIsReads />
      </section>

      {/* editions shelf */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl" style={{ color: INK }}>
                Monthly Editions
              </h2>
              <p className="text-sm opacity-60" style={{ color: INK }}>
                Pick a month to open the book.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 opacity-60 py-20 justify-center" style={{ color: INK }}>
              <Loader2 className="animate-spin" size={20} /> Loading editions…
            </div>
          ) : items && items.length > 0 ? (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item, i) => (
                <EditionCard key={item.edition.id} item={item} index={i} onOpen={openEdition} featured={i === 0} />
              ))}
            </div>
          ) : (
            <div className="text-center bg-white/70 rounded-2xl px-8 py-12" style={{ color: INK }}>
              <BookOpen className="mx-auto mb-3 opacity-40" size={30} />
              <p className="font-serif text-lg">No editions published yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* why we built it + feedback — two-column band filling the width */}
      <section id="reader-feedback" className="px-4 pb-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.5fr,1fr] gap-6 items-stretch">
          <WhyWeBuilt />
          <FeedbackForm />
        </div>
      </section>

      <AnimatePresence>
        {active && (
          <BookReader
            edition={active.edition}
            articles={active.articles}
            onClose={() => setActive(null)}
            onFeedback={goToFeedback}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
