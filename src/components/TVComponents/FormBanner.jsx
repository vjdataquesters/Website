import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Code, Trophy, Zap, Star } from 'lucide-react';

const FormBanner = () => {
  const [activeEvent, setActiveEvent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const events = [
    {
      id: 1,
      title: "Cloud Craft",
      subtitle: "AWS Workshop",
      date: "April 7th & 8th 2025",
      time: "9:30 AM to 4:00 PM",
      venue: "APJ Abdul Kalam Auditorium",
      description: "Hands-On AWS Workshop - Boost up your cloud skills being a part of this engaging 2-day Workshop conducted on 7th & 8th of April, where ideas take flight in the CLOUD.",
      highlights: ["EC2 & S3 Deployment", "Lambda Functions", "Real-world Projects", "Industry Experts"],
      icon: "☁️",
      image: "https://www.vjdataquesters.com/events/CloudCraft2025/img1.png"
    },
    {
      id: 2,
      title: "Hit Reloaded",
      subtitle: "Treasure Hunt",
      date: "February 21st 2025",
      time: "10:00 AM to 3:00 PM",
      venue: "Sinti Stage",
      description: "An adrenaline-fueled treasure hunt for teams of 3-4. Solve riddles and puzzles through multiple checkpoints, starting with a briefing and first clue.",
      highlights: ["Team Challenge", "Puzzle Solving", "Multiple Checkpoints", "Code Cracking"],
      icon: "🔍",
      image: "https://www.vjdataquesters.com/events/HitReloaded2025/img1.png"
    },
    {
      id: 3,
      title: "Code Symphony",
      subtitle: "Programming Contest",
      date: "March 15th 2025",
      time: "2:00 PM to 6:00 PM",
      venue: "Computer Lab A",
      description: "A competitive programming contest where algorithms meet creativity. Showcase your coding prowess in this ultimate battle of logic and efficiency.",
      highlights: ["Algorithm Challenges", "Live Coding", "Real-time Leaderboard", "Cash Prizes"],
      icon: "💻",
      image: "https://www.vjdataquesters.com/events/Technovista2024/img1.png"
    },
    {
      id: 4,
      title: "AI Innovation Summit",
      subtitle: "Machine Learning Workshop",
      date: "March 22nd 2025",
      time: "10:00 AM to 5:00 PM",
      venue: "Innovation Hub",
      description: "Dive deep into the world of Artificial Intelligence and Machine Learning. Build, train, and deploy ML models with industry-standard tools and frameworks.",
      highlights: ["Neural Networks", "Deep Learning", "Model Deployment", "Industry Mentors"],
      icon: "🤖",
      image: "https://www.vjdataquesters.com/events/Technovista2024/img1.png"
    },
    {
      id: 5,
      title: "Cyber Shield",
      subtitle: "Cybersecurity Challenge",
      date: "April 2nd 2025",
      time: "1:00 PM to 7:00 PM",
      venue: "Security Lab",
      description: "Test your cybersecurity skills in this comprehensive challenge covering ethical hacking, cryptography, and digital forensics.",
      highlights: ["Ethical Hacking", "Cryptography", "Digital Forensics", "CTF Challenges"],
      icon: "🛡️",
      image: "https://www.vjdataquesters.com/events/Technovista2024/img1.png"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveEvent((prev) => (prev + 1) % events.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const handleEventClick = (index) => {
    if (index !== activeEvent) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveEvent(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-black rounded-2xl p-8 shadow-2xl border-2 border-yellow-500/30 relative overflow-hidden">
      {/* Decorative golden corners */}
      <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-yellow-400 rounded-tl-2xl"></div>
      <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-yellow-400 rounded-tr-2xl"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-yellow-400 rounded-bl-2xl"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-yellow-400 rounded-br-2xl"></div>

      {/* Golden glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-yellow-400/5 via-transparent to-transparent"></div>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center mb-4">
          <Star className="text-yellow-400 mr-2 animate-pulse" size={24} />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Featured Events
          </h2>
          <Star className="text-yellow-400 ml-2 animate-pulse" size={24} />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-2"></div>
        <p className="text-gray-300 text-sm font-light">
          Join the future of technology • Experience innovation
        </p>
        <div className="flex justify-center mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full mx-1 animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
          ))}
        </div>
      </div>

      {/* Main Event Display */}
      <div className={`transition-all duration-500 relative z-10 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
        <div className="bg-gradient-to-r from-yellow-400/20 via-yellow-500/10 to-yellow-400/20 p-[2px] rounded-xl mb-6 shadow-2xl shadow-yellow-400/20">
          <div className="bg-black rounded-lg p-6 border border-yellow-400/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-4 p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                  {events[activeEvent].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-400">{events[activeEvent].title}</h3>
                  <p className="text-gray-300 text-sm font-medium">{events[activeEvent].subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-300 mb-1">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm font-medium">{events[activeEvent].date}</span>
                </div>
                <div className="flex items-center text-yellow-300">
                  <Clock size={16} className="mr-2" />
                  <span className="text-sm font-medium">{events[activeEvent].time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-yellow-300 mb-4">
              <MapPin size={16} className="mr-2" />
              <span className="text-sm font-medium">{events[activeEvent].venue}</span>
            </div>

            <p className="text-gray-300 text-sm mb-4 leading-relaxed font-light">
              {events[activeEvent].description}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {events[activeEvent].highlights.map((highlight, index) => (
                <div key={index} className="flex items-center text-xs text-gray-300 bg-yellow-400/5 p-2 rounded border border-yellow-400/20">
                  <Zap size={12} className="mr-2 text-yellow-400" />
                  <span className="font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Navigation */}
      <div className="flex justify-center space-x-3 mb-6 relative z-10">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => handleEventClick(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
              index === activeEvent 
                ? 'bg-yellow-400 border-yellow-400 shadow-lg shadow-yellow-400/50 scale-110' 
                : 'bg-transparent border-yellow-400/50 hover:border-yellow-400 hover:bg-yellow-400/20'
            }`}
          />
        ))}
      </div>

      {/* Event Tabs */}
      <div className="grid grid-cols-5 gap-2 mb-6 relative z-10">
        {events.map((event, index) => (
          <button
            key={event.id}
            onClick={() => handleEventClick(index)}
            className={`p-3 rounded-lg transition-all duration-300 text-center border-2 ${
              index === activeEvent
                ? 'bg-yellow-400/10 border-yellow-400 shadow-lg shadow-yellow-400/20'
                : 'bg-black/50 border-yellow-400/30 hover:border-yellow-400/60 hover:bg-yellow-400/5'
            }`}
          >
            <div className="text-lg mb-1">{event.icon}</div>
            <div className={`text-xs font-bold ${
              index === activeEvent ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {event.title.split(' ')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center relative z-10">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 p-[2px] rounded-lg inline-block shadow-2xl shadow-yellow-400/30">
          <div className="bg-black px-8 py-4 rounded-md">
            <p className="text-sm text-gray-300 mb-2 font-light">
              Ready to be part of the innovation?
            </p>
            <div className="flex items-center justify-center text-yellow-400">
              <Trophy size={18} className="mr-2 animate-pulse" />
              <span className="text-sm font-bold tracking-wide">REGISTER NOW & JOIN THE FUTURE</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-yellow-400 rounded-full opacity-40 mt-0.5"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-80"></div>
          <div className="w-1 h-1 bg-yellow-400 rounded-full opacity-40 mt-0.5"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
};

export default FormBanner;
