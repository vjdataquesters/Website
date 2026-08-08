import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../clip-art.css";
import { ArrowLeft, Trophy, Code2, Sparkles } from "lucide-react";
import events from "../data/events.js";
import Reveal from "../components/Reveal.jsx";
import { motion } from "framer-motion";

if (typeof document !== "undefined") {
  const injectStyle = () => {
    if (document.head) {
      if (!document.getElementById("hide-theme-toggle-style")) {
        const style = document.createElement("style");
        style.id = "hide-theme-toggle-style";
        style.innerHTML = `[aria-label="Toggle Dark Mode"] { display: none !important; }`;
        document.head.appendChild(style);
      }
    } else {
      setTimeout(injectStyle, 10);
    }
  };
  injectStyle();
}

if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
  localStorage.setItem("theme", "light");
}
if (typeof document !== "undefined") {
  document.documentElement.classList.remove("dark");
}

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const tags = event.event_tags || [];

  return (
    <div
      className="event-flip-card w-full aspect-[3/4] min-h-[450px]" /* Sets a strict uniform size & aspect ratio for all cards */
      onClick={() => {
        if (event.link.startsWith("http")) {
          window.open(event.link, "_blank");
        } else {
          navigate(event.link);
        }
      }}
    >
      <div className="content h-full w-full">
        {/* Back side of card: shown initially */}
        <div className="back">
          <div className="back-content flex flex-col">
            {/* Fixed Poster Image Container to exactly match your layout proportions */}
            <div className="w-full h-[60%] bg-black overflow-hidden relative border-b border-white/5">
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-contain" /* 'object-contain' keeps the full flyer visible without distorting */
                draggable={false}
              />
            </div>
            {/* Event Details Footer Panel */}
            <div className="h-[40%] p-4 flex flex-col justify-between text-left bg-neutral-900/40">
              <div>
                <h3 className="text-base font-bold text-white leading-snug line-clamp-2">
                  {event.name}
                </h3>
                <p className="text-gray-400 text-xs mt-1.5 font-medium flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-calendar text-emerald-400 shrink-0"
                  >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  {event.date}
                </p>
              </div>
              <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30 uppercase tracking-widest font-bold self-start">
                Hover for details →
              </span>
            </div>
          </div>
        </div>

        {/* Front side of card: shown on hover */}
        <div className="front">
          {/* Abstract glowing background circles */}
          <div className="circle"></div>
          <div className="circle" id="right"></div>
          <div className="circle" id="bottom"></div>

          <div className="front-content p-5 flex flex-col justify-between">
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {tags.slice(0, 3).map((tag, i) => (
                <small key={i} className="badge text-white font-semibold">
                  {tag}
                </small>
              ))}
            </div>
            <div className="description text-left flex-grow flex flex-col justify-between mt-4">
              <div>
                <div className="title flex justify-between items-start gap-2">
                  <p className="font-bold text-white text-base leading-snug line-clamp-2">
                    {event.name}
                  </p>
                  <svg
                    fillRule="nonzero"
                    height="15px"
                    width="15px"
                    viewBox="0 0 256 256"
                    className="shrink-0 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g fill="#20c997" transform="scale(8,8)">
                      <path d="M25,27l-9,-6.75l-9,6.75v-23h18z" />
                    </g>
                  </svg>
                </div>
                <p className="text-gray-300 text-xs mt-2 line-clamp-6 leading-relaxed">
                  {event.description}
                </p>
              </div>
              <p className="card-footer font-medium flex items-center gap-1.5 mt-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-calendar text-emerald-400"
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
                {event.date}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Events() {
  const navigate = useNavigate();
  const recentYear = Object.keys(events.past)[0];
  const [pastevents, setPastevents] = useState(events.past[recentYear]);
  const [year, setyear] = useState(recentYear.slice(1));

  const [searchParams, setSearchParams] = useSearchParams();
  const pastEventsYear = searchParams.get("pastEventsYear");

  useEffect(() => {
    if (pastEventsYear && events.past[`e${pastEventsYear}`]) {
      setPastevents(events.past[`e${pastEventsYear}`]);
      setyear(pastEventsYear);
    }
  }, [pastEventsYear]);

  useEffect(() => {
    // Ensure the theme is bright (light) mode by default when entering the events page
    const toggleBtn = document.querySelector('[aria-label="Toggle Dark Mode"]');
    if (document.documentElement.classList.contains("dark") && toggleBtn) {
      toggleBtn.click();
    }

    // Show the theme toggle button on the events page
    const styleEl = document.getElementById("hide-theme-toggle-style");
    if (styleEl) {
      styleEl.disabled = true;
    }

    return () => {
      // Re-enable hiding the theme toggle button for other pages
      if (styleEl) {
        styleEl.disabled = false;
      }
      // Revert to light/bright mode on leaving the events page if dark mode was toggled on
      const currentToggleBtn = document.querySelector('[aria-label="Toggle Dark Mode"]');
      if (document.documentElement.classList.contains("dark") && currentToggleBtn) {
        currentToggleBtn.click();
      }
    };
  }, []);

  const handleYearChange = (e) => {
    setPastevents(events.past[e]);
    setSearchParams({ pastEventsYear: e.slice(1) });
    setyear(e.slice(1));
  };

  return (
    <>
      {/*Event highlights*/}
      <section className="clip-art-1 relative bg-gradient-to-b from-[#0f323f] via-[#0f323f] to-[#0f323f]/85 min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center justify-center px-4 sm:px-6 md:px-8 pt-24 pb-16 lg:pb-24">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 sm:left-6 md:left-8 top-20 sm:top-24 flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer group z-10"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 md:pt-4">
          <div className="lg:col-span-7 text-left pb-5">
            <h1 className="text-4xl sm:text-5xl pb-4 sm:pb-4 md:text-6xl md:pb-3 font-bold text-white leading-tight">
              Discover Amazing Events we Organized
            </h1>
            <p className="text-sm text-white/95 sm:text-lg md:pb-none pr-3 max-w-2xl leading-relaxed">
              Explore the diverse range of events we've hosted, designed to
              inspire, educate, and bring our community together
            </p>
          </div>
          
          <div className="lg:col-span-5 relative h-[380px] sm:h-[420px] w-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              whileHover={{ scale: 1.03, zIndex: 30 }}
              className="absolute left-[5%] top-[8%] sm:left-[10%] w-[80%] sm:w-[260px] p-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl shadow-cyan-500/5 z-10 transition-all hover:border-cyan-500/40 hover:shadow-cyan-500/20 group cursor-default text-left"
              style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md group-hover:scale-110 transition-transform">
                  <Trophy size={18} />
                </div>
                <h3 className="font-semibold text-white font-[Poppins] text-base">Hackathons</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/75">
                24-hour coding marathons solving real-world challenges with cash prizes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              whileHover={{ scale: 1.03, zIndex: 30 }}
              className="absolute right-[5%] top-[35%] sm:right-[10%] w-[80%] sm:w-[260px] p-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl shadow-emerald-500/5 z-20 transition-all hover:border-emerald-500/40 hover:shadow-emerald-500/20 group cursor-default text-left"
              style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md group-hover:scale-110 transition-transform">
                  <Code2 size={18} />
                </div>
                <h3 className="font-semibold text-white font-[Poppins] text-base">Workshops</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/75">
                Hands-on systems development, Cloud, Machine Learning, and GenAI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              whileHover={{ scale: 1.03, zIndex: 30 }}
              className="absolute left-[15%] bottom-[15%] sm:left-[20%] w-[80%] sm:w-[260px] p-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl shadow-amber-500/5 z-10 transition-all hover:border-amber-500/40 hover:shadow-amber-500/20 group cursor-default text-left"
              style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md group-hover:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-semibold text-white font-[Poppins] text-base">Fun Pursuits</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/75">
                Thrilling treasure hunts, aptitude chases, quizzes, and memes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Display by year */}
      <div className="max-w-7xl h-full mb-20 my-4 mx-auto px-4">
        <div className="w-full">
          <div className="pt-6">
            {/* Upcoming events */}
            {events.upcoming.length !== 0 && (
              <>
                <h2 className="text-4xl text-center font-bold mb-7 dark:text-white">
                  Upcoming Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 items-stretch">
                  {events.upcoming.map((event, index) => (
                    <Reveal key={index}>
                      <EventCard event={event} />
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-4xl text-center font-bold dark:text-white">Our Events</h2>
            <div className="flex flex-row flex-wrap justify-center gap-3">
              {Object.keys(events.past).map((eventyear) => (
                <button
                  key={eventyear}
                  className={`px-5 py-1.5 font-medium text-sm border transition-all duration-300 rounded-full cursor-pointer ${
                    year.toString() === eventyear.slice(1)
                      ? "bg-[#0f323f] text-white border-[#0f323f] dark:bg-white dark:text-[#0f323f] dark:border-white"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                  onClick={() => handleYearChange(eventyear)}
                >
                  {eventyear.slice(1)}
                </button>
              ))}
            </div>
            {Object.keys(pastevents).length === 0 ? (
              <p className="text-gray-400 dark:text-gray-300">No events in year {year}</p>
            ) : (
              <>
                {/* Past events */}
                <h2 className="text-2xl font-bold mt-4 dark:text-white">Events of year {year}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 items-stretch">
                  {pastevents.map((event, index) => (
                    <Reveal key={index}>
                      <EventCard event={event} />
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}