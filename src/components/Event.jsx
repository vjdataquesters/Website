import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SquareArrowUpRight,
  Brain,
  ChartBar,
  Cloud,
  Code2,
  Layers,
  Mic2,
  Sparkles,
  Star,
  Trophy,
  Wrench
} from "lucide-react";
import events from "../data/events.js";
import EventSessionQuery from "./EventSessionQuery";
import EventSubmissions from "./EventSubmissions";
import EventHero, { EventBackButton } from "./event/EventHero";
import EventNav from "./event/EventNav";
import EventPageDecor from "./event/EventPageDecor";
import SpeakerCard from "./event/SpeakerCard";
import TimelineSection from "./event/TimelineSection";
import GallerySection from "./event/GallerySection";
import OutcomeCard from "./event/OutcomeCard";
import WinnerCard from "./event/WinnerCard";
import ResourceCard from "./event/ResourceCard";
import StatsCard from "./event/StatsCard";
import {
  buildNavSections,
  deriveStats,
  extractParticipantCount,
  getCoverImage,
  getEventType,
  getHighlights,
  getOutcomes,
  getRegistrationStatus,
  getResourceItems,
  getWinnerDisplayMode,
  getWinnerRankings,
} from "../utils/eventData";

const iconMap = {
  code: Code2,
  wrench: Wrench,
  mic: Mic2,
  chart: ChartBar,
  cloud: Cloud,
  sparkles: Sparkles,
  trophy: Trophy,
  brain: Brain,
  layers: Layers,
  star: Star,
};

