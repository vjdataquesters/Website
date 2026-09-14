import { useRef } from "react";
import { motion } from "framer-motion";
import GlowBackground from "../components/GlowBackground";
import Carousel from "../components/Carousel";
import { Link } from "react-router-dom";
import { whatwedo } from "../data/whatwedo";
import { ArrowRight } from "lucide-react";
import { faculty } from "../data/team";
import Reveal from "../components/Reveal";
import {
  homeLogoRevealDelay,
  homeBoxRevealDelay,
  landingEntranceDuration,
} from "../config/animationConfig";
import "../clip-art.css";

const TeamCard = ({ person }) => {
  return (
    <Reveal>
      <a
        href={person.linkedin || null}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${person.name}'s LinkedIn profile`}
        className="block h-full"
      >
        <div className="p-6 w-full h-[350px] mx-auto flex flex-col justify-between items-center bg-[#EEEEEE] hover:scale-[103%] hover:shadow-lg transition-all duration-[300ms] rounded-xl cursor-pointer">
          <img
            className="w-[180px] h-[180px] object-cover rounded-full shadow-md shrink-0"
            style={person.objectPosition ? { objectPosition: person.objectPosition } : undefined}
            src={
              person.image
                ? `/teamImages/${person.image}`
                : "https://picsum.photos/200"
            }
            alt={person.name + " image"}
          />
          <div className="flex flex-col items-center justify-center flex-grow mt-3">
            <p className="text-center text-black text-lg font-semibold tracking-wide leading-snug">
              {person.name}
            </p>
            <p className="text-center text-sm text-gray-600 font-light mt-1">
              {person.role}
            </p>
          </div>
        </div>
      </a>
    </Reveal>
  );
};

export default function Home() {
  const topTeam = faculty || [];
  const isInitialRef = useRef(
    typeof window !== "undefined" && window.isInitialLoad,
  );
  const isInitial = isInitialRef.current;

  return (
    <div>
      {/* Landing section */}
      <div className="h-screen w-full relative">
        <div className="z-10 w-full absolute h-full flex flex-row justify-evenly items-center">
          <motion.div
            className="hidden lg:block"
            initial={
              isInitial
                ? { opacity: 0, y: -18, scale: 0.96 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: landingEntranceDuration,
              delay: isInitial ? homeLogoRevealDelay : 0,
              ease: "easeOut",
            }}
          >
            <img
              src="/logo.png"
              alt="Data Questers logo"
              className="max-w-sm"
              draggable={false}
            />
          </motion.div>

          <motion.div
            initial={
              isInitial
                ? { opacity: 0, y: -18, scale: 0.96 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: landingEntranceDuration,
              delay: isInitial ? homeBoxRevealDelay : 0,
              ease: "easeOut",
            }}
            className="box max-w-[90%] sm:w-auto flex flex-col justify-center items-center opacity-80 select-none text-white"
          >
            <h1 className="font-semibold text-center text-3xl sm:text-5xl my-3 md:my-6">
              VJ DATA QUESTERS
            </h1>
            <p className="text-base text-center sm:text-xl">
              VNRVJIET, Hyderabad
            </p>
            <p className="mt-1 text-xs font-thin sm:text-sm text-center">
              Differentiated by inputs / Integrated by outputs
            </p>
          </motion.div>
        </div>
        <GlowBackground />
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.png')]"></div>
      </div>

      {/* About section */}
      <div className="clip-art-1">
        <div className="z-10 text-justify sm:text-left max-w-5xl mx-auto">
          <div className="lg:hidden">
            <img src="/logo.png" className="max-w-64 mx-auto" />
          </div>
          <div className="px-2 pb-20 lg:pt-4">
            <h2 className="text-white pb-3 text-center text-3xl font-semibold flex flex-row items-start justify-center">
              About VJDQ
            </h2>
            <p className="text-white text-base leading-5 sm:text-lg ">
              Welcome to our Data Science Club, the premier hub for data science
              enthusiasts at our college. Established with the vision of driving
              innovation and collaboration, our club serves as the central point
              for all data science-related activities on campus. We provide
              comprehensive guidance on projects, offer certifications for both
              students and faculty, and keep our members informed about the
              latest industry trends and real-world applications of data
              science.
            </p>

            <Link to="/about">
              <button className="rounded-sm w-32 h-10 bg-white text-black border-none hover:bg-white/65  mt-8 group-hover:scale-105 transition-all duration-[300ms] ease-in-out">
                Know More
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* what we do section*/}
      <div className="w-full max-w-3xl mx-auto my-6 text-center">
        <h2 className="text-3xl font-semibold">What we do?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8 mx-auto px-2 sm:px-0">
          {whatwedo.map((d, index) => (
            <Reveal key={index}>
              <Link to={d?.example} key={index} className="flex justify-center">
                <div className="w-40 h-16 sm:w-60 sm:h-20 px-2 sm:p-4 flex items-center justify-evenly border border-black/50 rounded-lg  bg-white shadow-2xl hover:scale-105 transition-all duration-[300ms] ease-in-out">
                  <img
                    src={`/${d.imgURL}`}
                    alt="What we do Image"
                    className="w-[15%] sm:w-[20%] object-contain"
                    draggable={false}
                  />

                  <h3 className="text-sm sm:text-base lg:text-lg text-black font-semibold flex-1 text-left ml-3">
                    {d.title}
                  </h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="flex justify-center">
          <Reveal key={1}>
            <Link
              to="/events"
              className="px-6 py-3 font-[300] text-base text-white rounded-lg bg-[#0f323fee] hover:bg-[#135168] transition-all duration-[300ms] ease-in-out flex items-center gap-x-2 group"
            >
              <span className="group-hover:scale-105 transition-all duration-[300ms] ease-in-out">
                View All Activity
              </span>
              <ArrowRight
                size={20}
                className="text-white transform group-hover:translate-x-1 transition-transform duration-[500ms]"
              />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Glimpses section */}
      <div className="clip-art-combined pt-16 pb-20">
        <section className="max-w-7xl md:max-w-[90%] h-full mx-auto">
          <div className="w-full">
            <h2 className="text-center text-3xl font-semibold text-white">
              Glimpses
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-6xl mx-auto">
                <Reveal>
                  <Carousel />
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Our Team section */}
      <section className="max-w-7xl md:max-w-[90%] h-full py-6 px-4 mx-auto">
        <div className="w-full">
          <h1 className="text-center text-3xl font-semibold text-black mb-8">
            Our Coordinators
          </h1>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 items-stretch justify-items-center w-full">
              {topTeam &&
                topTeam.map((person, index) => (
                  <div key={index} className="w-full max-w-[280px]">
                    <TeamCard person={person} />
                  </div>
                ))}
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <Reveal key={1}>
              <Link
                to="/team"
                className="px-6 py-3 font-[300] text-base text-[#fff] rounded-lg bg-[#135168]  hover:bg-[#1a6785] transition-all duration-[300ms] ease-in-out flex items-center gap-x-2 group"
              >
                <span className="group-hover:scale-105 transition-all duration-[300ms] ease-in-out">
                  View Full Team
                </span>
                <ArrowRight
                  size={20}
                  className="text-white transform group-hover:translate-x-1 transition-transform duration-[500ms]"
                />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
