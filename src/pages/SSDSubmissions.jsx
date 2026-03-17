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
  Trophy,
  Check,
  X,
  XCircle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import axios from "axios";

const MCQ_DURATION_MS = 5 * 60 * 1000; // 5 minutes, server-authoritative

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── MCQ Exam ─────────────────────────────────────────────────────────────────

function McqExam({ roll, onComplete }) {
  // "idle" → user sees start screen | "starting" → API in flight | "active" → exam running
  const [phase, setPhase] = useState("idle");
  const [questions, setQuestions] = useState([]);
  const [startError, setStartError] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitted = useRef(false);

  const handleStart = async () => {
    setPhase("starting");
    setStartError("");
    try {
      const { data } = await api.post("/submission/mcq/start", {
        rollno: roll,
      });
      const remaining = Math.max(
        Math.floor((data.mcqStartedAt + MCQ_DURATION_MS - Date.now()) / 1000),
        0,
      );
      setQuestions(data.questions);
      // Restore previously saved answers from the server (for rejoin)
      const restored = {};
      data.questions.forEach((q, i) => {
        if (q.selected) restored[i] = q.selected;
      });
      setAnswers(restored);
      setTimeLeft(remaining);
      setPhase("active");
    } catch (err) {
      setStartError(
        err?.response?.data?.message ||
          "Failed to start exam. Please try again.",
      );
      setPhase("idle");
    }
  };

  const handleAnswer = (questionIndex, questionText, option) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
    // Fire-and-forget auto-save
    api
      .post("/submission/mcq/answer", {
        rollno: roll,
        question: questionText,
        selected: option,
      })
      .catch(() => {
        /* silent — submit will send full answers as safety net */
      });
  };

  const handleSubmit = useCallback(async () => {
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
      const { data } = await api.get(`/submission/${roll}`);
      onComplete(data.submission);
    } catch (err) {
      submitted.current = false;
      setIsSubmitting(false);
      setSubmitError(
        err?.response?.data?.message || "Submission failed. Please try again.",
      );
    }
  }, [answers, questions, roll, onComplete]);

  const handleExpiry = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    const { data } = await api.get(`/submission/${roll}`);
    onComplete(data.submission);
  }, [roll, onComplete]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft === 0) {
      handleExpiry();
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
  }, [timeLeft, handleExpiry]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const isLow = (timeLeft ?? 0) <= 60;

  // ── Start screen ────────────────────────────────────────────────────────────
  if (phase === "idle" || phase === "starting") {
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <div className="rounded-full bg-[#0f323f]/8 p-5">
          <Timer size={32} className="text-[#135168]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-slate-900">Ready to begin?</h4>
          <p className="text-sm text-slate-500 max-w-sm">
            You have{" "}
            <span className="font-semibold text-slate-700">5 minutes</span> to
            complete the exam. The timer starts the moment you click{" "}
            <span className="font-semibold text-slate-700">start</span>.
          </p>
        </div>
        {startError && (
          <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {startError}
          </div>
        )}
        <button
          onClick={handleStart}
          disabled={phase === "starting"}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0f323f] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f323f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#135168] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {phase === "starting" ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Starting…
            </>
          ) : (
            "Start Exam"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Timer + answered count */}
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-sm font-medium ${
            isLow
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <Timer size={14} className={isLow ? "animate-pulse" : ""} />
          <span className="tabular-nums">{formatTime(timeLeft)} remaining</span>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {answeredCount} of {questions.length} answered
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-10">
        {questions.map((q, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-[#135168] uppercase tracking-widest shrink-0 mt-0.5">
                Q{i + 1}.
              </span>
              <p className="text-base font-semibold text-slate-900 leading-snug">
                {q.question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 ml-0 sm:ml-9">
              {q.options.map((option, oi) => {
                const label = ["A", "B", "C", "D"][oi];
                const selected = answers[i] === option;
                return (
                  <label
                    key={oi}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors duration-150 ${
                      selected
                        ? "border-slate-800 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={option}
                      checked={selected}
                      onChange={() => handleAnswer(i, q.question, option)}
                      className="hidden"
                    />

                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                        selected
                          ? "border-slate-800 bg-slate-800"
                          : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="flex-1 text-sm">
                      <span
                        className={`font-semibold mr-1.5 ${selected ? "text-slate-900" : "text-slate-400"}`}
                      >
                        {label}.
                      </span>
                      <span
                        className={
                          selected
                            ? "font-medium text-slate-900"
                            : "text-slate-700"
                        }
                      >
                        {option}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4 border-t border-slate-100 pt-8">
        {!allAnswered && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-amber-700">
            <AlertTriangle size={16} className="shrink-0" />
            <p>{questions.length - answeredCount} question(s) remaining.</p>
          </div>
        )}

        {submitError && (
          <div className="rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <button
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle size={16} className="animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Exam"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SSDSubmissions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roll, setRoll] = useState(searchParams.get("roll") ?? "");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    type: "idle",
    message: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [existingSubmission, setExistingSubmission] = useState(null);
  const scoreRef = useRef(null);

  useEffect(() => {
    if (existingSubmission?.status === "completed") {
      setTimeout(() => {
        if (!scoreRef.current) return;
        const top =
          scoreRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
      }, 100);
    }
  }, [existingSubmission?.status]);

  const doFetch = useCallback(async (trimmedRoll) => {
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

      setProblem({
        ps: problemRes.value.data.ps,
        ...problemRes.value.data.problem,
      });
      const sub =
        submissionRes.status === "fulfilled"
          ? submissionRes.value.data.submission
          : false;

      // mcqs-attempting + timer already expired → re-fetch so backend auto-completes
      if (
        sub &&
        sub.status === "mcqs-attempting" &&
        sub.mcqStartedAt + MCQ_DURATION_MS - Date.now() <= 0
      ) {
        const { data: refreshed } = await api.get(`/submission/${trimmedRoll}`);
        setExistingSubmission(refreshed.submission);
      } else {
        setExistingSubmission(sub);
      }
      setStatus({ type: "success", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Could not fetch your problem statement. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount if roll is in the URL
  useEffect(() => {
    const urlRoll = searchParams.get("roll");
    if (urlRoll) doFetch(urlRoll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProblem = (e) => {
    e.preventDefault();
    const trimmedRoll = roll.trim();
    if (!trimmedRoll) {
      setStatus({ type: "error", message: "Please enter your roll number." });
      return;
    }
    setSearchParams({ roll: trimmedRoll }, { replace: true });
    doFetch(trimmedRoll);
  };

  const submitSolution = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setUploadStatus({
        type: "error",
        message: "Please select an image to upload.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: "idle", message: "" });

    try {
      const { data: signedData } = await api.post(
        "/submission/get-signed-url",
        {
          fileName: imageFile.name,
          fileType: imageFile.type,
        },
      );

      await axios.put(signedData.signedUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });

      await api.post("/submission/submit", {
        rollno: roll.trim(),
        imageKey: signedData.imageKey,
        imageMimeType: imageFile.type,
      });

      const { data: subData } = await api.get(`/submission/${roll.trim()}`);
      setExistingSubmission(subData.submission);
      setUploadStatus({ type: "idle", message: "" });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadStatus({
        type: "error",
        message:
          error?.response?.data?.message || "Upload failed. Please try again.",
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
          <h3 className="mb-1 text-2xl font-bold text-slate-900">
            Upload your solution
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Upload an image of your solution for PS {problem.ps}.
          </p>
          <form onSubmit={submitSolution} className="flex flex-col gap-4">
            <label
              htmlFor="solution-image"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/")) {
                  setImageFile(file);
                  setUploadStatus({ type: "idle", message: "" });
                }
              }}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors duration-200 ${
                isDragging
                  ? "border-[#135168] bg-[#135168]/10"
                  : imageFile
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
                    <p className="font-medium text-slate-700">
                      Click or drag & drop an image
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, JPEG, WEBP
                    </p>
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

    if (submissionStatus === "processing") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="rounded-full bg-[#0f323f]/8 p-4">
            <Clock size={28} className="text-[#135168] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Processing Your Submission
            </h3>
            <p className="text-slate-500 text-sm">
              Your solution is being evaluated. This may take a moment.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Submitted {new Date(existingSubmission.updatedAt).toLocaleString()}
          </p>
        </div>
      );
    }

    if (submissionStatus === "pending") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="rounded-full bg-[#0f323f]/8 p-4">
            <Clock size={28} className="text-[#135168] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Submission Received
            </h3>
            <p className="text-slate-500 text-sm">
              Your solution is being reviewed.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Submitted {new Date(existingSubmission.updatedAt).toLocaleString()}
          </p>
        </div>
      );
    }

    if (
      submissionStatus === "mcqs-pending" ||
      submissionStatus === "mcqs-attempting"
    ) {
      return (
        <>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#135168] mb-1">
              MCQ Round
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              Answer the questions below
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Based on your submitted solution. The exam is timed — once you
              start, the clock runs.
            </p>
          </div>
          <McqExam
            roll={roll.trim()}
            onComplete={(updated) => setExistingSubmission(updated)}
          />
        </>
      );
    }

    if (submissionStatus === "test-submitted") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="rounded-full bg-[#0f323f]/8 p-4">
            <CheckCircle2 size={28} className="text-[#1d816f]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              MCQ Submitted
            </h3>
            <p className="text-slate-500 text-sm">
              Your answers have been recorded. Results will be revealed soon.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Submitted {new Date(existingSubmission.updatedAt).toLocaleString()}
          </p>
        </div>
      );
    }

    if (submissionStatus === "completed") {
      const questions = existingSubmission.questions ?? [];

      return (
        <div className="space-y-8">
          {/* ── MCQ Review ────────────────────────────────────────────────── */}
          <div ref={scoreRef}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              MCQ Review
            </p>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const isCorrect = q.selected === q.correct_answer;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-white p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Q{i + 1}
                        </p>
                        <p className="font-semibold text-slate-900 text-sm leading-relaxed">
                          {q.question}
                        </p>
                      </div>
                      {isCorrect ? (
                        <CheckCircle2
                          size={18}
                          className="text-green-500 shrink-0 mt-0.5"
                        />
                      ) : (
                        <XCircle
                          size={18}
                          className="text-red-400 shrink-0 mt-0.5"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Your Answer
                        </span>
                        <div
                          className={`rounded-lg border p-2.5 text-sm font-medium ${
                            isCorrect
                              ? "border-green-100 bg-green-50/40 text-green-800"
                              : "border-red-100 bg-red-50/40 text-red-800"
                          }`}
                        >
                          {q.selected || (
                            <span className="italic opacity-50">
                              Not answered
                            </span>
                          )}
                        </div>
                      </div>
                      {!isCorrect && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Correct Answer
                          </span>
                          <div className="rounded-lg border border-green-100 bg-green-50/40 p-2.5 text-sm font-medium text-green-800">
                            {q.correct_answer}
                          </div>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Explanation
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
          <Link
            to="/events/SSD"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
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
              Enter your roll number to view the problem statement assigned to
              you.
            </p>

            <form
              onSubmit={fetchProblem}
              className="flex flex-col gap-3 sm:flex-row sm:items-start"
            >
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
                  <>Submit</>
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
                          <li
                            key={j}
                            className="text-slate-700 text-sm leading-relaxed"
                          >
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
