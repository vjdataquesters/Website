import { faculty, currentteam, pastteams } from '../data/team';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from 'lucide-react';

const getImageSrc = (filename) => {
  return filename ? `/teamImages/${filename}` : "https://via.placeholder.com/400x500?text=Photo+Pending";
};

// --- CENTERED BIO MODAL ---
const BioModal = ({ member, onClose }) => {
  if (!member) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2rem] max-w-lg w-full p-10 relative shadow-2xl flex flex-col items-center text-center font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <img src={getImageSrc(member.image)} className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white" alt={member.name} />
          
          <div className="flex items-center gap-3 mt-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {member.name}
            </h2>
            {member.linkedin && member.linkedin !== "" && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center"
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/174/174857.png" 
                  alt="LinkedIn" 
                  className="w-6 h-6 rounded-sm shadow-sm"
                />
              </a>
            )}
          </div>

          <p className="text-blue-600 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">{member.role}</p>
        </div>

        {/* This displays the bio from your team.js */}
        <div className="text-slate-600 leading-relaxed text-sm italic">
          {member.bio ? `"${member.bio}"` : "Contributing to the technical excellence of VJ DataQuesters."}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- TEAM CARD COMPONENT ---
const TeamCard = ({ member, isLarge = false, onOpenBio }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    className={`relative overflow-hidden rounded-2xl group shadow-sm transition-all duration-500 bg-slate-50 font-sans
      ${isLarge ? 'h-[380px] w-full' : 'h-[300px] w-full'}
      border border-slate-200 hover:border-blue-500/30`}
  >
    <img src={getImageSrc(member.image)} alt={member.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/95 via-black/20 to-transparent transition-opacity duration-300">
      <h3 className={`font-bold text-white leading-tight tracking-tight ${isLarge ? 'text-xl' : 'text-lg'}`}>{member.name}</h3>
      <p className="text-blue-400 font-semibold text-[10px] uppercase tracking-wider mt-1.5 mb-5">{member.role}</p>
      
      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <button onClick={() => onOpenBio(member)} className="text-white/60 hover:text-white text-[9px] font-bold uppercase tracking-[0.2em] italic flex items-center gap-1.5">
          Explore Bio <ArrowRight size={12} />
        </button>
      </div>
    </div>
  </motion.div>
);

export default function Team() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeAlumniYear, setActiveAlumniYear] = useState(null);
  const renderGrid = (teamArray, isCurrentCore = false) => {
    // Top 3 leads for Alumni/2024, 4 for Core Team
    const leadLimit = isCurrentCore ? 4 : 3;
    const leads = teamArray.slice(0, leadLimit);
    const others = teamArray.slice(leadLimit);

    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className={`grid gap-6 mb-10 ${isCurrentCore ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {leads.map((m, i) => <TeamCard key={i} member={m} isLarge={true} onOpenBio={setSelectedMember} />)}
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {others.map((m, i) => (
            <div key={i} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
              <TeamCard member={m} onOpenBio={setSelectedMember} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-24 px-4 bg-white min-h-screen font-sans">
      <AnimatePresence>{selectedMember && <BioModal member={selectedMember} onClose={() => setSelectedMember(null)} />}</AnimatePresence>

      <section className="mb-24 text-center pt-10">
        <h1 className="text-4xl font-normal text-black mb-2">Who are we?</h1>
        <p className="text-sm text-gray-600">The people behind VJDQ</p>
      </section>

      {/* FACULTY SECTION */}
     <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {faculty.map((m, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-[2rem] p-10 flex flex-col items-center text-center font-sans group transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg">
            
            <div className="w-36 h-36 rounded-full overflow-hidden mb-6 border-4 border-white shadow-md">
              <img src={getImageSrc(m.image)} className="w-full h-full object-cover" alt={m.name} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{m.name}</h3>
            <p className="text-blue-600 font-semibold uppercase text-[10px] tracking-[0.15em] mb-12">{m.role}</p>

            <div className="w-full flex items-center justify-end mt-auto">
              <button onClick={() => setSelectedMember(m)} className="text-slate-400 hover:text-blue-600 text-[9px] font-bold uppercase tracking-[0.2em] italic flex items-center gap-1.5 transition-colors">
                Explore Bio <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-12 border-t border-slate-100 pt-8">
        <h1 className="text-4xl font-normal text-black text-center mb-6">Core Team</h1>
        {renderGrid(currentteam, true)}
      </section>

    <section className="mb-16 border-t border-slate-100 pt-10 text-center">
  <h1 className="text-2xl font-normal text-black mb-6">Alumni</h1>

  <div className="flex justify-center gap-4 mb-20">
    {['2025', '2024'].map((year) => {
      return (
        <button
          key={year}
          onClick={() =>
  setActiveAlumniYear(activeAlumniYear === year ? null : year)
}
          className={`px-10 py-3 rounded-xl font-bold text-lg border-2 border-black transition-all ${
            activeAlumniYear === year
              ? "bg-black text-white shadow-[6px_6px_0px_0px_black]"
              : "bg-white text-black shadow-[6px_6px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          }`}
        >
          {year}
        </button>
      );
    })}
  </div>

  <AnimatePresence mode="wait">
    <motion.div
      key={activeAlumniYear}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {activeAlumniYear && renderGrid(pastteams[activeAlumniYear], false)}
    </motion.div>
  </AnimatePresence>
</section>

    </div>
  );
}