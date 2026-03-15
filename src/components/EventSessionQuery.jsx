import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { api } from "../utils/api";

const SESSION_QUERY_COOLDOWN_MS = 2 * 60 * 1000;

function formatCooldown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function EventSessionQuery({ eventname }) {
  const [isSessionQueryOpen, setIsSessionQueryOpen] = useState(false);
  const [sessionQueryStatus, setSessionQueryStatus] = useState({
    type: "idle",
    message: "",
  });
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      query: "",
    },
  });

  const sessionQueryStorageKey = `event-session-query-last:${eventname}`;
  const isSessionQueryCooldownActive = cooldownRemainingMs > 0;

  useEffect(() => {
    if (typeof window === "undefined") {
      setCooldownRemainingMs(0);
      return undefined;
    }

    const syncCooldown = () => {
      const storedTimestamp = window.localStorage.getItem(
        sessionQueryStorageKey,
      );

      if (!storedTimestamp) {
        setCooldownRemainingMs(0);
        return;
      }

      const remainingMs = Math.max(
        SESSION_QUERY_COOLDOWN_MS - (Date.now() - Number(storedTimestamp)),
        0,
      );

      setCooldownRemainingMs(remainingMs);

      if (remainingMs === 0) {
        window.localStorage.removeItem(sessionQueryStorageKey);
      }
    };

    syncCooldown();
    const intervalId = window.setInterval(syncCooldown, 1000);

    return () => window.clearInterval(intervalId);
  }, [sessionQueryStorageKey]);

  const submitSessionQuery = async (data) => {
    if (isSessionQueryCooldownActive) {
      setSessionQueryStatus({
        type: "error",
        message: `Please wait ${formatCooldown(cooldownRemainingMs)} before posting another query.`,
      });
      return;
    }

    try {
      setSessionQueryStatus({ type: "idle", message: "" });

      await api.post("/session-query", {
        name: data.name.trim(),
        query: data.query.trim(),
      });

      reset();
      if (typeof window !== "undefined") {
        window.localStorage.setItem(sessionQueryStorageKey, String(Date.now()));
      }
      setCooldownRemainingMs(SESSION_QUERY_COOLDOWN_MS);
      setSessionQueryStatus({ type: "success", message: "" });
    } catch (error) {
      console.error("Error submitting session query:", error);
      setSessionQueryStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "We could not send your query right now. Please try again in a moment.",
      });
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
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#0f323f]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#135168]">
              Session Queries
            </div>
            <h3 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Have a question.. post your query
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {sessionQueryStatus.type === "success" && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1d816f]">
                <CheckCircle2 size={16} className="shrink-0" />
                Query submitted!
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSessionQueryOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-2xl bg-[#0f323f] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f323f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#135168]"
            >
              {isSessionQueryOpen ? "Hide" : "Ask a Session Query"}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isSessionQueryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit(submitSessionQuery)}
                className="mt-6 grid gap-4 border-t border-slate-200/80 pt-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-1">
                    <label
                      htmlFor="session-query-name"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Name
                      <span className="ml-1 text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="session-query-name"
                      type="text"
                      placeholder="Your name"
                      {...register("name", {
                        maxLength: {
                          value: 60,
                          message: "Name should be under 60 characters.",
                        },
                      })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#1d816f] focus:ring-0"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="session-query-text"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Query
                  </label>
                  <textarea
                    id="session-query-text"
                    rows="5"
                    placeholder="Type your question for the speakers here..."
                    {...register("query", {
                      required: "Please enter your query.",
                      minLength: {
                        value: 8,
                        message:
                          "Query too short.",
                      },
                      maxLength: {
                        value: 500,
                        message: "Please keep the query within 500 characters.",
                      },
                    })}
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#1d816f] focus:ring-0"
                  />
                  {errors.query && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.query.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-500">
                    Please post only relevant questions.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting || isSessionQueryCooldownActive}
                    className="inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-2xl bg-[#0f323f] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f323f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#135168] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : isSessionQueryCooldownActive ? (
                      <>{formatCooldown(cooldownRemainingMs)}</>
                    ) : (
                      <>Submit Query</>
                    )}
                  </button>
                </div>

                {sessionQueryStatus.type === "error" && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {sessionQueryStatus.message}
                  </div>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
