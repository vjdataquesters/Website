import { motion } from "framer-motion";

export default function EventMetaCard({
  icon: Icon,
  label,
  value,
  index = 0,
  variant = "default",
}) {
  const isPanel = variant === "panel";

  return (
    <motion.div
      initial={{ opacity: 0, y: isPanel ? 12 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={isPanel ? { y: -2 } : { y: -4, scale: 1.02 }}
      className={
        isPanel
          ? "flex flex-col gap-2.5 px-6 py-5 transition-all duration-300 hover:bg-[#0f323f]/[0.02] cursor-default group"
          : "group relative flex min-w-[145px] flex-1 flex-col gap-2.5 rounded-2xl border border-white/50 bg-white/70 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#0f323f]/25"
      }
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f323f]/5 text-[#0f323f] border border-[#0f323f]/8 transition-all duration-300 group-hover:bg-[#0f323f] group-hover:text-white group-hover:scale-105"
          >
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f323f]/45">
          {label}
        </span>
      </div>
      <p className="font-[Poppins] text-[14.5px] font-bold leading-snug text-[#0f323f] sm:text-[15px]">
        {value}
      </p>
    </motion.div>
  );
}
