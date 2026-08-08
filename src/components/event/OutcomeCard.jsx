import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function OutcomeCard({ outcome, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10"
    >
      <div className="flex items-start gap-4">
        {/* Glow-ring Checkbox Icon */}
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-[#0a2530] group-hover:border-transparent transition-all duration-300 shadow-sm">
          <Check size={14} strokeWidth={3} />
        </div>
        <div className="min-w-0">
          <h4 className="font-[Poppins] text-[16px] font-extrabold text-white tracking-tight leading-snug">
            {outcome.title}
          </h4>
          {outcome.description && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-300 font-[Inter]">
              {outcome.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
