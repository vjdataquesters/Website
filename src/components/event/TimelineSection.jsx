import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";

function TimelineDay({ day, index, isExpanded, onToggle }) {
  const items = day.items || day.sessions || [];
  const dayLabel = day.day || day.title || `Day ${index + 1}`;
  const dateLabel = day.date;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline line */}
      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/30 via-emerald-500/10 to-transparent sm:left-[23px]" />

      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-start gap-4 text-left"
        aria-expanded={isExpanded}
      >
        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0a2530] shadow-xl transition-all group-hover:border-cyan-400/50 sm:h-12 sm:w-12">
          <motion.div
            animate={{ scale: isExpanded ? 1.1 : 1 }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-xs font-bold text-[#0a2530] sm:h-8 sm:w-8 sm:text-sm shadow-md"
          >
            {index + 1}
          </motion.div>
        </div>

        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:border-cyan-400/30 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-[Poppins] text-base sm:text-lg font-extrabold text-white tracking-tight">
                {dayLabel}
              </h4>
              {dateLabel && (
                <p className="mt-1 text-xs font-semibold text-slate-400 font-[Inter]">{dateLabel}</p>
              )}
              {day.description && !isExpanded && (
                <p className="mt-2.5 text-[13.5px] text-slate-300 font-[Inter] line-clamp-2 leading-relaxed">
                  {day.description}
                </p>
              )}
            </div>
            {items.length > 0 && (
              <ChevronDown
                size={20}
                className={`shrink-0 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              />
            )}
          </div>

          <AnimatePresence>
            {isExpanded && items.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-5 space-y-3.5 border-t border-white/10 pt-5">
                  {items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col sm:flex-row gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:bg-white/[0.05] transition-colors duration-200"
                    >
                      {item.time && (
                        <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-cyan-400 font-[Inter] bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-1 rounded-lg h-fit w-fit">
                          <Clock size={12} strokeWidth={2.5} />
                          {item.time}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white text-[14.5px] font-[Poppins] tracking-tight">{item.title}</p>
                        {item.description && (
                          <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-[Inter]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}

export default function TimelineSection({ timeline }) {
  const [expandedDays, setExpandedDays] = useState(() =>
    timeline.length > 0 ? [0] : [],
  );

  const toggleDay = (index) => {
    setExpandedDays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  if (!timeline?.length) return null;

  return (
    <section id="timeline" className="scroll-mt-28">
      <div className="mb-12 text-center">
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 border border-cyan-400/20">
          Schedule
        </span>
        <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
          Event Timeline
        </h2>
        <p className="mt-2 text-base text-slate-400 max-w-md mx-auto">
          Explore the schedule, sessions, and milestones across the event.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {timeline.map((day, index) => (
          <TimelineDay
            key={index}
            day={day}
            index={index}
            isExpanded={expandedDays.includes(index)}
            onToggle={() => toggleDay(index)}
          />
        ))}
      </div>
    </section>
  );
}
