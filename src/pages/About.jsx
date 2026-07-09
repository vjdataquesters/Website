import Reveal from "../components/Reveal";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function About() {
  const location = useLocation();
  const counter = {
    mem: 600,
    events: 20,
    core: 80,
    alumni: 100,
  };

  const boxVariants = {
    initial: {
      scale: 1,
    },
    hover: {
      scale: 1.025,
      boxShadow: "0px 48px 100px 0px #110c2e26",
    },
  };

  useEffect(() => {
    if (location.hash) {
      let element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="mx-auto mt-[4.5rem] scroll-smooth">

      {/* Counting Component */}
      <div className="min-h-[calc(100vh-4.5rem)] py-4 sm:py-16 flex flex-col justify-start gap-8 lg:justify-between">
        <div className="mx-auto ">
          <h1 className="text-center text-4xl lg:text-8xl font-extrabold ">
            The hub for Data Science Enthusiasts
          </h1>
          <p className="text-center text-black text-md sm:text-xl">
            Driving innovation and collaboration through projects, hackathons
            certifications, and industry insights.
          </p>
        </div>

        <div className="w-11/12 lg:w-9/12 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-16 bg-[#0f323f] mx-auto p-8 rounded-2xl">
          <div className="text-center">
            <CountUp
              className="text-white text-5xl sm:text-7xl font-semibold"
              end={counter.mem}
              duration={9}
              suffix="+"
            />
            <p className="text-white sm:text-xl"> Members</p>
          </div>
          <div className="text-center">
            <CountUp
              className="text-white text-5xl sm:text-7xl font-semibold"
              end={counter.events}
              duration={9}
              suffix="+"
            />
            <p className="text-white sm:text-xl"> Events</p>
          </div>
          <div className="text-center">
            <CountUp
              className="text-white text-5xl sm:text-7xl font-semibold"
              end={counter.core}
              duration={9}
              suffix="+"
            />
            <p className="text-white sm:text-xl"> Core members</p>
          </div>
          <div className="text-center">
            <CountUp
              className="text-white text-5xl sm:text-7xl font-semibold"
              end={counter.alumni}
              duration={9}
              suffix="+"
            />
            <p className="text-white sm:text-xl"> Alumni</p>
          </div>
        </div>

        <motion.div
          className="m-auto my-4 flex gap-4 items-center px-6 py-4 border-black/10 border-2 rounded-lg"
          variants={boxVariants}
          initial="initial"
          whileHover="hover"
          whileTap="hover"
        >
          <p className="text-black">Follow us on</p>
          <div className="flex flex-row gap-4 justify-evenly items-center">
            <a
              href="https://www.linkedin.com/company/vj-data-questers/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://img.icons8.com/?size=100&id=xuvGCOXi8Wyg&format=png&color=000000"
                className="w-10"
                alt=""
              />
            </a>
            <a
              href="https://www.instagram.com/vjdataquesters.club/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000"
                className="w-10"
                alt=""
              />
            </a>
            <a
              href="mailto:vjdataquesters@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://img.icons8.com/?size=100&id=P7UIlhbpWzZm&format=png&color=000000"
                className="w-10"
                alt=""
              />
            </a>
          </div>
        </motion.div>
      </div>

      {/* About us */}
      <div className="flex items-center flex-col pt-2 px-2">
        <div
          className="max-w-7xl px-4 py-4 mb-4 border border-white/40  rounded-2xl bg-[#0e303d]"
        >
          <h2 className="text-white text-3xl underline decoration-2 underline-offset-2">
            About us
          </h2>
          <p className="text-base sm:text-lg text-white whitespace-pre-wrap lg:text-justify">
            Welcome to our Data Science Club, the premier hub for data science
            enthusiasts at our college. Established with the vision of driving
            innovation and collaboration, our club serves as the central point
            for all data science-related activities on campus. We provide
            comprehensive guidance on projects, offer certifications for both
            students and faculty, and keep our members informed about the
            latest industry trends and real-world applications of data
            science.
          </p>
          <p className="text-base sm:text-lg text-white whitespace-pre-wrap mt-1 lg:text-justify">
            {"\t \t"}
            Our club hosts a variety of events, including expert-led guest
            lectures, hands-on workshops, and collaborative projects, ensuring
            a dynamic and engaging learning environment. By fostering strong
            connections with industry leaders, we bridge the gap between
            academic knowledge and practical experience, preparing our members
            to excel in the ever-evolving field of data science. Join us in
            our mission to uphold the highest standards of academic and
            technical integrity, and be part of a community dedicated to
            shaping the future of data science.
          </p>
        </div>

        <div className="flex flex-col max-w-7xl sm:flex-row gap-4 mb-6">
          <div
            className="w-full sm:w-1/2 p-4 rounded-xl border border-white/40 hover:backdrop-blur-sm bg-[#0e303d]"
          >
            <h2 className="text-white text-3xl underline decoration-2 underline-offset-1">
              Vision
            </h2>
            <p className="text-base sm:text-lg text-white whitespace-pre-wrap lg:text-justify">
              To be the foremost hub for Data Science excellence, continually
              driving innovation and collaboration within our college
              community. We strive to create an environment where students and
              faculty can engage deeply with cutting-edge research and
              practical applications of Data Science. By fostering strong
              connections with industry leaders, we aim to bridge the gap
              between academic knowledge and real-world practice.{"\n"} Our
              vision includes being a leader in disseminating the latest
              trends and advancements in Data Science. Ultimately, we aspire
              to empower our members to be at the forefront of technological
              advancements and research in Data Science.
            </p>
            <p>{"‎"}</p>
          </div>
          <div
            className="w-full sm:w-1/2 p-4 rounded-xl border  border-white/40 hover:backdrop-blur-sm bg-[#0e303d]"

          >
            <h2 className="text-white text-3xl underline decoration-2 nderline-offset-1">
              Mission
            </h2>
            <p className="text-base sm:text-lg text-white whitespace-pre-wrap lg:text-justify">
              Our mission is to sustain and expand a thriving Data Science
              community by offering comprehensive guidance on various projects
              and providing certifications for students and faculty. We are
              dedicated to keeping our members abreast of industry trends and
              the practical implications of data in the real world through
              regular workshops, seminars, and guest lectures. By promoting
              active participation and collaboration, we aim to foster a
              culture of continuous learning and innovation.{"\n"} We ensure
              access to cutting-edge resources and tools that enable our
              members to excel in their data-driven endeavors. Our commitment
              is to uphold the highest standards of academic and technical
              integrity, preparing our members to lead and succeed in the
              dynamic field of Data Science.
            </p>
          </div>
        </div>
      </div>

      {/* Founders Block Component */}
      <div
        className="max-w-7xl px-4 py-20 mx-auto mb-2 min-h-[calc(100vh-4.5rem)]"
        id="foundersBlock"
      >
        <h2 className="text-4xl font-semibold">Founder of the club</h2>
        <div className="flex flex-col lg:flex-row gap-4 py-8">
          <div className="w-full lg:w-4/12 flex flex-col justify-start items-center gap-8">
            <img
              src="/teamImages/sravanthi.jpg"
              className="w-[350px] h-auto !min-w-[200px] !min-h-[200px] rounded-[10%]"
            />
            <div>
              <a
                href="https://www.linkedin.com/in/sravanthi-rayani-535a01228/"
                target="_blank"
              >
                <p className="text-3xl text-black">Rayani Sravanthi</p>
              </a>
              <p className="text-black text-xl mt-2">
                Dept. of CSE-(CyS,DS) & AI&DS
              </p>
              <p className="text-black text-lg"> Batch 2020-2024</p>
            </div>
          </div>


          <div className="lg:w-8/12 p-4 h-[500px]  border border-black/20 rounded-lg  overflow-y-scroll overflow-x-hidden small-scrollbar">
            <p className="text-black text-base sm:text-lg whitespace-pre-wrap text-justify">
              One of the most difficult yet rewarding experiences of my life was
              founding a club while I was in college. As a sophomore who was
              deeply interested in data science. There was not a single student
              group focused on data science. I decided to start the VJ DATA
              QUESTERS Club (VJDQ) with the help of our department, motivated by
              my desire to have a real influence.{"\n"}
              {"\n"}
              With a lot of resolve and a distinct vision, the trip got
              underway. I put together a proposal to be given to the student
              activities office, wrote a mission statement, and listed the
              objectives of the organization. Convincing the administration of
              the club's potential influence and motivating students to join was
              a difficult first step. But what drove me was a deep-seated
              conviction that small steps taken by many could result in big
              changes.{"\n"}
              {"\n"}
              The next important step is to assemble a committed team. I reached
              out to colleagues who were passionate like me and gave them
              important roles in the club. We generated ideas and created an
              activity schedule together. Every event was painstakingly
              organized to guarantee optimal participation and influence. To
              keep club members motivated and involved, a combination of
              acknowledgment, passion, and human connection is needed. I made it
              a point to recognize everyone's participation, no matter how tiny,
              and to celebrate our group's accomplishments.{"\n"}
              {"\n"}Frequent meetings provided members with an opportunity to
              discuss ideas, express problems, and foster a sense of camaraderie
              in addition to planning and logistics. Everyone felt appreciated
              and motivated to participate because of the encouraging atmosphere
              we fostered. Our development was greatly aided by the
              administration's and the faculty's support. Through exhibiting the
              benefits of our work and proving our dedication, we were able to
              obtain funds and resources that allowed us to plan bigger events
              and take on more challenging initiatives. Faculty members offered
              their time to serve as advisors, offering advice and putting us in
              touch with outside organizations and subject matter experts.
              {"\n"}
              {"\n"}
              Reflecting on this journey, I am immensely proud of what the VJ
              DATA QUESTERS Club has achieved. From a fledgling idea to a
              vibrant, impactful organization, the club's success is a testament
              to the power of passion, perseverance, and collaboration. My
              motivation was fueled by the belief that together, we could make a
              difference. This belief not only drove me but also inspired
              countless others to join and support our mission.
              {"\n"}
              {"\n"}
              Looking ahead, the VJDQ is poised to continue its growth and
              impact. New leaders have emerged, bringing fresh ideas and energy.
              The foundation we built will support future initiatives, ensuring
              that our commitment to our club endures. Founding this club has
              been a transformative experience, teaching me invaluable lessons
              in leadership, teamwork, and the profound impact of collective
              action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
