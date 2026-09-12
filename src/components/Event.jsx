import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Users,
  Trophy,
  AlertCircle,
  Phone,
  FileText,
  ExternalLink,
  Map,
  SquareArrowUpRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import events from "../data/events.js";
import EventSessionQuery from "./EventSessionQuery";
import EventSubmissions from "./EventSubmissions";

export default function Event() {
  const navigate = useNavigate();
  const { eventname } = useParams();

  function handleRegister(url) {
    if (!url) return;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      navigate(url.startsWith("/") ? url : `../../${url}`);
    }
  }

  const findEvent = () => {
    let event = events.upcoming.find((e) => e.eventId === eventname);
    if (!event) {
      for (const yearEvents of Object.values(events.past)) {
        const found = yearEvents.find((e) => e.eventId === eventname);
        if (found) return found;
      }
    }
    return event;
  };

  const event = findEvent();

  if (!event) {
    return (
      <div className="pt-20 text-center">
        <h2 className="text-2xl font-semibold">Event not found</h2>
        <Link
          to="/events"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Return to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900">
              {event.name}
            </h2>
            {event.event_tags && event.event_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {event.event_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-[#0f323f] text-white text-xs sm:text-sm font-medium px-3 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/events"
            className="p-2 hover:bg-gray-200/80 rounded-full transition-colors self-start mt-1"
            title="Back to Events"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 bg-white/70 backdrop-blur-sm shadow-sm space-y-4 flex flex-col pb-6 border border-gray-100">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-4 rounded-xl bg-[#dadce176]">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="font-semibold text-gray-900 text-base">{event.date}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#dadce176]">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                Time
              </p>
              <p className="font-semibold text-gray-900 text-base">{event.timings}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#dadce176]">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                Venue
              </p>
              <p className="font-semibold text-gray-900 text-base">{event.venue}</p>
            </div>
          </div>

          {(event.teamSize || event.prizePool) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {event.teamSize && (
                <div className="p-4 rounded-xl bg-[#dadce176] flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#0f323f] text-white shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                      Team Size
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {event.teamSize}
                    </p>
                  </div>
                </div>
              )}
              {event.prizePool && (
                <div className="p-4 rounded-xl bg-[#dadce176] flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#0f323f] text-white shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                      Prize Pool
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {event.prizePool}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {event.passNotice && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm font-medium">
              <AlertCircle size={18} className="text-amber-700 shrink-0" />
              <span>{event.passNotice}</span>
            </div>
          )}

          <div className="pt-2">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              About the Event
            </h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {event.description}
            </p>
          </div>

          {(event.facultyCoordinators?.length > 0 ||
            event.studentCoordinators?.length > 0) && (
            <div className="pt-3 border-t border-gray-200/60">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Event Coordinators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.facultyCoordinators?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#dadce176]">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      Faculty Coordinators
                    </h4>
                    <div className="space-y-1.5">
                      {event.facultyCoordinators.map((coordinator, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm text-gray-700"
                        >
                          <span className="font-medium">{coordinator.name}</span>
                          {coordinator.phone && (
                            <a
                              href={`tel:${coordinator.phone}`}
                              className="inline-flex items-center gap-1 text-[#0f323f] hover:underline font-mono text-xs sm:text-sm"
                            >
                              <Phone size={13} /> {coordinator.phone}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {event.studentCoordinators?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#dadce176]">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      Student Coordinators
                    </h4>
                    <div className="space-y-1.5">
                      {event.studentCoordinators.map((coordinator, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm text-gray-700"
                        >
                          <span className="font-medium">{coordinator.name}</span>
                          {coordinator.phone && (
                            <a
                              href={`tel:${coordinator.phone}`}
                              className="inline-flex items-center gap-1 text-[#0f323f] hover:underline font-mono text-xs sm:text-sm"
                            >
                              <Phone size={13} /> {coordinator.phone}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {event.register && !event.isGFormEmbeddable && (
            <div className="pt-2">
              <button
                onClick={() => handleRegister(event.register)}
                className="inline-flex items-center justify-center gap-2 text-white bg-[#0f323fee] hover:bg-[#135168] px-6 py-3 rounded-lg text-center font-semibold text-base shadow-md transition-all duration-200"
              >
                Register Now
                <SquareArrowUpRight size={18} />
              </button>
            </div>
          )}
        </div>

        {event.pics?.length > 0 && (
          <div className="my-8 relative">
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              loop={event.pics.length > 1}
              autoplay={
                event.pics.length > 1
                  ? {
                      delay: 2500,
                      disableOnInteraction: false,
                    }
                  : false
              }
              navigation={{
                nextEl: ".event-swiper-button-next",
                prevEl: ".event-swiper-button-prev",
              }}
              className="event-swiper w-full max-w-3xl mx-auto rounded-xl overflow-hidden py-4 flex justify-center shadow-lg bg-white/40"
            >
              {event.pics.map((pic, index) => (
                <SwiperSlide key={index} className="flex justify-center items-center">
                  <img
                    src={pic}
                    alt={`${event.name} - Image ${index + 1}`}
                    className="max-h-[38rem] w-auto mx-auto rounded-lg object-contain shadow-md"
                    draggable={false}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            {event.pics?.length > 1 && (
              <>
                <div className="event-swiper-button-next swiper-button-next hidden md:flex text-black bg-white shadow-md hover:shadow-black transition-all duration-300 rounded-full right-4"></div>
                <div className="event-swiper-button-prev swiper-button-prev hidden md:flex text-black bg-white shadow-md hover:shadow-black transition-all duration-300 rounded-full left-4"></div>
              </>
            )}
          </div>
        )}

        {event.speakers && event.speakers.length > 0 && (
          <div className="my-8">
            <h3 className="font-semibold text-2xl mb-4">Speakers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {event.speakers.map((speaker, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-[#dadce176] text-center flex flex-col justify-center items-center shadow-sm"
                >
                  <p className="font-semibold text-lg text-gray-900">
                    {speaker.name}
                  </p>
                  {speaker.id && (
                    <p className="text-xs text-gray-600 font-mono mt-1">
                      {speaker.id}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {event.resources && event.resources.length > 0 && (
          <div className="my-8">
            <h3 className="font-semibold text-2xl mb-4">Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.resources.map((resource, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-[#dadce176] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {resource.type === "pdf" ? (
                        <div className="p-2 rounded-lg bg-red-100 text-red-700">
                          <FileText size={22} />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-teal-100 text-[#0f323f]">
                          <Map size={22} />
                        </div>
                      )}
                      <h4 className="text-lg font-semibold text-gray-900">
                        {resource.title}
                      </h4>
                    </div>
                    {resource.description && (
                      <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                        {resource.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0f323f] text-white px-4 py-2 rounded-lg hover:bg-[#135168] transition-colors text-sm font-medium"
                    >
                      {resource.type === "pdf" ? (
                        <FileText size={16} />
                      ) : (
                        <ExternalLink size={16} />
                      )}
                      {resource.buttonText ||
                        (resource.type === "pdf" ? "Open PDF" : "View Roadmap")}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.sessionQuery && <EventSessionQuery eventname={eventname} />}

        {event.sessionSubmissions && <EventSubmissions />}

        {event.winners && (
          <div className="my-10">
            <h3 className="font-semibold text-2xl">Winners:</h3>
            <p
              className="text-base sm:text-lg overflow-x-scroll sm:overflow-x-hidden"
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: event.winners }}
            ></p>
          </div>
        )}

        {event.outcome && (
          <div className="my-10">
            <h3 className="font-semibold text-2xl">Outcome:</h3>
            <p
              className="text-base sm:text-lg "
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: event.outcome }}
            ></p>
          </div>
        )}

        {event.register && (
          <div className="my-8 text-center">
            {event?.isGFormEmbeddable ? (
              <div className="space-y-4" id="embedded-form">
                <h3 className="text-3xl font-semibold">
                  Fill out the form
                  <span>
                    <a href={event.register} target="_blank" rel="noopener noreferrer">
                      <SquareArrowUpRight className="inline-block mx-3" />
                    </a>
                  </span>
                </h3>
                <div className="flex justify-end"></div>
                <div className="relative w-full pt-[150%]">
                  <iframe
                    src={event.register}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    title="Registration Form"
                  />
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        )}

        {event.externalDownloads && (
          <div className="my-8">
            <h3 className="font-semibold text-2xl mb-6">Workshop Material</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(event.externalDownloads).map(
                ([title, downloadUrl], index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-lg mb-3">{title}</h4>
                    <button
                      onClick={async () => {
                        try {
                          let url = downloadUrl;
                          const isZip =
                            downloadUrl.slice(-3).toLowerCase() === "zip";
                          if (!isZip) {
                            const response = await fetch(downloadUrl);
                            const blob = await response.blob();
                            url = window.URL.createObjectURL(blob);
                          }
                          const a = document.createElement("a");
                          a.href = url;
                          a.download =
                            downloadUrl.split("/").pop() || "download";
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);

                          if (!isZip) window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Download failed:", error);
                          alert("Failed to download. Please try again.");
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-[#0f323f] text-white px-4 py-2 rounded-md hover:bg-[#174454] transition-colors"
                    >
                      <Download size={16} />
                      Download Now
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
