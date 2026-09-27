import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const editions = [
  {
    title: "Volume 2 | 2024 Edition",
    year: "2024",
    cover: "/newsletter-previews/cover(2024).png",
    driveUrl: "https://drive.google.com/file/d/12FzHpeT4QCZ_E_QuObW8WBUnsrmgeR4l/preview",
    description: "Recap of 2024 workshops, hackathons, guest lectures, and student project showcases.",
  },
  {
    title: "Volume 1 | 2023 Inaugural Edition",
    year: "2023",
    cover: "/newsletter-previews/cover(2023).png",
    driveUrl: "https://drive.google.com/file/d/1f3sb707THHsRONXEkc_r3as1CgIO7Lnj/preview",
    description: "The founding edition of VJ Data Questers newsletter capturing our early journey and orientation.",
  },
];

export default function Archive() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Newsletter Archive | VJ Data Questers";
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/newsletter")}
          className="mb-8 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-300 flex items-center gap-2"
        >
          ΓåÉ Back to Newsletter
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-[0.3em]">
            VJ Data Questers
          </span>
          <h1 className="text-4xl sm:text-6xl font-black mt-2 mb-4">
            PAST EDITIONS ARCHIVE
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Explore earlier volumes of our newsletter featuring past events, technical articles, and student achievements.
          </p>
        </div>

        {/* Old Editions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {editions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300 shadow-2xl"
            >
              <div>
                <div className="aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 mb-5">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                  {item.year}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <a
                href={item.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white text-slate-950 text-center font-bold rounded-xl hover:bg-slate-200 transition-colors block shadow-md"
              >
                Read PDF Edition
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
