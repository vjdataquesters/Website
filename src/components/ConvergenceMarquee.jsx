import { Link } from "react-router-dom";

export const ConvergenceMarquee = () => {
  const items = [1, 2, 3, 4];

  return (
    <Link
      to="/events"
      className="group block w-full fixed top-16 left-0 right-0 bg-gradient-to-r from-[#0b242e] via-[#0f323f] to-[#0b242e] border-y border-[#1a556a]/70 hover:bg-[#13495c] transition-colors duration-200 overflow-hidden select-none z-[101] cursor-pointer"
      aria-label="Convergence 2K26 Events Are LIVE Now — Check It Out!"
    >
      <div className="relative flex items-center py-2 sm:py-2.5 overflow-hidden">
        {/* Track 1 */}
        <div className="flex w-max shrink-0 animate-marquee items-center gap-6 sm:gap-10 group-hover:[animation-play-state:paused]">
          {items.map((i) => (
            <div key={`m1-${i}`} className="flex items-center gap-6 sm:gap-10 shrink-0">
              <span className="text-white text-xs sm:text-sm font-medium tracking-wide flex items-center gap-2">
                <span className="text-base sm:text-lg">🚀</span>
                <span>
                  <strong className="font-semibold text-cyan-300">Convergence 2K26 Events</strong>{" "}
                  Are{" "}
                  <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] sm:text-xs uppercase tracking-wider">
                    LIVE
                  </span>{" "}
                  Now — Check It Out!
                </span>
              </span>
              <span className="text-cyan-400/60 text-xs sm:text-sm">✦</span>
            </div>
          ))}
        </div>

        {/* Track 2 (for seamless loop) */}
        <div
          className="flex w-max shrink-0 animate-marquee items-center gap-6 sm:gap-10 group-hover:[animation-play-state:paused]"
          aria-hidden="true"
        >
          {items.map((i) => (
            <div key={`m2-${i}`} className="flex items-center gap-6 sm:gap-10 shrink-0">
              <span className="text-white text-xs sm:text-sm font-medium tracking-wide flex items-center gap-2">
                <span className="text-base sm:text-lg">🚀</span>
                <span>
                  <strong className="font-semibold text-cyan-300">Convergence 2K26 Events</strong>{" "}
                  Are{" "}
                  <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] sm:text-xs uppercase tracking-wider">
                    LIVE
                  </span>{" "}
                  Now — Check It Out!
                </span>
              </span>
              <span className="text-cyan-400/60 text-xs sm:text-sm">✦</span>
            </div>
          ))}
        </div>

        {/* Subtle edge fade overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0b242e] to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0b242e] to-transparent"></div>
      </div>
    </Link>
  );
};

export default ConvergenceMarquee;
