import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import events from "../../data/events.js";

export default function Event() {
  const { eventname } = useParams();

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
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center justify-between mb-6">
          <h2 className="font-semibold text-2xl sm:text-3xl">{event.name}</h2>
          <Link
            to="/events"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
        </div>

        <div>
          <p className="flex gap-2">
            <span className="font-semibold text-lg">Date:</span>
            <span>{event.date}</span>
          </p>
          <p className="flex gap-2">
            <span className="font-semibold text-lg">Venue:</span>
            <span>{event.venue}</span>
          </p>
          <p className="flex gap-2">
            <span className="font-semibold text-lg">Timings:</span>
            <span>{event.timings}</span>
          </p>
          <p className="space-x-2">
            <span className="font-semibold text-lg">Description:</span>
            <span>{event.description}</span>
          </p>
        </div>

        {event.pics?.length > 0 && (
          <div className="my-8 relative">
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              className="w-full max-w-4xl md:h-[32rem] mx-auto rounded-lg overflow-hidden py-8"
            >
              {event.pics.map((pic, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={pic}
                    alt={`${event.name} - Image ${index + 1}`}
                    className="w-full h-full"
                    draggable={false}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            {event.pics?.length > 1 && (
              <>
                <div className="swiper-button-next hidden md:flex text-gray-800 bg-transparent shadow-md hover:shadow-black transition-all duration-300 rounded-lg w-12 h-12 right-4"></div>
                <div className="swiper-button-prev hidden md:flex text-gray-800 bg-transparent shadow-md hover:shadow-black transition-all duration-300 rounded-lg w-12 h-12 left-4"></div>
              </>
            )}
          </div>
        )}

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
            <h3 className="font-semibold text-2xl"> Outcome:</h3>
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
              <div className="space-y-4">
                <a
                  href={event.register}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <h3 className="text-2xl text-blue-500 hover:text-blue-600 underline">
                    Register Now!
                  </h3>
                  <p className="text-sm text-gray-600 italic">
                    Fill out the form
                  </p>
                </a>
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
              <a
                href={event.register}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <h3 className="text-2xl text-blue-500 hover:text-blue-600 underline">
                  Register Now!
                </h3>
                <p className="text-sm text-gray-600 italic">
                  Click here to register
                </p>
              </a>
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
                          const response = await fetch(downloadUrl);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download =
                            downloadUrl.split("/").pop() || "download";
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
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
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
