import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LoaderCircle,
  FileText,
  ArrowLeft,
  Upload,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import axios from "axios";

export default function SSDSubmissions() {
  const [roll, setRoll] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    type: "idle",
    message: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [existingSubmission, setExistingSubmission] = useState(null); // null = not checked, false = none, object = exists

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

      if (problemRes.status === "rejected") {
        throw problemRes.reason;
      }

      setProblem({
        ps: problemRes.value.data.ps,
        ...problemRes.value.data.problem,
      });
      setExistingSubmission(
        submissionRes.status === "fulfilled"
          ? submissionRes.value.data.submission
          : false,
      );
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
      // Step 1: get signed URL
      const { data: signedData } = await api.post(
        "/submission/get-signed-url",
        {
          fileName: imageFile.name,
          fileType: imageFile.type,
        },
      );

      // Step 2: upload image directly to GCS
      await axios.put(signedData.signedUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });

      // Step 3: save submission
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
        message:
          error?.response?.data?.message || "Upload failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
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
                {existingSubmission ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2
                        size={20}
                        className="text-green-600 shrink-0"
                      />
                      <h3 className="text-xl font-bold text-slate-900">
                        Submission Received
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-800">
                          Roll No:
                        </span>{" "}
                        {existingSubmission.rollno}
                      </p>
                      <p>
                        <span className="font-medium text-slate-800">PS:</span>{" "}
                        {existingSubmission.ps}
                      </p>
                      <p>
                        <span className="font-medium text-slate-800">
                          Submitted at:
                        </span>{" "}
                        {new Date(
                          existingSubmission.updatedAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                      Only one submission is allowed per participant.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="mb-1 text-2xl font-bold text-slate-900">
                      Upload your solution
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Upload an image of your solution for PS {problem.ps}.
                    </p>

                    <form
                      onSubmit={submitSolution}
                      className="flex flex-col gap-4"
                    >
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
                            <p className="font-medium text-slate-800">
                              {imageFile.name}
                            </p>
                          ) : (
                            <>
                              <p className="font-medium text-slate-700">
                                Click to select an image
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
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
