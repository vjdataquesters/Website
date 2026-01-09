import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Bars from "../assets/bars.svg";

const Header = () => {
  const [menu, setMenu] = useState(false);
  const handleBarsClick = () => setMenu(!menu);

  const DropVariants = {
    hover: {
      textShadow: "0px 0px 4px #fff",
      transition: {
        duration: 0.2,
      },
    },
  };
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const handleAboutHover = (val) => {
    setIsAboutOpen(val);
  };
  return (
    <nav className="w-full h-16 fixed bg-[#0f323f] z-[102]">
      <div className="flex justify-end items-center h-full mx-8">
        <ul
          className={`
          flex items-center text-lg px-4 md:px-0
          md:static
          fixed flex-col justify-start top-16 w-[40%] h-screen bg-[#0f323f] 
          transition-all duration-300 ease-out z-10 border-l border-t border-black/50
          ${menu ? "right-0" : "right-[-100%]"}
          md:flex-row md:w-auto md:h-auto md:bg-transparent md:border-0
        `}
        >
          <li
            className="mx-6 py-5 px-2 border-b border-white/50 w-full
            md:py-0 md:px-0 md:border-0 md:w-auto"
          >
            <Link to="/" onClick={handleBarsClick} className="no-underline">
              <p className="text-white hover:text-[#9d9d9d] cursor-pointer">
                Home
              </p>
            </Link>
          </li>
          <li
            className="mx-6 group relative py-5 px-2 border-b border-white/50 w-full
            md:py-0 md:px-0 md:border-0 md:w-auto"
            onMouseEnter={() => handleAboutHover(true)}
            onMouseLeave={() => handleAboutHover(false)}
          >
            <p className="text-white hover:text-[#9d9d9d] cursor-pointer">
              About{" "}
              {!isAboutOpen ? (
                <span>▾</span>
              ) : (
                <span className="inline-block transform rotate-180">▾</span>
              )}
            </p>
            <ul
              className="hidden group-hover:block absolute bg-[#0f323f] min-w-[160px] shadow-lg rounded-lg overflow-hidden
              right-[35vw] top-16
              md:right-auto md:top-full"
            >
              <li className="border-b border-white/20 hover:bg-[#0e4256]">
                <Link
                  to="about"
                  onClick={handleBarsClick}
                  className="block p-4 no-underline"
                >
                  <motion.p
                    variants={DropVariants}
                    whileHover="hover"
                    whileTap="hover"
                    className="text-white"
                  >
                    About us
                  </motion.p>
                </Link>
              </li>
              <li className="border-b border-white/20 hover:bg-[#0e4256]">
                <Link
                  to="testimonials"
                  onClick={handleBarsClick}
                  className="block p-4 no-underline"
                >
                  <motion.p
                    variants={DropVariants}
                    whileHover="hover"
                    whileTap="hover"
                    className="text-white"
                  >
                    Testimonials
                  </motion.p>
                </Link>
              </li>
              <li className="hover:bg-[#0e4256]">
                <Link
                  to="about#foundersBlock"
                  onClick={handleBarsClick}
                  className="block p-4 no-underline"
                >
                  <motion.p
                    variants={DropVariants}
                    whileHover="hover"
                    whileTap="hover"
                    className="text-white"
                  >
                    Founders block
                  </motion.p>
                </Link>
              </li>
            </ul>
          </li>

          <li
            className="mx-6 py-5 px-2 border-b border-white/50 w-full
            md:py-0 md:px-0 md:border-0 md:w-auto"
          >
            <Link
              to="events"
              onClick={handleBarsClick}
              className="no-underline"
            >
              <p className="text-white hover:text-[#9d9d9d] cursor-pointer ">
                Events
              </p>
            </Link>
          </li>

          <li
            className="mx-6 py-5 px-2 border-b border-white/50 w-full
            md:py-0 md:px-0 md:border-0 md:w-auto"
          >
            <Link
              to="gallery"
              onClick={handleBarsClick}
              className="no-underline"
            >
              <p className="text-white hover:text-[#9d9d9d] cursor-pointer ">
                Gallery
              </p>
            </Link>
          </li>

          <li
            className="mx-6 py-5 px-2 border-b border-white/50 w-full
            md:py-0 md:px-0 md:border-0 md:w-auto"
          >
            <Link to="team" onClick={handleBarsClick} className="no-underline">
              <p className="text-white hover:text-[#9d9d9d] cursor-pointer ">
                Team
              </p>
            </Link>
          </li>
          <li
            className="mx-6 py-5 px-2 border-b border-white/50 w-full
            md:py-0 md:px-0 md:border-0 md:w-auto"
          >
            <Link
              to="/newsletter"
              onClick={handleBarsClick}
              className="no-underline"
            >
              <p className="text-white hover:text-[#9d9d9d] cursor-pointer">
                Newsletter
              </p>
            </Link>
          </li>
        </ul>

        <div
          className="flex w-[35px] cursor-pointer md:hidden"
          onClick={handleBarsClick}
        >
          <img src={Bars} alt="Menu" />
        </div>
      </div>
    </nav>
  );
};

export default Header;
