import { faculty, currentteam, pastteams } from '../data/team';
import { useState } from 'react';
import Reveal from '../components/Reveal';
import { motion, AnimatePresence } from "framer-motion";

// Helper function to get image path from filename
const getImageSrc = (filename) => {
  return filename ? `/teamImages/${filename}` : "https://picsum.photos/200";
};

const Image = ({
  name,
  role,
  creativeRole,
  image,
  linkedin,
  bio,
  onImageClick,
  notClickable = false
}) => {
  return (
    <div className="flex flex-col justify-around px-6 py-8 rounded-2xl bg-[#fafafa] hover:bg-[#eaeaea] transition-all duration-300">
      <div className="text-left w-full mb-1">
        <p className="text-xl font-medium">{role}</p>
        <p className="text-sm text-gray-500 italic">{creativeRole}</p>
      </div>
      <img
        className={`w-52 h-52 md:w-64 md:h-64 rounded-3xl mx-auto transition-all duration-300 object-cover ${
          onImageClick ? 'cursor-pointer' : 'cursor-default'
        }`}
        src={getImageSrc(image)}
        alt={name + " image"}
        draggable={false}
        loading="lazy"
        onClick={onImageClick}
      />
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg text-right w-full mt-1 text-black no-underline hover:underline"
      >
        <p>{name}</p>
      </a>
    </div>
  );
};

// Framer Motion variants for impressive modal animation
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit:   { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, y: 80, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 22 } },
  exit:   { opacity: 0, y: 80, scale: 0.92, transition: { duration: 0.18 } }
};

const BioModal = ({ member, onClose }) => {
  return (
    <AnimatePresence>
      {member && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-start md:items-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            variants={backdropVariants}
            onClick={onClose}
            aria-label="Close Modal"
          />
          {/* Modal Content */}
          <motion.div
            key={member.name}
            className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto px-6 py-8 mt-16 md:mt-0 shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col md:flex-row md:gap-8 gap-6 items-start justify-start">
              {/* Image: centered on mobile, left on desktop */}
              <div className="flex-shrink-0 flex w-full justify-center md:w-auto md:justify-start">
                <img
                  className="w-52 h-52 md:w-64 md:h-64 rounded-3xl object-cover mx-auto"
                  src={getImageSrc(member.image)}
                  alt={member.name + " image"}
                />
              </div>
              {/* Text content */}
              <div className="flex-1 text-left flex flex-col max-w-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    {/* Name and LinkedIn icon row */}
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold">{member.name}</h2>
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="View LinkedIn Profile"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#0A66C2" className="w-5 h-5">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-lg text-gray-600">{member.role}</p>
                    {member.creativeRole && (
                      <p className="text-sm text-gray-500 italic">{member.creativeRole}</p>
                    )}
                  </div>
                  <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl ml-4 self-start"
                  >
                    &times;
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-line flex-1 text-justify">{member.bio}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Team() {
  const [pastMembers, setPastMembers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleYearChange = (year) => {
    if(selectedYear === year){
      setPastMembers([]);
      setSelectedYear(null);
      return;
    }
    setPastMembers(pastteams[year]);
    setSelectedYear(year);
  };

  const handleImageClick = (member) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  return (
    <div className="w-full py-20 px-4 text-center">
      {selectedMember && (
        <BioModal member={selectedMember} onClose={closeModal} />
      )}
      
      <section className="mb-16">
        <h1 className="font-semibold text-3xl mb-2">Who are we?</h1>
        <p className="text-lg text-gray-600 mb-8">The people behind VJDQ</p>
        <div className="mx-auto flex flex-wrap justify-center gap-5 max-w-7xl">
          {faculty.map((member, index) => (
            <Image
              key={index}
              name={member.name}
              role={member.role}
              creativeRole={member.creativeRole}
              image={member.image}
              linkedin={member.linkedin}
              bio={member.bio}
              onImageClick={() => handleImageClick(member)}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h1 className="font-semibold text-3xl mb-8" id="coreteam">
          Core Team
        </h1>
        <div className="mx-auto flex flex-wrap justify-center gap-3 max-w-7xl">
          {currentteam.map((member, index) => (
            <Reveal key={index} className="w-full flex justify-center p-4">
              <Image
                name={member.name}
                role={member.role || "Team Member"}
                creativeRole={member.creativeRole}
                image={member.image}
                linkedin={member.linkedin}
                bio={member.bio}
                onImageClick={() => handleImageClick(member)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className='mb-16'>
        <h1 className='mt-5 mb-4'>View Past Teams</h1>
        <div className='mb-4'>
          {Object.keys(pastteams).map((year) => (
            <button
              key={year}
              className={`text-center mx-4 w-24 h-11 font-bold text-lg border-2 border-black text-black shadow-[5px_5px_5px_0px] hover:shadow-none  transition-all rounded-md  ${selectedYear === year
                  ? "bg-[#0f323f] text-white"
                  : "bg-white"
                }`}
              onClick={() => {
                handleYearChange(year)
              }}
            >
              {year}
            </button>
          ))}
        </div>
        {selectedYear &&
          <div>
            <h1 className="font-semibold text-3xl mb-8" id="coreteam">
              Core Team
            </h1>
            <div className="mx-auto flex flex-wrap justify-center gap-3 max-w-7xl">
              {pastMembers.map((member, index) => (
                <Reveal key={index} className="w-full flex justify-center p-4">
                  <Image
                    name={member.name}
                    role={member.role || "Team Member"}
                    creativeRole={member.creativeRole}
                    image={member.image}
                    linkedin={member.linkedin}
                    bio={member.bio}
                    onImageClick={undefined} // Modal disabled for past members
                    notClickable
                  />
                </Reveal>
              ))}
            </div>
          </div>
        }
      </section>
    </div>
  );
}
