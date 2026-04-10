import { useState, useEffect } from "react";

const openingSequence = [
  { text: "VJDQ Family does not forget YOU", delay: 300 },
  { text: "We will never forget the Impact you have created", delay: 1800 },
  { text: "Separated by inputs, Integrated by outputs", delay: 3300 },
];

function FarewellSplash({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timeouts = openingSequence.map((line, idx) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, idx]);
      }, line.delay)
    );

    const skipTimeout = setTimeout(() => setCanSkip(true), 500);

    const autoComplete = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(skipTimeout);
      clearTimeout(autoComplete);
    };
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={handleSkip}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900">
        <div className="pointer-events-none absolute top-12 left-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute bottom-24 right-12 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <div className="space-y-12">
          {openingSequence.map((line, idx) => (
            <div
              key={idx}
              className={`transition-all duration-1000 ${
                visibleLines.includes(idx)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                {line.text}
              </h2>
            </div>
          ))}
        </div>

        {/* Skip hint */}
        {canSkip && (
          <div className="mt-16 animate-pulse text-center">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-cyan-200">
              Click anywhere to skip
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarewellSplash;
