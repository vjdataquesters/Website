import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Award } from "lucide-react";

function parseDisplayName(title) {
  if (!title) return { name: "", detail: null };
  const match = title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { name: match[1].trim(), detail: match[2].trim() };
  }
  return { name: title, detail: null };
}

export function CategoryWinnerGrid({ winners }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {winners.map((winner, index) => {
        const { title, members, category, team, name } = winner;
        const displayTitle = title || team || name || "Winner";
        const { name: parsedName, detail } = parseDisplayName(displayTitle);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 relative overflow-hidden"
          >
            {/* Soft decorative glow */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-amber-500/5 blur-lg group-hover:bg-amber-500/10 transition-colors duration-300" />
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="rounded-full bg-gradient-to-r from-cyan-950/80 to-[#1a6b84]/30 border border-cyan-400/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 shadow-sm shadow-cyan-950/20">
                {category || "Award Winner"}
              </span>
            </div>
            <div className="relative z-10">
              <h4 className="font-[Poppins] text-[17px] font-extrabold text-white tracking-tight">
                {parsedName}
              </h4>
              {detail && (
                <p className="mt-1 text-xs font-semibold text-slate-400 font-[Inter]">{detail}</p>
              )}
            </div>
            {members && (
              <div className="mt-4 border-t border-white/10 pt-4 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-[Inter]">
                  Team Members
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300 font-[Inter] whitespace-pre-line">
                  {members}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function PodiumColumn({ winner, position }) {
  if (!winner) return null;
  const { title, members, team, name: winnerName } = winner;
  const displayTitle = title || team || winnerName || `Winner ${position}`;
  const { name: parsedName, detail } = parseDisplayName(displayTitle);

  const configs = {
    1: {
      height: "h-24 xs:h-32 sm:h-44",
      bg: "bg-gradient-to-t from-amber-500/25 via-amber-500/10 to-amber-500/5 border-amber-500/30 group-hover:border-amber-400/60 shadow-amber-500/5",
      badge: "bg-amber-400 text-amber-950 ring-amber-400/30",
      glow: "bg-amber-500/10 group-hover:bg-amber-500/25",
      icon: <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />,
      titleColor: "text-amber-400 font-extrabold",
      textColor: "text-white",
      rankLabel: "1st Place",
      delay: 0.1,
    },
    2: {
      height: "h-18 xs:h-26 sm:h-36",
      bg: "bg-gradient-to-t from-slate-400/20 via-slate-400/10 to-slate-400/5 border-slate-400/30 group-hover:border-slate-300/60 shadow-slate-400/5",
      badge: "bg-slate-400 text-slate-900 ring-slate-400/30",
      glow: "bg-slate-400/10 group-hover:bg-slate-400/20",
      icon: <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.4)]" />,
      titleColor: "text-slate-300 font-bold",
      textColor: "text-white",
      rankLabel: "2nd Place",
      delay: 0.05,
    },
    3: {
      height: "h-12 xs:h-20 sm:h-28",
      bg: "bg-gradient-to-t from-orange-500/20 via-orange-500/10 to-orange-500/5 border-orange-500/30 group-hover:border-orange-400/60 shadow-orange-500/5",
      badge: "bg-orange-500/80 text-orange-950 ring-orange-500/30",
      glow: "bg-orange-500/10 group-hover:bg-orange-500/20",
      icon: <Award className="h-5 w-5 sm:h-5 sm:w-5 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]" />,
      titleColor: "text-orange-400 font-bold",
      textColor: "text-white",
      rankLabel: "3rd Place",
      delay: 0.15,
    }
  };

  const config = configs[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: config.delay, type: "spring", stiffness: 80 }}
      className="group flex flex-col items-center justify-end flex-1 min-w-0 max-w-[160px] relative"
    >
      {/* Winner details ABOVE the pedestal */}
      <div className="mb-3.5 text-center px-1 z-10 w-full">
        <div className="flex justify-center mb-1">{config.icon}</div>
        <h4 className={`font-[Poppins] text-xs xs:text-sm sm:text-base leading-tight font-extrabold ${config.titleColor} truncate`}>
          {parsedName}
        </h4>
        {detail && (
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate mt-0.5">{detail}</p>
        )}
        {members && (
          <p className="mt-1 text-[9px] sm:text-[10px] text-slate-300 italic truncate hover:text-white cursor-help" title={members}>
            {members.replace(/\n/g, ", ")}
          </p>
        )}
      </div>

      {/* Pedestal block */}
      <div className={`w-full ${config.height} rounded-t-2xl border border-b-0 backdrop-blur-md shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center ${config.bg}`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 blur-xl transition-all duration-300 ${config.glow}`} />
        
        {/* Large Rank Number */}
        <span className="font-[Poppins] text-3xl xs:text-5xl sm:text-6xl font-black opacity-20 select-none relative z-10 text-white">
          {position}
        </span>
        
        {/* Small badge */}
        <span className={`absolute bottom-3 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm hidden sm:inline-block ${config.badge}`}>
          {config.rankLabel}
        </span>
      </div>
    </motion.div>
  );
}

export function WinnersLeaderboard({ winners }) {
  const sortedWinners = [...winners].sort((a, b) => (a.position || 99) - (b.position || 99));
  const hasDetails = sortedWinners.some((w) => w.members && w.members.trim().length > 0);

  const gold = sortedWinners.find((w) => w.position === 1);
  const silver = sortedWinners.find((w) => w.position === 2);
  const bronze = sortedWinners.find((w) => w.position === 3);
  const hasPodium = gold || silver || bronze;

  return (
    <div className="w-full space-y-6">
      {hasPodium && (
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl backdrop-blur-md overflow-hidden">
          {/* Spotlight beams over 1st place (Gold) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-[350px] bg-gradient-to-b from-amber-400/10 via-amber-400/[0.02] to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[250px] bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent blur-2xl pointer-events-none rounded-full" />

          {/* Ambient glow backgrounds */}
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-amber-500/5 blur-[80px]" />
          <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-cyan-500/5 blur-[80px]" />

          {/* Floating celebratory particles/stars inside background */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute left-[20%] top-[30%] h-1 w-1 bg-amber-400 rounded-full animate-ping" />
            <div className="absolute right-[25%] top-[20%] h-1 w-1 bg-cyan-400 rounded-full animate-pulse" />
            <div className="absolute left-[35%] bottom-[40%] h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute right-[40%] bottom-[30%] h-1 w-1 bg-purple-400 rounded-full animate-pulse" />
          </div>

          <div className="flex flex-row items-end justify-center gap-2 sm:gap-4 max-w-3xl mx-auto pt-6">
            {silver ? (
              <PodiumColumn winner={silver} position={2} />
            ) : (
              <div className="hidden sm:block flex-1" />
            )}

            {gold ? (
              <PodiumColumn winner={gold} position={1} />
            ) : (
              <div className="hidden sm:block flex-1" />
            )}

            {bronze ? (
              <PodiumColumn winner={bronze} position={3} />
            ) : (
              <div className="hidden sm:block flex-1" />
            )}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
        className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-[Inter]">
                <th className="px-6 py-4.5 w-24">Rank</th>
                <th className="px-6 py-4.5">Achiever</th>
                {hasDetails && <th className="px-6 py-4.5">Members / Details</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-[Inter]">
              {sortedWinners.map((winner, index) => {
                const { position, title, members, team, name: winnerName } = winner;
                const displayTitle = title || team || winnerName || `Winner ${position}`;
                const { name: parsedName, detail } = parseDisplayName(displayTitle);

                // Premium Podium badges
                const rankStyles = {
                  1: "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-transparent font-bold shadow-md shadow-amber-500/10",
                  2: "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 border-transparent font-bold shadow-md shadow-slate-400/10",
                  3: "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-transparent font-bold shadow-md shadow-orange-500/10",
                };
                const badgeClass = rankStyles[position] || "bg-slate-850 text-slate-400 border border-slate-700";

                return (
                  <tr key={index} className="group hover:bg-white/[0.02] transition-colors duration-200 border-b border-white/5 last:border-0">
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs leading-none shadow-sm transition-transform duration-300 group-hover:scale-105 ${badgeClass}`}>
                        {position}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div>
                        <p className="font-[Poppins] text-[15px] font-extrabold text-white tracking-tight">
                          {parsedName}
                        </p>
                        {detail && (
                          <p className="mt-0.5 text-xs font-semibold text-slate-400">{detail}</p>
                        )}
                        {/* Mobile view details fallback */}
                        {hasDetails && members && (
                          <p className="mt-2 text-xs text-slate-300 leading-relaxed whitespace-pre-line sm:hidden">
                            {members}
                          </p>
                        )}
                      </div>
                    </td>
                    {hasDetails && (
                      <td className="px-6 py-4.5 hidden sm:table-cell text-[13.5px] text-slate-300 whitespace-pre-line leading-relaxed">
                        {members}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default function WinnersSection({ winners, variant }) {
  if (variant === "category" || variant === "category-grid") {
    return <CategoryWinnerGrid winners={winners} />;
  }
  return <WinnersLeaderboard winners={winners} />;
}
