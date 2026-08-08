import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar,
  Clock,
  FileText,
  Image,
  Layers,
  Mic2,
  Trophy,
  Users,
} from "lucide-react";

const iconMap = {
  users: Users,
  mic: Mic2,
  calendar: Calendar,
  layers: Layers,
  image: Image,
  file: FileText,
  trophy: Trophy,
  clock: Clock,
};

function AnimatedValue({ value, isText, isInView }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isText || !isInView) return;

    const numericValue = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10);
    if (!numericValue || Number.isNaN(numericValue)) return;

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, isText, isInView]);

  if (isText) return <span>{value}</span>;
  if (typeof value === "number") return <span>{isInView ? display : 0}</span>;

  const numeric = parseInt(String(value).replace(/\D/g, ""), 10);
  if (numeric && String(value) === String(numeric)) {
    return <span>{isInView ? display : 0}</span>;
  }

  return <span>{value}</span>;
}

export default function StatsCard({ stat, index = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = iconMap[stat.icon] || Layers;

  // Detect if the value is a clean numeric count
  const isNumeric = !stat.isText && /^[\d\s\-+]+$/.test(String(stat.value).trim());
  const hasPlus = !stat.isText && String(stat.value).includes("+");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative flex flex-col items-center justify-center p-4 text-center transition-all duration-300 w-full"
    >
      {/* Icon with soft pulse glow */}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/5 text-cyan-400 border border-cyan-500/10 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-emerald-500 group-hover:text-[#0a2530] group-hover:border-transparent group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
        <Icon size={18} />
      </div>

      {/* Massive gradient typography */}
      {isNumeric ? (
        <h3 className="font-[Poppins] text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          <AnimatedValue value={stat.value} isText={stat.isText} isInView={isInView} />
          {hasPlus && <span className="text-2xl font-bold ml-0.5 text-cyan-400">+</span>}
        </h3>
      ) : (
        <h3 className="font-[Poppins] text-base sm:text-lg font-bold tracking-normal leading-snug bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent max-w-[160px] mx-auto text-center">
          {stat.value}
        </h3>
      )}

      {/* Modern label typography */}
      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400 font-[Inter]">
        {stat.label}
      </p>
    </motion.div>
  );
}
