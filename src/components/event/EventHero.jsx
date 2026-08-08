import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  SquareArrowUpRight,
  Users,
} from "lucide-react";

const statusStyles = {
  open: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20",
  closed: "bg-slate-800 text-slate-400 border border-slate-700",
  upcoming: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20",
};

const statusLabels = {
  open: "Registration Open",
  closed: "Registration Closed",
  upcoming: "Coming Soon",
};

export default function EventHero({
  event,
  coverImage,
  eventType,
  registrationStatus,
  participantCount,
  onRegister,
}) {
  const [showFloatingBack, setShowFloatingBack] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating back button when scrolled past the hero banner
      setShowFloatingBack(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tags = (event.event_tags || []).filter(
    (tag) => tag.toLowerCase() !== eventType.toLowerCase(),
  );

  const metaItems = [
    event.date && { icon: Calendar, label: "Date", value: event.date },
    event.timings && { icon: Clock, label: "Duration", value: event.timings },
    event.venue && { icon: MapPin, label: "Venue", value: event.venue },
    participantCount && {
      icon: Users,
      label: "Participants",
      value: `${participantCount}+ Expected`,
    },
  ].filter(Boolean);

  return (
    <div className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between overflow-hidden bg-[#0a2530] text-white">
      {/* Background Poster Image with Cinematic Blurs & Gradients */}
      <div className="absolute inset-0 z-0">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-[center_35%] scale-105 blur-[1px] brightness-[0.7]"
              loading="eager"
            />
            {/* Layered cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f323f]/90 via-[#0a2530]/80 to-[#071922]" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#0a2530]/40 to-[#071922]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f323f] via-[#0a2530] to-[#071922]" />
        )}
      </div>

      {/* Floating Animated Mesh Glow Spheres */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, -60, 0],
            y: [0, -100, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -left-20 top-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -90, 70, 0],
            y: [0, 80, -110, 0],
            scale: [1, 0.8, 1.15, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[130px]"
        />
        <motion.div
          animate={{
            y: [0, -40, 40, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/3 bottom-10 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]"
        />
      </div>

      {/* Grid line background overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(15,50,63,0.15),rgba(255,255,255,0))] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {/* Header Back Button & Inline Info */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-20 sm:pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/events"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-cyan-400/40 shadow-lg shadow-cyan-950/20"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5 text-cyan-400"
            />
            <span>Back to Events</span>
          </Link>
        </motion.div>
      </header>

      {/* Centered Main Title Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center my-auto py-12 flex flex-col items-center justify-center">
        {/* Badges Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-6"
        >
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300 backdrop-blur-md">
            {eventType}
          </span>
          {tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${statusStyles[registrationStatus] || statusStyles.closed}`}
          >
            {registrationStatus === "open" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
            )}
            {statusLabels[registrationStatus] || statusLabels.closed}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, type: "spring", stiffness: 50 }}
          className="font-[Poppins] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none drop-shadow-[0_4px_24px_rgba(15,50,63,0.3)] max-w-4xl"
        >
          <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
            {event.name}
          </span>
        </motion.h1>

        {/* Call to Actions (CTAs) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {event.register && registrationStatus === "open" && !event.isGFormEmbeddable && (
            <button
              type="button"
              onClick={() => onRegister(event.register)}
              className="rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 px-8 py-4 font-[Poppins] text-sm font-bold text-[#0a2530] shadow-lg shadow-cyan-400/20 transition-all hover:shadow-cyan-400/35 hover:scale-105 active:scale-95"
            >
              Register Now
            </button>
          )}
          {event.link?.startsWith("http") && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-[Poppins] text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 hover:scale-105 active:scale-95"
            >
              Visit Event Site
              <SquareArrowUpRight size={16} className="text-cyan-400" />
            </a>
          )}
        </motion.div>
      </main>

      {/* Floating Glassmorphic Details Cards Row */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        {metaItems.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {metaItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10 hover:y-[-2px]"
                >
                  <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-cyan-500/5 blur-lg transition-colors group-hover:bg-cyan-500/10" />
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 font-[Inter]">{item.label}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-bold text-white font-[Poppins] leading-snug truncate" title={item.value}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </footer>

      {/* Scroll Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:block text-slate-400/50 text-[10px] uppercase font-bold tracking-widest pointer-events-none">
        Scroll Down
      </div>

      {/* Floating Back to Events button shown on scroll, positioned bottom-left to avoid sticky nav overlap */}
      <AnimatePresence>
        {showFloatingBack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-6 z-50 sm:bottom-8 sm:left-8"
          >
            <Link
              to="/events"
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-[#0f323f]/90 hover:bg-[#0f323f] px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-cyan-400/50 shadow-xl shadow-cyan-950/40"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5 text-cyan-400"
              />
              <span>Back to Events</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EventBackButton() {
  return null;
}
