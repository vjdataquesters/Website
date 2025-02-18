import { faculty, currentteam, pastteams } from '../data/team;
import { useState } from 'react';
import Reveal from '../components/Reveal';

const Image = ({ name, role, image, linkedin }) => {
  return (
    <div className="flex flex-col justify-around px-6 py-8 rounded-2xl bg-[#fafafa] hover:bg-[#eaeaea] transition-all duration-300">
      <p className="text-left w-full mb-1 text-xl font-medium">{role}</p>
      <img
        className="w-52 h-52 md:w-64 md:h-64 rounded-3xl mx-auto transition-all duration-300"
        src={image ? image : "https://picsum.photos/200"}
        alt={name + " image"}
        draggable={false}
        loading="lazy"
      />
      <a href={linkedin} target="_blank" className="text-right w-full mt-1 text-black no-underline hover:underline">
        <p>{name}</p>
      </a>
    </div>
  );
};

export default function Team() {

  const [pastMembers,setPastMembers]=useState([]);
  const [selectedYear,setSelectedYear]=useState(null)

  const handleYearChange=(year)=>{
    setPastMembers(pastteams[year])
    setSelectedYear(year)
  }

  return (
    <div className="w-full py-20 px-4 text-center">
      <section className="mb-16">
        <h1 className="font-semibold text-3xl mb-2">Who are we?</h1>
        <p className="text-lg text-gray-600 mb-8">The people behind VJDQ</p>
        <div className="mx-auto flex flex-wrap justify-center gap-5 max-w-7xl">
          {faculty.map((member, index) => (
            <Image
              key={index}
              name={member.name}
              role={member.role}
              image={member.image ? `teamImages/${member.image}` : undefined}
              linkedin={member.linkedin}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h1 className="font-semibold text-3xl mb-8" id="coreteam">
          Core Team
        </h1>
        <div className="mx-auto flex flex-wrap justify-center gap-3 max-w-7xl">
          {currentteam.coreteam.map((member, index) => (
            <Reveal key={index} className="w-full flex justify-center p-4">
              <Image
                name={member.name}
                role={member.role || "Team Member"}
                image={member.image ? `teamImages/${member.image}` : undefined}
                linkedin={member.linkedin}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mb-16">
        {/* Uncomment and adjust this section as needed */}
        {/* <h1 className="font-semibold text-3xl mb-8" id="actionteam">
          Action Team
        </h1>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-7xl">
          {actionteam.map((member, index) => (
            <Reveal key={index} className="w-full flex justify-center p-4">
              <Image
                name={member.name}
                role={member.domain || "Team Member"}
                image={member.image ? `teamImages/${member.image}` : undefined}
                linkedin={member.linkedin}
              />
            </Reveal>
          ))}
        </div> */}
      </section>
      <section className='mb-16'>
        <h1 className='mt-5 mb-4'>View Past Teams</h1>
        <div className='mb-4'>
          {Object.keys(pastteams).map((year)=>(
            <button
              key={year}
              className={`text-center mx-4 w-24 h-11 font-bold text-lg border-2 border-black text-black shadow-[5px_5px_5px_0px] hover:shadow-none  transition-all rounded-md  ${
                selectedYear===year
                  ? "bg-[#0f323f] text-white"
                  : "bg-white"
              } `}
              onClick={()=>handleYearChange(year)}
            >
              {year}
            </button>
          ))}
        </div>
        {selectedYear===null?<div></div>
        :
        <div>
          <h1 className="font-semibold text-3xl mb-8" id="coreteam">
            Core Team
          </h1>
          <div className="mx-auto flex flex-wrap justify-center gap-3 max-w-7xl">
            {pastMembers.coreteam.map((member, index) => (
              <Reveal key={index} className="w-full flex justify-center p-4">
                <Image
                  name={member.name}
                  role={member.role || "Team Member"}
                  image={member.image ? `teamImages/${member.image}` : undefined}
                  linkedin={member.linkedin}
                />
              </Reveal>
            ))}
          </div>
          <h1 className="font-semibold text-3xl mb-12 mt-12" id="actionteam">
            Action Team
          </h1>
          <div className="mx-auto flex flex-wrap justify-center gap-3 max-w-7xl">
            {pastMembers.actionteam.map((member, index) => (
              <Reveal key={index} className="w-full flex justify-center p-4">
                <Image
                  name={member.name}
                  role={member.domain || "Team Member"}
                  image={member.image ? `teamImages/${member.image}` : undefined}
                  linkedin={member.linkedin}
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
