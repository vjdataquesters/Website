import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SubmissionsPanel from "./SubmissionsPanel";

export default function EventSubmissions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#0f323f] to-[#135168] px-6 py-4 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">
            Submissions
          </p>
          <p className="text-lg font-bold">Problem Statement & Submissions</p>
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-0">
              <SubmissionsPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
