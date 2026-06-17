import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function EventNav({ sections }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      const offset = 160;
      let current = sections[0]?.id || "";

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = section.id;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (sections.length <= 1) return null;

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400"
          style={{ width: `${scrollProgress}%` }}
          layout={false}
        />
      </div>

      {/* Sticky nav */}
      <nav
        className="sticky top-[64px] z-40 border-b border-white/10 bg-[#0a2530]/85 backdrop-blur-xl shadow-lg py-1.5"
        aria-label="Event sections"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-250 ${
                  activeSection === section.id
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {activeSection === section.id && (
                  <motion.div
                    layoutId="event-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 shadow-md shadow-cyan-950/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
