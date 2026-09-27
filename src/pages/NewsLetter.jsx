import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Newsletter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Newsletter | VJ Data Questers";
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen text-white">

      {/* Hero Section */}
      <section className="relative h-[75vh] flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-slate-950 to-slate-950 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h2 className="text-indigo-400 font-extrabold text-lg tracking-[0.3em] uppercase mb-4">
            Newsletter
          </h2>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8">
            DATA SCIENCE<br />DIGEST
          </h1>

          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <button
              onClick={() =>
                document.getElementById("featured-card")?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-3 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-all shadow-lg"
            >
              Latest Edition
            </button>
            <button
              onClick={() => navigate("/archive")}
              className="px-8 py-3 border border-slate-600 text-white font-semibold rounded-full hover:bg-slate-800 transition-all"
            >
              Browse Archive
            </button>
          </div>
        </motion.div>
      </section>

      {/* Featured Newsletter Card */}
      <section
        id="featured-card"
        className="max-w-5xl mx-auto -mt-16 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative z-20"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Cover Preview */}
          <div className="aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden shadow-inner border border-slate-700">
            <img
              src="/newsletter-previews/cover.png.png"
              alt="Newsletter Cover 2025"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
              Featured Release
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Volume 3 | 2025 Annual Edition
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Dive into the annual highlights of VJ Data Questers. Explore our journey through the year, featuring key technical milestones, student success stories, and deep dives into the latest trends in data science and AI.
            </p>
            <a
              href="https://drive.google.com/file/d/1VBhI2sp5J2RBFuTFMbVI45RSs9IJh_fy/preview"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-white text-slate-950 font-bold rounded-lg text-center hover:bg-slate-200 transition-all block shadow-md"
            >
              Read Full PDF
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Pages Published", value: "40+" },
            { label: "Total Achievements", value: "100+" },
            { label: "Major Events", value: "10+" },
            { label: "Student Highlights", value: "50+" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-800/60">
              <h4 className="text-4xl font-black text-white mb-2">{stat.value}</h4>
              <p className="text-slate-400 uppercase text-xs tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Magazine Preview Carousel */}
      <section className="max-w-6xl mx-auto py-12 px-4 pb-20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Inside the Pages</h2>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {["cover.png.png", "cover(1).png.png", "cover(2).png.png", "cover(3).png.png"].map((img, i) => (
            <div
              key={i}
              className="min-w-[220px] aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-lg hover:scale-[102%] transition-transform duration-300"
            >
              <img
                src={`/newsletter-previews/${img}`}
                alt={`Page ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Newsletter;
