import { motion } from "framer-motion";
import {
  Brain,
  ChartBar,
  Cloud,
  Code2,
  Layers,
  Mic2,
  Sparkles,
  Star,
  Trophy,
  Wrench,
} from "lucide-react";

const iconMap = {
  code: Code2,
  wrench: Wrench,
  mic: Mic2,
  chart: ChartBar,
  cloud: Cloud,
  sparkles: Sparkles,
  trophy: Trophy,
  brain: Brain,
  layers: Layers,
  star: Star,
};

export default function HighlightCard({ highlight, index = 0 }) {
  const Icon = iconMap[highlight.icon] || Star;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10"
    >
      {/* Decorative card glow background */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-colors duration-300" />

      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white border border-white/10 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-teal-500 group-hover:text-[#0a2530] group-hover:border-transparent group-hover:scale-110 shadow-sm">
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <h4 className="font-[Poppins] text-[17px] font-extrabold text-white tracking-tight">
          {highlight.title}
        </h4>
        {highlight.description && (
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-350 font-[Inter]">
            {highlight.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
