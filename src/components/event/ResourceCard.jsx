import { motion } from "framer-motion";
import { Download, FileArchive, FileCode, FileJson, FileText, Globe } from "lucide-react";

const iconMap = {
  archive: FileArchive,
  pdf: FileText,
  code: FileCode,
  notebook: FileJson,
  file: FileText,
  link: Globe,
};

export default function ResourceCard({ resource, index = 0, onDownload }) {
  const Icon = iconMap[resource.type] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10 flex flex-col justify-between"
    >
      <div className="relative z-10 flex gap-4">
        {/* Resource Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white border border-white/10 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-teal-500 group-hover:text-[#0a2530] group-hover:border-transparent group-hover:scale-110 shadow-sm">
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <h4 className="font-[Poppins] text-[16.5px] font-extrabold text-white tracking-tight leading-snug">
            {resource.title}
          </h4>
          {resource.description && (
            <p className="mt-1 text-xs sm:text-[13px] text-slate-400 font-[Inter] leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex">
        <button
          type="button"
          onClick={() => onDownload(resource.url, resource.title)}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-400 transition-all duration-300 hover:bg-cyan-500 hover:text-[#0a2530] hover:border-transparent hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.97]"
        >
          <Download size={13} strokeWidth={2.5} />
          <span>Download</span>
        </button>
      </div>
    </motion.div>
  );
}
