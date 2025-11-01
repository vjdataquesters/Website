import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import data from "../data/hitData";
import bg_img from "/hitAssests/bg.jpg";
import bg_img_big from "/hitAssests/bg_big.jpg";

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
  const [isBigScreen, setIsBigScreen] = useState(window.innerWidth >= 1024);

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

  useEffect(() => {
    const handleResize = () => {
      setIsBigScreen(window.innerWidth >= 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Home Page
  const renderHomePage = () => (
    <div className="max-w-md w-full mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Hit - Reloaded
        </h1>
        <p className="text-gray-600 text-lg">
          The Ultimate QR Code Scavenger Hunt
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">How to Play</h2>
        <ol className="text-left text-gray-600 space-y-3">
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
              1
            </span>
            <span>Find QR codes hidden throughout the game area</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
              2
            </span>
            <span>Scan them with your phone's camera</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
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

    return (
      <div
        className={`max-w-xl mt-10 w-full mx-auto text-center transition-opacity duration-500 ${
          animation ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4">
          <div className="mb-6">
            {queryRes.path !== "final" && queryRes.path !== "fooled" && (
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Question
              </h1>
            )}
            <div
              className={`w-16 h-1 mx-auto rounded-full bg-${pathColor}-500`}
            ></div>
          </div>

          {/* Image */}
          {queryRes.image && (
            <div className="mb-6 flex justify-center">
              <img
                src={queryRes.image}
                alt="Clue"
                className="rounded-lg shadow-md max-h-80 object-contain"
              />
            </div>
          )}

          {/* Audio */}
          {queryRes.audio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Listen carefully 👂
              </h3>
              <audio controls className="w-full">
                <source src={queryRes.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Video */}
          {queryRes.video && (
            <div className="mb-6">
              {queryRes.path !== "final" && queryRes.path !== "fooled" && (
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Watch this clip 🎬
                </h3>
              )}
              <video
                src={queryRes.video}
                controls={
                  queryRes.path !== "final" && queryRes.path !== "fooled"
                }
                autoPlay={
                  queryRes.path === "final" || queryRes.path === "fooled"
                }
                loop={queryRes.path === "final" || queryRes.path === "fooled"}
                muted={queryRes.path === "final" || queryRes.path === "fooled"}
                className="w-full rounded-lg shadow-md min-h-80 max-h-[90vh]"
              />
            </div>
          )}

          {/* Question text */}
          {queryRes.question && (
            <div className="bg-gray-50 p-5 rounded-lg">
              <p
                className="text-left font-mono text-gray-700 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: queryRes.question }}
              />
            </div>
          )}
        </div>

        <div className="mt-1 text-black text-sm">
          Part of <span className="font-semibold">Hit - Reloaded</span> • Keep
          hunting!
        </div>
      </div>
    );
  };

  if (loading) return null;

  return (
    <section
      className="fixed inset-0 py-10 px-4 flex justify-center items-center bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{
        backgroundImage: `url(${isBigScreen ? bg_img_big : bg_img})`,
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
      }}
    >
      {queryRes ? renderQuestion() : renderHomePage()}
    </section>
  );
}

export default Hit;
