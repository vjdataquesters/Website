import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useAnimation } from "framer-motion";
import WhatWeGot from "../components/TVComponents/WhatWeGot";
import Intro from "../components/TVComponents/Intro";
import EventTimeTV from "../components/TVComponents/EventTimeTV";
import Carousel3D from "../components/TVComponents/CarouselTV";
import Countdown from "../components/TVComponents/CountDown";
import FooterTV from "../components/TVComponents/FooterTV";

const Technovista = () => {
  const { scrollY } = useScroll();
  const [introDone, setIntroDone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const controls = useAnimation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const titleVariants = {
    hidden: { 
      opacity: 1,
      y: 0 
    },
    visible: {
      opacity: 1,
      y: isMobile ? "20vh" : "35vh",
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      y: 100 
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      },
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroDone(true);
      controls.start({ scale: 3, opacity: 0, transition: { duration: 1 } });
    }, 2000);
    return () => clearTimeout(timer);
  }, [controls]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const triggerPoint = window.innerHeight - (rect.height * 0.65);
      const isInView = rect.top <= triggerPoint;
      setIsVisible(isInView);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <div className="bg-black min-h-[200vh] relative">
      <Intro />

      {introDone && (
        <div className="relative z-10 flex flex-col">
          <WhatWeGot />
          <div ref={sectionRef} className="relative h-[90vh] overflow-hidden">
            {/* Carousel */}
            <motion.div 
              variants={titleVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              className="absolute inset-0 mt-20 md:mt-24"
            >
              <Carousel3D />
            </motion.div>
            
            {/* Countdown */}
            <motion.div 
              variants={letterVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              className="absolute inset-0 flex items-start justify-center pt-10"
            >
              <div className="w-full max-w-5xl px-4">
                <Countdown isVisible={isVisible} />
              </div>
            </motion.div>
          </div>
          <EventTimeTV />
          <FooterTV />
        </div>
      )}
    </div>
  );
};

export default Technovista;
