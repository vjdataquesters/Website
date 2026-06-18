import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import events from "../data/events";

const EventNotification = () => {
  const [activeEvents, setActiveEvents] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Find upcoming events that are strictly in the future, sorted by nearest
    const upcomingEvents = events.upcoming
      .filter((e) => e.countdownDate && new Date(e.countdownDate) - new Date() > 0)
      .sort((a, b) => new Date(a.countdownDate) - new Date(b.countdownDate));

    setActiveEvents(upcomingEvents);
  }, []);

  useEffect(() => {
    if (activeEvents.length > 0) {
      const interval = setInterval(() => {
        setActiveEvents((prev) => 
          prev.filter((e) => new Date(e.countdownDate) - new Date() > 0)
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeEvents.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (activeEvents.length === 0) return null;

  // Conditions for visibility
  const isHomePage = location.pathname === "/";
  const isEventsPage = location.pathname === "/events";
  
  const isEventsListScrolled = isEventsPage && isScrolled;

  const shouldShow = (isHomePage || isEventsPage) && !isEventsListScrolled;

  // We duplicate the events exactly once to make a seamless 50% loop
  const duplicatedEvents = [...activeEvents, ...activeEvents];

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 w-full z-[100] bg-[#0f323f]/75 backdrop-blur-sm py-1 border-b border-white/10 opacity-75 hover:opacity-100 transition-opacity duration-300 flex overflow-hidden"
        >
          <div className="animate-marquee w-max flex gap-[75vw] pr-[75vw]">
            {duplicatedEvents.map((event, idx) => (
              <Link to={event.link} key={idx} className="block group shrink-0 pl-4">
                <div className="flex items-center gap-6 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-white">
                    <CalendarClock size={20} />
                    <span className="font-semibold text-lg uppercase tracking-wider text-yellow-300">
                      {event.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-white font-light text-sm">Starting in:</span>
                    <div className="scale-75 origin-left">
                      <CountdownTimer targetDate={event.countdownDate} size="small" />
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-[#0f323f] bg-yellow-400 rounded-full py-1 px-4 ml-2 group-hover:bg-yellow-300 transition-colors shadow-sm">
                    Click for details
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventNotification;
