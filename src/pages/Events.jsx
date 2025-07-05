import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../clip-art.css";

import events from "../data/events.js";
import Reveal from "../components/Reveal.jsx";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const colors = [
    "bg-gray-900",
    "bg-indigo-600",
    "bg-blue-800",
    "bg-emerald-600",
    "bg-violet-700",
    "bg-sky-600",
    "bg-slate-700",
    "bg-teal-600",
    "bg-purple-600",
    "bg-cyan-600",
    "bg-rose-600",
    "bg-green-700",
    "bg-amber-600",
    "bg-pink-600",
    "bg-orange-600",
    "bg-lime-600",
  ];
  return (
    <div
      className="max-w-[400px] rounded-lg h-full shadow-2xl bg-gray-100 hover:shadow-[0px_25px_50px_-12px] transition-all duration-500 hover:backdrop-blur-sm hover:bg-gray-200 cursor-pointer"
      onClick={() => {
        if (event.link.startsWith("http")) {
          window.open(event.link, "_blank"); // or use window.location.href
        } else {
          navigate(event.link); // for internal routes
        }
      }}
    >
      <img
        src={event.image}
        style={{ maxWidth: "100%" }}
        alt={event.name}
        draggable={false}
        className="w-full rounded-t-lg h-64"
      />

      <div className="p-1 md:p-2 pt-0">
        <div className="w-full flex flex-row gap-2 my-2 overflow-x-auto small-scrollbar-y">
          {event.event_tags.map((obj, index) => (
            <div
              key={index}
              className={`inline-block  ${
                obj === "Limited Registrations"
                  ? "bg-red-800"
                  : colors[Math.floor(Math.random() * colors.length)]
              }  text-white text-sm rounded-xl text-nowrap text-center content-center py-[2px] px-2 mb-2`}
            >
              <p className="text-sm">{obj}</p>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-semibold mb-2 ">{event.name}</h2>
        <p className="text-gray-700 font-light">{event.date}</p>
        <p className="text-lg mt-2">{event.description}</p>
      </div>
    </div>
  );
};

export default function Events() {
  const recentYear = Object.keys(events.past)[0];
  const [pastevents, setPastevents] = useState(events.past[recentYear]);
  const [year, setyear] = useState(recentYear.slice(1));

  const handleYearChange = (e) => {
    setPastevents(events.past[e]);
    setyear(e.slice(1));
  };

  return (
    <>
      {/*Event highlights*/}
      <section className="clip-art-1 bg-gradient-to-b from-[#0f323f] via-[#0f323f] to-[#0f323f]/85 min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="w-full pt-10 md:pt-0 md:w-2/3 pb-5">
          <h1 className="text-4xl sm:text-5xl pb-4 sm:pb-4 md:text-6xl md:pb-3 font-bold text-white">
            Discover Amazing Events we Organized
          </h1>
          <p className="text-sm text-white sm:block sm:text-lg md:pb-none pr-3">
            Explore the diverse range of events we've hosted, designed to
            inspire, educate, and bring our community together
          </p>
        </div>
      </section>
      {/* Display by year */}
      <div className="max-w-5xl md:max-w-[90%] h-full mb-20 my-4 mx-auto px-4">
        <div className="w-full">
          <div className="pt-6">
            {/* Upcoming events */}
            {events.upcoming.length !== 0 && (
              <>
                <h2 className="text-4xl text-center font-bold mb-7 ">
                  Upcoming Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {events.upcoming.map((event, index) => (
                    <Reveal key={index}>
                      <EventCard event={event} />
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col flex-wrap gap-5">
            <h2 className="text-4xl text-center font-bold">Past Events</h2>
            <div className="text-center flex flex-row justify-around sm:gap-7 sm:justify-center">
              {Object.keys(events.past).map((eventyear) => (
                <button
                  key={eventyear}
                  className={`text-center w-24 h-9 font-bold text-lg border-2 border-black text-black shadow-[5px_5px_5px_0px] hover:shadow-none  transition-all rounded-md  ${
                    year.toString() === eventyear.slice(1)
                      ? "bg-[#0f323f] text-white"
                      : "bg-white"
                  } `}
                  onClick={() => handleYearChange(eventyear)}
                >
                  {eventyear.slice(1)}
                </button>
              ))}
            </div>
            {Object.keys(pastevents).length === 0 ? (
              <p>No events in year {year}</p>
            ) : (
              <>
                {/* Past events */}
                <h2 className="text-2xl">Events of year {year}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {pastevents.map((event, index) => (
                    <Reveal key={index}>
                      <EventCard event={event} />
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* category section */}
      {/* <div className="max-w-5xl md:max-w-[90%] h-full mb-20 my-4 mx-auto px-4 border border-black">
        <h1></h1>
      </div> */}
    </>
  );
}
