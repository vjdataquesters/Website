import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import data from "../data/hitData";
import hitBg from "/HIT 2K26/bg.png";
import { Trophy, AlertCircle, HelpCircle, X } from "lucide-react";

/**
 * Example JSON format:
 * {
 *   "color": "red | blue | yellow",
 *   "path": "1 | 2 | 3",
 *   "qr": "qr-code",
 *   "question": "Question text",
 *   "image": "/images/clue1.jpg" | null,
 *   "audio": "/audio/clue1.mp3" | null,
 *   "video": "/videos/hint1.mp4" | null
 * }
 */
function Hit() {
  const [params] = useSearchParams({ q: "" });
  const navigate = useNavigate();
  const key = params.get("q");
  const [loading, setLoading] = useState(true);
  const [queryRes, setQueryRes] = useState(null);
  const [animation, setAnimation] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // when qr key changes
  useEffect(() => {
    if (key) {
      const res = data.find((obj) => obj.qr === key);
      if (res) {
        setQueryRes(res);
        // removing qr code in params
        window.history.replaceState({}, "", "/hit");
      }
    }
    setLoading(false);
  }, [key, navigate]);

  useEffect(() => {
    if (queryRes) setAnimation(true);
  }, [queryRes]);

  // Home Page
  const renderHomePage = () => (
    <div className="max-w-md w-full mx-auto text-center mt-12 sm:mt-20 md:mt-28 mb-auto">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md mb-2">
          Hit - Reloaded
        </h1>
        <p className="text-gray-200 text-base sm:text-lg font-medium drop-shadow-sm">
          The Ultimate QR Code Scavenger Hunt
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 border border-white/30">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Play</h2>
        <ol className="text-left text-gray-700 space-y-3">
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 font-bold text-sm">
              1
            </span>
            <span>Find QR codes hidden throughout the game area</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 font-bold text-sm">
              2
            </span>
            <span>Scan them with your phone's camera</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 font-bold text-sm">
              3
            </span>
            <span>Answer the questions to go to the next step</span>
          </li>
        </ol>
      </div>
    </div>
  );

  // Question Display
  const renderQuestion = () => {
    const pathColor = queryRes.color || "indigo";
    const driveId =
      queryRes.video && queryRes.video.includes("drive.google.com")
        ? queryRes.video.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/)?.[1] || ""
        : "";
    const colorMap = {
      red: {
        border: "border-red-500",
        bg: "bg-red-600",
        tagStyle: "bg-red-600 text-white",
        glow: "shadow-[0_15px_40px_-5px_rgba(239,68,68,0.3)]",
        name: "Red Path",
      },
      orange: {
        border: "border-orange-500",
        bg: "bg-orange-500",
        tagStyle: "bg-orange-500 text-white font-extrabold",
        glow: "shadow-[0_15px_40px_-5px_rgba(249,115,22,0.3)]",
        name: "Orange Path",
      },
      yellow: {
        border: "border-amber-400",
        bg: "bg-amber-400",
        tagStyle: "bg-amber-400 text-amber-950 font-extrabold",
        glow: "shadow-[0_15px_40px_-5px_rgba(245,158,11,0.3)]",
        name: "Yellow Path",
      },
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-600",
        tagStyle: "bg-blue-600 text-white",
        glow: "shadow-[0_15px_40px_-5px_rgba(59,130,246,0.3)]",
        name: "Blue Path",
      },
      green: {
        border: "border-emerald-500",
        bg: "bg-emerald-600",
        tagStyle: "bg-emerald-600 text-white",
        glow: "shadow-[0_15px_40px_-5px_rgba(16,185,129,0.3)]",
        name: "Green Path",
      },
      violet: {
        border: "border-purple-500",
        bg: "bg-purple-600",
        tagStyle: "bg-purple-600 text-white",
        glow: "shadow-[0_15px_40px_-5px_rgba(147,51,234,0.3)]",
        name: "Violet Path",
      },
      indigo: {
        border: "border-indigo-500",
        bg: "bg-indigo-600",
        tagStyle: "bg-indigo-600 text-white",
        glow: "shadow-[0_15px_40px_-5px_rgba(99,102,241,0.3)]",
        name: "Scavenger Hunt",
      },
    };
    const currentTheme = colorMap[pathColor] || colorMap.indigo;

    let stageBadgeText = currentTheme.name;
    if (queryRes.path === "final") {
      stageBadgeText = `🎉 ${currentTheme.name} • Final Stage`;
    } else if (queryRes.path === "fooled") {
      stageBadgeText = `😜 Decoy Code!`;
    } else if (queryRes.stage) {
      stageBadgeText = `${currentTheme.name} • Stage ${queryRes.stage}`;
    }

    return (
      <div
        className={`w-full max-w-xl min-w-0 mt-12 sm:mt-20 md:mt-28 mb-auto mx-auto text-center transition-opacity duration-500 ${
          animation ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-8 w-full min-w-0 max-w-full overflow-hidden border-t-4 transition-all duration-300 ${currentTheme.border} ${currentTheme.glow}`}
        >
          {/* Team Tag Badge */}
          <div className="flex justify-center mb-4">
            <span
              className={`px-4 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-sm ${currentTheme.tagStyle}`}
            >
              {stageBadgeText}
            </span>
          </div>

          {/* Victory Banner for Final Path */}
          {queryRes.path === "final" && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 shadow-sm flex flex-col items-center gap-1.5 text-center">
              <Trophy size={34} className="text-amber-500 animate-bounce" />
              <h2 className="text-lg font-black uppercase tracking-wide">
                Hunt Completed!
              </h2>
              <p className="text-xs font-medium text-amber-800">
                Congratulations! You reached the final clue location. Show this page to the organizers!
              </p>
            </div>
          )}

          {/* Decoy Banner for Fooled Path */}
          {queryRes.path === "fooled" && (
            <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-300 text-purple-900 shadow-sm flex flex-col items-center gap-1.5 text-center">
              <AlertCircle size={30} className="text-purple-600" />
              <h2 className="text-base font-black uppercase tracking-wide">
                Decoy QR Code Discovered!
              </h2>
              <p className="text-xs font-medium text-purple-800">
                Nice try! You've scanned a decoy code. Keep searching for your team's real clue!
              </p>
            </div>
          )}

          <div className="mb-6">
            {queryRes.path !== "final" && queryRes.path !== "fooled" && (
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                Clue Question
              </h1>
            )}
            <div
              className={`w-16 h-1 mx-auto rounded-full ${currentTheme.bg}`}
            ></div>
          </div>

          {/* Image */}
          {queryRes.image && (
            <div className="mb-6 flex justify-center">
              <img
                src={
                  queryRes.image.includes("drive.google.com")
                    ? `https://lh3.googleusercontent.com/d/${
                        queryRes.image.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/)?.[1] || ""
                      }`
                    : queryRes.image
                }
                alt="Clue"
                className="rounded-xl shadow-lg max-h-80 object-contain border border-slate-200/80"
                onError={(e) => {
                  // Fallback for Google Drive thumbnail API if lh3 direct CDN fails
                  const driveId = queryRes.image.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/)?.[1];
                  if (driveId && !e.target.dataset.triedFallback) {
                    e.target.dataset.triedFallback = "true";
                    e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
                  }
                }}
              />
            </div>
          )}

          {/* Audio */}
          {queryRes.audio && (
            <div className="mb-6 bg-slate-900/90 text-white p-4 rounded-xl shadow-md border border-slate-700/60">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 mb-3 flex items-center justify-center gap-2">
                <span>Listen carefully</span> 👂
              </h3>
              {queryRes.audio.includes("drive.google.com") ? (
                <iframe
                  src={`https://drive.google.com/file/d/${
                    queryRes.audio.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/)?.[1] || ""
                  }/preview`}
                  className="w-full rounded-xl shadow-lg h-36 border border-slate-700"
                  title="Audio Clue"
                />
              ) : (
                <audio controls className="w-full">
                  <source src={queryRes.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}

          {/* Video */}
          {queryRes.video && (
            <div className="mb-6 w-full min-w-0 max-w-full">
              {queryRes.path !== "final" && queryRes.path !== "fooled" && (
                <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                  <span>Watch this clip</span> 🎬
                </h3>
              )}

              <div
                className="relative w-full max-w-full overflow-hidden rounded-xl shadow-lg border border-slate-200 bg-black"
                style={{
                  aspectRatio: "16 / 9",
                  width: "100%",
                }}
              >
                <video
                  key={queryRes.video}
                  controls={queryRes.path !== "final" && queryRes.path !== "fooled"}
                  autoPlay={queryRes.path === "final" || queryRes.path === "fooled"}
                  loop={queryRes.path === "final" || queryRes.path === "fooled"}
                  muted={queryRes.path === "final" || queryRes.path === "fooled"}
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                >
                  {driveId ? (
                    <>
                      <source src={`/api/video/${driveId}`} type="video/mp4" />
                      <source
                        src={`https://drive.usercontent.google.com/download?id=${driveId}&export=download`}
                        type="video/mp4"
                      />
                      <source
                        src={`https://drive.google.com/uc?export=download&id=${driveId}`}
                        type="video/mp4"
                      />
                    </>
                  ) : (
                    <source src={queryRes.video} type="video/mp4" />
                  )}
                  Your browser does not support HTML5 video playback.
                </video>
              </div>
            </div>
          )}

          {/* Question text */}
          {queryRes.question && (
            <div className="bg-slate-50/90 border border-slate-200/80 p-5 rounded-xl text-left shadow-inner">
              <p
                className="font-sans text-slate-800 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: queryRes.question }}
              />
            </div>
          )}
        </div>

        {/* Footer info & Rules quick link */}
        <div className="mt-3 flex items-center justify-center gap-3 text-white font-medium text-xs drop-shadow-md">
          <span>Part of <span className="font-semibold">Hit - Reloaded</span></span>
          <span>•</span>
          <button
            onClick={() => setShowRulesModal(true)}
            className="hover:underline flex items-center gap-1 text-white/90 hover:text-white font-semibold cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>How to Play</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) return null;

  return (
    <section
      className="fixed inset-0 pt-56 sm:pt-72 md:pt-80 pb-10 px-4 flex justify-center items-start bg-cover bg-no-repeat overflow-y-auto z-10"
      style={{
        backgroundImage: `url(${hitBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {queryRes ? renderQuestion() : renderHomePage()}

      {/* Rules Modal */}
      {showRulesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowRulesModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl text-left border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <HelpCircle className="text-indigo-600" size={22} />
              <span>How to Play</span>
            </h3>
            <ol className="text-slate-700 space-y-3 text-sm">
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-indigo-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 font-bold text-xs">
                  1
                </span>
                <span>Find hidden QR codes throughout campus</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-indigo-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 font-bold text-xs">
                  2
                </span>
                <span>Scan them with your smartphone camera</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-indigo-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 font-bold text-xs">
                  3
                </span>
                <span>Solve questions & clues to find the next QR code!</span>
              </li>
            </ol>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Clue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Hit;
