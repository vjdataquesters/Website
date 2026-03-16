import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LoaderCircle,
  FileText,
  ArrowLeft,
  Upload,
  ImageIcon,
  CheckCircle2,
  Clock,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import axios from "axios";

const MCQ_SECONDS_PER_QUESTION = 30;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── MCQ Exam ─────────────────────────────────────────────────────────────────

function McqExam({ submission, roll, onComplete }) {
  const questions = submission.questions ?? [];
  const DURATION = questions.length * MCQ_SECONDS_PER_QUESTION;
  const storageKey = `ssd-mcq-start:${roll}`;

  const getTimeLeft = () => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      const now = Date.now();
      localStorage.setItem(storageKey, String(now));
      return DURATION;
    }
    return Math.max(DURATION - Math.floor((Date.now() - Number(stored)) / 1000), 0);
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitted = useRef(false);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitted.current) return;
      submitted.current = true;
      setIsSubmitting(true);
      setSubmitError("");
      try {
        await api.post("/submission/mcq/submit", {
          rollno: roll,
          answers: questions.map((q, i) => ({
            question: q.question,
            selected: answers[i] ?? "",
          })),
        });
        localStorage.removeItem(storageKey);
        const { data } = await api.get(`/submission/${roll}`);
        onComplete(data.submission);
      } catch (err) {
        submitted.current = false;
        setIsSubmitting(false);
        setSubmitError(
          err?.response?.data?.message || "Submission failed. Please try again."
        );
      }
    },
    [answers, questions, roll, storageKey, onComplete]
  );

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit(true);
      return;
    }
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, handleSubmit]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const isLow = timeLeft <= 60;

  return (
    <div className="space-y-6">
      {/* Timer bar */}
      <div
        className={`flex items-center justify-between rounded-2xl px-5 py-3 ${
          isLow ? "bg-red-50 border border-red-200" : "bg-slate-50 border border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <Timer size={16} className={isLow ? "text-red-500" : "text-slate-500"} />
          <span className={`text-sm font-medium ${isLow ? "text-red-600" : "text-slate-600"}`}>
            Time remaining
          </span>
        </div>
        <span
          className={`text-xl font-bold tabular-nums ${
            isLow ? "text-red-600" : "text-slate-800"
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress */}
      <p className="text-sm text-slate-500">
        {answeredCount} of {questions.length} answered
      </p>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((q, i) => (
          <div key={i} className="space-y-3">
            <p className="font-semibold text-slate-900">
              <span className="text-[#135168] mr-2">Q{i + 1}.</span>
              {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((option, oi) => {
                const label = ["A", "B", "C", "D"][oi];
                const selected = answers[i] === option;
                return (
                  <label
                    key={oi}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors duration-150 ${
                      selected
                        ? "border-[#135168] bg-[#135168]/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={option}
                      checked={selected}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [i]: option }))
                      }
                      className="mt-0.5 accent-[#135168] shrink-0"
                    />
                    <span className="text-sm text-slate-800">
                      <span className="font-semibold mr-1">{label}.</span>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!allAnswered && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle size={15} className="shrink-0" />
          {questions.length - answeredCount} question(s) unanswered. You can still submit.
        </div>
      )}

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <button
        onClick={() => handleSubmit(false)}
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f323f] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f323f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#135168] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Exam"
        )}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SSDSubmissions() {
  const [roll, setRoll] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ type: "idle", message: "" });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [existingSubmission, setExistingSubmission] = useState(null);

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
    setExistingSubmission(null);

    try {
      const [problemRes, submissionRes] = await Promise.allSettled([
        api.get(`/submission/problem/${trimmedRoll}`),
        api.get(`/submission/${trimmedRoll}`),
      ]);

      if (problemRes.status === "rejected") throw problemRes.reason;

      setProblem({ ps: problemRes.value.data.ps, ...problemRes.value.data.problem });
      setExistingSubmission(
        submissionRes.status === "fulfilled" ? submissionRes.value.data.submission : false
      );
      setStatus({ type: "success", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.response?.data?.message || "Could not fetch your problem statement. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitSolution = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setUploadStatus({ type: "error", message: "Please select an image to upload." });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: "idle", message: "" });

    try {
      const { data: signedData } = await api.post("/submission/get-signed-url", {
        fileName: imageFile.name,
        fileType: imageFile.type,
      });

      await axios.put(signedData.signedUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });

      await api.post("/submission/submit", {
        rollno: roll.trim(),
        imageKey: signedData.imageKey,
      });

      const { data: subData } = await api.get(`/submission/${roll.trim()}`);
      setExistingSubmission(subData.submission);
      setUploadStatus({ type: "idle", message: "" });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error?.response?.data?.message || "Upload failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Render the second card content based on submission status
  const renderSubmissionCard = () => {
    if (!existingSubmission) {
      // No submission yet — show upload form
      return (
        <>
          <h3 className="mb-1 text-2xl font-bold text-slate-900">Upload your solution</h3>
          <p className="text-slate-500 text-sm mb-6">
            Upload an image of your solution for PS {problem.ps}.
          </p>
          <form onSubmit={submitSolution} className="flex flex-col gap-4">
            <label
              htmlFor="solution-image"
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors duration-200 ${
                imageFile
                  ? "border-[#1d816f] bg-[#1d816f]/5"
                  : "border-slate-200 hover:border-[#135168] bg-slate-50"
              }`}
            >
              <ImageIcon size={32} className="text-slate-400" />
              <div className="text-center">
                {imageFile ? (
                  <p className="font-medium text-slate-800">{imageFile.name}</p>
                ) : (
                  <>
                    <p className="font-medium text-slate-700">Click to select an image</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG, WEBP</p>
                  </>
                )}
              </div>
              <input
                id="solution-image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  setImageFile(e.target.files[0] || null);
                  setUploadStatus({ type: "idle", message: "" });
                }}
              />
            </label>

            {uploadStatus.type === "error" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {uploadStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !imageFile}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f323f] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f323f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#135168] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploading ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Submit Solution
                </>
              )}
            </button>
          </form>
        </>
      );
    }

    const { status: submissionStatus } = existingSubmission;

    if (submissionStatus === "pending") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="rounded-full bg-[#0f323f]/8 p-4">
            <Clock size={28} className="text-[#135168] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Submission Received</h3>
            <p className="text-slate-500 text-sm">
              Your solution is being reviewed. MCQ questions will appear here once ready.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Submitted {new Date(existingSubmission.updatedAt).toLocaleString()}
          </p>
        </div>
      );
    }

    if (submissionStatus === "mcqs-pending") {
      return (
        <>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#135168] mb-1">
              MCQ Round
            </p>
            <h3 className="text-2xl font-bold text-slate-900">Answer the questions below</h3>
            <p className="text-slate-500 text-sm mt-1">
              Based on your submitted solution. The exam is timed — once you start, the clock runs.
            </p>
          </div>
          <McqExam
            submission={existingSubmission}
            roll={roll.trim()}
            onComplete={(updated) => setExistingSubmission(updated)}
          />
        </>
      );
    }

    if (submissionStatus === "completed") {
      return (
        <>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 size={22} className="text-green-600 shrink-0" />
            <h3 className="text-xl font-bold text-slate-900">Evaluation Complete</h3>
          </div>
          <div className="space-y-5">
            {existingSubmission.score_80 != null && (
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#0f323f]">{existingSubmission.score_80}</p>
                  <p className="text-xs text-slate-500 mt-0.5">/ 80</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <p className="text-sm text-slate-600">Your score</p>
              </div>
            )}

            {existingSubmission.evaluator_feedback && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#135168] mb-2">
                  Feedback
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {existingSubmission.evaluator_feedback}
                </p>
              </div>
            )}

            {existingSubmission.edge_cases?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#135168] mb-2">
                  Edge Cases to Consider
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {existingSubmission.edge_cases.map((ec, i) => (
                    <li key={i} className="text-sm text-slate-700">{ec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="pt-20 min-h-screen bg-blue-50/70">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#135168] mb-1">
              Summer System Design
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Problems & Submissions
            </h1>
          </div>
          <Link to="/events/SSD" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
        </div>

        {/* Roll number + problem statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-[1.5rem] bg-gradient-to-br from-[#0f323f] via-[#135168] to-[#1d816f] p-[1px] shadow-[0_20px_70px_rgba(15,50,63,0.16)]"
        >
          <div className="rounded-[calc(1.5rem-1px)] bg-white/95 p-6 backdrop-blur md:p-8">
            <p className="text-slate-600 mb-6">
              Enter your roll number to view the problem statement assigned to you.
            </p>

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
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#135168] mb-1">
                      PS {problem.ps}
                    </p>
                    <h4 className="text-xl font-bold text-slate-900">{problem.title}</h4>
                  </div>

                  {problem.content?.map((section, i) => (
                    <div key={i}>
                      <h5 className="mb-2 font-semibold text-slate-800">{section.section}</h5>
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
        </motion.div>

        {/* Submission card */}
        <AnimatePresence>
          {problem && existingSubmission !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
              className="mt-6 rounded-[1.5rem] bg-gradient-to-br from-[#0f323f] via-[#135168] to-[#1d816f] p-[1px] shadow-[0_20px_70px_rgba(15,50,63,0.16)]"
            >
              <div className="rounded-[calc(1.5rem-1px)] bg-white/95 p-6 backdrop-blur md:p-8">
                {renderSubmissionCard()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
