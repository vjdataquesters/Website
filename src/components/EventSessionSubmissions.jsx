import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderCircle, FileText } from "lucide-react";
import { api } from "../utils/api";

export default function EventSessionSubmissions() {
  const [roll, setRoll] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProblem = async (e) => {
    e.preventDefault();
    const trimmedRoll = roll.trim();
    if (!trimmedRoll) {
      setStatus({ type: "error", message: "Please enter your roll number." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "idle", message: "" });
    setProblem(null);

    try {
      const response = await api.get(`/submission/problem/${trimmedRoll}`);
      setProblem({ ps: response.data.ps, ...response.data.problem });
      setStatus({ type: "success", message: "" });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Could not fetch your problem statement. Please try again.";
      setStatus({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="my-8 rounded-[1.5rem] bg-gradient-to-br from-[#0f323f] via-[#135168] to-[#1d816f] p-[1px] shadow-[0_20px_70px_rgba(15,50,63,0.16)]"
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-white/95 p-6 backdrop-blur md:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#0f323f]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#135168]">
          Problem Statement
        </div>
        <h3 className="mb-5 text-2xl font-bold text-slate-900 md:text-3xl">
          View your assigned problem
        </h3>

        <form onSubmit={fetchProblem} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <input
            type="text"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            placeholder="Enter your roll number (e.g. 24071A7263)"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#1d816f]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-2xl bg-[#0f323f] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f323f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#135168] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <FileText size={16} />
                Get Problem
              </>
            )}
          </button>
        </form>

        {status.type === "error" && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {status.message}
          </div>
        )}

        <AnimatePresence>
          {problem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-6 border-t border-slate-200/80 pt-6 space-y-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#0f323f]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#135168]">
                  PS {problem.ps}
                </span>
                <h4 className="text-xl font-bold text-slate-900">
                  {problem.title}
                </h4>
              </div>

              {problem.content?.map((section, i) => (
                <div key={i}>
                  <h5 className="mb-2 font-semibold text-slate-800">
                    {section.section}
                  </h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {section.points.map((point, j) => (
                      <li key={j} className="text-slate-700 text-sm leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
