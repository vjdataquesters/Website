import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, User } from "lucide-react";

export default function SpeakerCard({ speaker, index = 0 }) {
  const { name, role, organization, image, github, linkedin, twitter } = speaker;

  const socialLinks = [
    github && { icon: Github, url: github, label: "GitHub" },
    linkedin && { icon: Linkedin, url: linkedin, label: "LinkedIn" },
    twitter && { icon: Twitter, url: twitter, label: "Twitter" },
  ].filter(Boolean);

  const getInitials = (n) => {
    if (!n) return "";
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10"
    >
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Profile Image / Initials */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-inner">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-[Poppins] text-2xl font-bold text-slate-300">
                {getInitials(name) || <User size={24} />}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h4 className="font-[Poppins] text-[16.5px] font-extrabold text-white tracking-tight truncate">{name}</h4>
            {role && (
              <p className="text-xs font-semibold text-cyan-400 font-[Inter] tracking-wider uppercase mt-0.5 truncate">{role}</p>
            )}
            {organization && (
              <p className="mt-1 text-xs sm:text-[13px] text-slate-400 font-[Inter] truncate">{organization}</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex gap-2 xs:shrink-0 pl-2 xs:pl-0">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 border border-white/10 transition-all hover:scale-110 hover:bg-cyan-500 hover:text-[#0a2530] hover:border-transparent"
                  aria-label={`${name}'s ${link.label}`}
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