function SectionDivider() {
  return (
    <div className="relative h-10 my-24 flex justify-center">
      {/* Central vertical glowing line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#0f323f]/20 to-transparent" />
    </div>
  );
}

async function handleResourceDownload(downloadUrl, title) {
  try {
    let url = downloadUrl;
    const isZip = downloadUrl.slice(-3).toLowerCase() === "zip";
    if (!isZip) {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      url = window.URL.createObjectURL(blob);
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadUrl.split("/").pop() || title || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!isZip) window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download. Please try again.");
  }
}

export default function Event() {
  const { eventname } = useParams();
  const navigate = useNavigate();

  const findEvent = () => {
    let found = events.upcoming.find((e) => e.eventId === eventname);
    if (!found) {
      for (const yearEvents of Object.values(events.past)) {
        const match = yearEvents.find((e) => e.eventId === eventname);
        if (match) return match;
      }
    }
    return found;
  };

  const event = findEvent();
  const isUpcoming = events.upcoming.some((e) => e.eventId === eventname);

  if (!event) {
    return (
      <div className="event-page flex min-h-[60vh] flex-col items-center justify-center px-4 pt-20">
        <h2 className="font-[Poppins] text-2xl font-semibold text-[#0f323f]">
          Event not found
        </h2>
        <Link
          to="/events"
          className="mt-4 text-[#1a6b84] hover:underline"
        >
          Return to Events
        </Link>
      </div>
    );
  }

  const coverImage = getCoverImage(event);
  const eventType = getEventType(event);
  const registrationStatus = getRegistrationStatus(event, isUpcoming);
  const participantCount = extractParticipantCount(event);
  const highlights = getHighlights(event);
  const { items: outcomeItems, layout: outcomesLayout } = getOutcomes(event);
  const winners = getWinnerRankings(event);
  const winnerDisplayMode = getWinnerDisplayMode(winners);
  const resources = getResourceItems(event);
  const stats = deriveStats(event);

  const derived = {
    highlights,
    outcomes: outcomeItems,
    winners,
    resources,
    stats,
  };
  const navSections = buildNavSections(event, derived);

  const handleRegister = (url) => {
    navigate(`../../${url}`);
  };

  return (
    <div className="event-page relative min-h-screen font-[Inter] text-slate-200 bg-[#0a2530]">
      <EventPageDecor />

      {/* Hero Section */}
      <EventHero
        event={event}
        coverImage={coverImage}
        eventType={eventType}
        registrationStatus={registrationStatus}
        participantCount={participantCount}
        onRegister={handleRegister}
      />

      <EventNav sections={navSections} />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        
        {/* Story Flow 1: What Was This Event? / About */}
        <section id="about" className="scroll-mt-28">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                
                <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
                  About the Event
                </h2>
              </div>
              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg whitespace-pre-line">
                {event.description}
              </p>

              {event.register && registrationStatus === "open" && !event.isGFormEmbeddable && (
                <button
                  type="button"
                  onClick={() => handleRegister(event.register)}
                  className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 px-6 py-3 font-[Poppins] text-sm font-bold text-[#0a2530] shadow-lg transition-all active:scale-[0.98]"
                >
                  Register Now
                </button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8"
            >
              {/* Key Event Information Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/5 blur-xl" />
                <h3 className="font-[Poppins] text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Key Details
                </h3>
                <div className="space-y-4 text-sm font-[Inter]">
                  {event.date && (
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Date</span>
                      <span className="font-semibold text-white">{event.date}</span>
                    </div>
                  )}
                  {event.timings && (
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Time / Duration</span>
                      <span className="font-semibold text-white">{event.timings}</span>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Venue</span>
                      <span className="font-semibold text-white text-right max-w-[200px] truncate" title={event.venue}>
                        {event.venue}
                      </span>
                    </div>
                  )}
                  {participantCount && (
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Expected Attendance</span>
                      <span className="font-semibold text-white">{participantCount}+ attendees</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 font-medium">Registration Status</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      registrationStatus === "open" ? "bg-emerald-500/10 text-emerald-400 animate-pulse border border-emerald-500/20" :
                      registrationStatus === "upcoming" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-slate-500/10 text-slate-400 border border-slate-750"
                    }`}>
                      {registrationStatus}
                    </span>
                  </div>
                </div>
              </div>

              {event.speakers?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-[Poppins] text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Speakers & Organizers
                  </h3>
                  <div className="space-y-3">
                    {event.speakers.map((speaker, i) => (
                      <SpeakerCard key={speaker.name || i} speaker={speaker} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {event.sessionQuery && (
          <div className="mt-10">
            <EventSessionQuery eventname={eventname} />
          </div>
        )}

        {event.sessionSubmissions && (
          <div className="mt-10">
            <EventSubmissions />
          </div>
        )}

        {/* Story Flow 2: Key Moments (Highlights alternating layout) */}
        {highlights.length > 0 && (
          <>
            <SectionDivider />
            <section id="highlights" className="scroll-mt-28 relative">
              <div className="mb-16 text-center">
                
                <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
                  Event Highlights
                </h2>
                <p className="mt-2 text-base text-slate-400 max-w-md mx-auto">
                  Key themes, technologies, and core experiences curated for this event.
                </p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                {/* Central vertical glowing line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/50 via-emerald-500/30 to-transparent hidden md:block" />

                <div className="space-y-12 md:space-y-20">
                  {highlights.map((highlight, i) => {
                    const isEven = i % 2 === 0;
                    const Icon = iconMap[highlight.icon] || Star;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 relative ${
                          isEven ? "" : "md:flex-row-reverse"
                        }`}
                      >
                        {/* Timeline node */}
                        <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/30 bg-[#0a2530] shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                          <Icon size={16} className="text-cyan-400" />
                        </div>

                        {/* Content Block */}
                        <div className={`flex-1 w-full text-center ${isEven ? "md:text-right" : "md:text-left"}`}>
                          <div className="inline-block relative">
                            <span className="font-[Poppins] text-5xl sm:text-6xl font-black text-white/[0.03] block mb-2 select-none">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className={`flex items-center gap-3 justify-center ${
                              isEven ? "md:justify-end" : "md:justify-start"
                            }`}>
                              <span className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                <Icon size={14} />
                              </span>
                              <h4 className="font-[Poppins] text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                {highlight.title}
                              </h4>
                            </div>
                            <p className={`mt-3 text-sm leading-relaxed text-slate-300 font-[Inter] max-w-md mx-auto ${isEven ? "md:ml-auto md:mr-0" : "md:mr-auto md:ml-0"}`}>
                              {highlight.description ||
                                `A major track of ${event.name}, exploring state-of-the-art tools and practical technical implementations.`}
                            </p>
                          </div>
                        </div>

                        {/* Visual spacing blocker */}
                        <div className="flex-1 hidden md:block" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Story Flow 3: Gallery (Immersive Masonry Centerpiece) */}
        {event.pics?.length > 0 && (
          <>
            <SectionDivider />
            <GallerySection pics={event.pics} eventName={event.name} />
          </>
        )}

        {/* Story Flow 4: Participant Experience (Timeline/Schedule) */}
        {event.timeline?.length > 0 && (
          <>
            <SectionDivider />
            <TimelineSection timeline={event.timeline} />
          </>
        )}

        {/* Story Flow 5: Achievements (Outcomes) */}
        {outcomeItems.length > 0 && (
          <>
            <SectionDivider />
            <section id="outcomes" className="scroll-mt-28">
              <div className="mb-10 text-center">
                
                <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
                  What You'll Gain
                </h2>
                <p className="mt-2 text-base text-slate-400 max-w-md mx-auto">
                  Key outcomes, knowledge assets, and professional growth opportunities.
                </p>
              </div>

              {outcomesLayout === "prose" ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md sm:p-8"
                >
                  <p className="text-base leading-relaxed text-slate-300 sm:text-lg whitespace-pre-line">
                    {outcomeItems[0].description}
                  </p>
                </motion.div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {outcomeItems.map((outcome, i) => (
                    <OutcomeCard key={outcome.title || i} outcome={outcome} index={i} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Story Flow 6: Winners (3D Podium Section) */}
        {winners.length > 0 && (
          <>
            <SectionDivider />
            <section id="winners" className="scroll-mt-28">
              <div className="mb-10 text-center">
                
                <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
                  {winnerDisplayMode === "category-grid"
                    ? "Category Winners"
                    : "Competition Results"}
                </h2>
                <p className="mt-2 text-base text-slate-400 max-w-md mx-auto">
                  {winnerDisplayMode === "category-grid"
                    ? "Celebrating the top-performing teams across each competition track."
                    : "Honoring outstanding achievement, innovation, and technical excellence."}
                </p>
              </div>

              <WinnerCard winners={winners} variant={winnerDisplayMode} />
            </section>
          </>
        )}

        {/* Story Flow 7: Impact (Stats Dashboard) */}
        {stats.length > 0 && (
          <>
            <SectionDivider />
            <section id="stats" className="scroll-mt-28">
              <div className="mb-10 text-center">
                <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
                  Scale & Impact
                </h2>
                <p className="mt-2 text-base text-slate-400 max-w-md mx-auto">
                  A numerical look at the reach, participation, and key milestones.
                </p>
              </div>
              
              {/* Premium Glassmorphic Stats Panel */}
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden max-w-5xl mx-auto">
                <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-[90px]" />
                <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 relative z-10">
                  {stats.map((stat, i) => (
                    <StatsCard key={stat.label || i} stat={stat} index={i} />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Story Flow 8: Resources (Downloads Section) */}
        {resources.length > 0 && (
          <>
            <SectionDivider />
            <section id="resources" className="scroll-mt-28">
              <div className="mb-10 text-center">
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 border border-indigo-400/20">
                  Downloads
                </span>
                <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
                  Event Resources
                </h2>
                <p className="mt-2 text-base text-slate-400 max-w-md mx-auto">
                  Access workshop templates, code repositories, guides, and presentations.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource, i) => (
                  <ResourceCard
                    key={resource.title || i}
                    resource={resource}
                    index={i}
                    onDownload={handleResourceDownload}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Embedded registration form */}
        {event.register && event.isGFormEmbeddable && (
          <>
            <SectionDivider />
            <section id="register" className="scroll-mt-28">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md sm:p-8">
                <h3 className="font-[Poppins] text-2xl font-semibold text-white">
                  Fill out the form
                  <a href={event.register} target="_blank" rel="noopener noreferrer">
                    <SquareArrowUpRight className="ml-2 inline-block text-cyan-400 animate-pulse" size={22} />
                  </a>
                </h3>
                <div className="relative mt-6 w-full pt-[150%]">
                  <iframe
                    src={event.register}
                    className="absolute top-0 left-0 h-full w-full rounded-xl border-0"
                    allowFullScreen
                    loading="lazy"
                    title="Registration Form"
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
