import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";

function WhatWeGot() {
  const translations = [
    { lang: "English", text: " Technovista" },
    { lang: "Hindi", text: " टेक्नोविस्टा" },
    { lang: "Telugu", text: " టెక్నోవిస్తా" },
    { lang: "Odia", text: " ଟେକ୍ନୋଭିଷ୍ଟା" },
    { lang: "Kannada", text: " ಟೆಕ್ನೋವಿಸ್ಟಾ" },
    { lang: "Tamil", text: " டெக்னோவிஸ்டா" },
    { lang: "Malayalam", text: " ടെക്നോവിസ്റ്റ" },
  ];

  const stats = [
    {
      icon: "fas fa-user-graduate",
      title: "600+ Participants",
      desc: "Over 600+ participants",
    },
    {
      icon: "fas fa-calendar-alt",
      title: "2+ Years",
      desc: "2 years of successful execution",
    },
    {
      icon: "fas fa-award",
      title: "1.45 Lakh Prize Pool",
      desc: "Prizes worth up to 1.45 Lakh",
    },
  ];

  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(translations[0].text);

  useEffect(() => {
    let charIndex = 0;
    const newText = translations[index].text;
    let currentText = "";

    const typingEffect = setInterval(() => {
      if (charIndex < newText.length) {
        currentText += newText.charAt(charIndex);
        setDisplayedText(currentText);
        charIndex++;
      } else {
        clearInterval(typingEffect);
        setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % translations.length);
        }, 500);
      }
    }, 150);

    return () => clearInterval(typingEffect);
  }, [index]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center text-white text-center"
      style={{ padding: '0 16px', overflow: 'hidden', background: 'none' }}
    >
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
        WHAT WE'VE GOT FOR YOU
      </h1>
      <motion.span 
        className="text-4xl sm:text-6xl md:text-7xl font-bold text-yellow-400"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {displayedText} 2K25
      </motion.span>
      <p className="text-base sm:text-lg md:text-xl max-w-3xl mt-6 leading-relaxed text-gray-300">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur earum
        voluptates architecto veritatis doloribus, sunt at laboriosam eos rem
        cum debitis aspernatur ducimus adipisci ea, numquam est deserunt vitae
        libero ut tempore nostrum.
      </p>
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12 w-full max-w-6xl"
        style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}
      >
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="text-center p-8 bg-gray-800 rounded-lg shadow-lg"
            style={{ flex: '1 1 30%', margin: '5px' }}
          >
            <i className={`${stat.icon} text-6xl sm:text-7xl mb-6 text-yellow-400 animate-pulse`}></i>
            <div className="font-bold text-xl sm:text-2xl text-white">
              {stat.title}
            </div>
            <div className="text-sm sm:text-lg text-gray-400 mt-2">
              {stat.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WhatWeGot;