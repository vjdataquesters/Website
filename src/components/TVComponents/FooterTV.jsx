import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa';

const FooterTV = () => {
  return (
    <footer className="relative bg-black text-white w-full overflow-hidden border-t mt-5 border-yellow-400/30">
      {/* Top Golden Line */}
      <div className="absolute top-0 left-0 w-full">
        <div className="golden-line-horizontal top-line"></div>
      </div>

      {/* Background Image Container */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(Map.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          filter: 'brightness(0.5) contrast(1.2)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Animated Golden Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Golden Lines */}
        <div className="golden-line-1"></div>
        <div className="golden-line-2"></div>
        <div className="golden-line-3"></div>
        <div className="golden-line-4"></div>
        <div className="golden-line-5"></div>

        {/* Golden Threads */}
        <div className="golden-thread-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`golden-thread thread-${i}`} />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-2 sm:px-4 py-4">
        <div className="flex flex-wrap justify-between w-full max-w-none px-2 sm:px-4 md:px-12">
          {/* Contact Info */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0 relative flex flex-col items-center text-center p-2">
            <div className="golden-corner-top-left"></div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-yellow-400">Contact Us</h2>
            <p className="text-base sm:text-lg mb-1 sm:mb-2">Email: technovista@gmail.com</p>
            <p className="text-base sm:text-lg mb-2 sm:mb-4">Phone: +91 1234567890</p>
            <p className="text-base sm:text-lg mb-1">VNR VJIET</p>
            <p className="text-base sm:text-lg mb-1">Bachupally</p>
            <p className="text-base sm:text-lg mb-2">Hyderabad</p>
            
            {/* Social Links */}
            <div className="flex space-x-4 sm:space-x-6 mt-4">
              <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors transform hover:scale-110">
                <FaFacebookF className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors transform hover:scale-110">
                <FaTwitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors transform hover:scale-110">
                <FaLinkedinIn className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors transform hover:scale-110">
                <FaYoutube className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
            <div className="golden-corner-bottom-right"></div>
          </div>

          {/* Quick Links */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0 relative flex flex-col items-center text-center p-2">
            <div className="golden-corner-top-left"></div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-yellow-400">Quick Links</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-xs">
              <div>
                <a href="#" className="block text-base sm:text-lg hover:text-yellow-400 transition-colors mb-2 sm:mb-3 hover:translate-x-2 transform">About Us</a>
                <a href="#" className="block text-base sm:text-lg hover:text-yellow-400 transition-colors mb-2 sm:mb-3 hover:translate-x-2 transform">Events</a>
                <a href="#" className="block text-base sm:text-lg hover:text-yellow-400 transition-colors mb-2 sm:mb-3 hover:translate-x-2 transform">Schedule</a>
              </div>
              <div>
                <a href="#" className="block text-base sm:text-lg hover:text-yellow-400 transition-colors mb-2 sm:mb-3 hover:translate-x-2 transform">Register</a>
                <a href="#" className="block text-base sm:text-lg hover:text-yellow-400 transition-colors mb-2 sm:mb-3 hover:translate-x-2 transform">Sponsors</a>
                <a href="#" className="block text-base sm:text-lg hover:text-yellow-400 transition-colors mb-2 sm:mb-3 hover:translate-x-2 transform">FAQ</a>
              </div>
            </div>
            <div className="golden-corner-bottom-right"></div>
          </div>

          {/* Map Link */}
          <div className="w-full md:w-1/4 relative flex flex-col items-center text-center p-2">
            <div className="golden-corner-top-left"></div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-yellow-400">Location</h2>
            <a
              href="https://goo.gl/maps/your-university-location"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base sm:text-lg text-white hover:text-yellow-400 transition-colors hover:translate-x-2 transform inline-block"
            >
              View on Google Maps →
            </a>
            <div className="golden-corner-bottom-right"></div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-2 w-full relative">
          <div className="golden-line-horizontal mb-4"></div>
          <p className="text-base sm:text-lg mt-3 text-yellow-400/80">
            © 2024 TechnoVista. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Golden Lines */
        .golden-line-1, .golden-line-2, .golden-line-3, .golden-line-4, .golden-line-5 {
          position: absolute;
          width: 1px;
          height: 60px;
          @media (min-width: 640px) {
            height: 80px;
          }
          background: linear-gradient(to bottom, transparent, #F5CB5C, transparent);
          animation: moveVertical 6s infinite linear;
          opacity: 0.3;
          box-shadow: 0 0 4px #F5CB5C;
          z-index: 1;
        }

        .golden-line-1 { left: 15%; animation-delay: 0s; }
        .golden-line-2 { left: 35%; animation-delay: 2s; }
        .golden-line-3 { left: 55%; animation-delay: 4s; }
        .golden-line-4 { left: 75%; animation-delay: 1s; }
        .golden-line-5 { left: 95%; animation-delay: 3s; }

        .golden-thread-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        /* Golden Threads */
        .golden-thread {
          position: absolute;
          width: 1px;
          height: 1px;
          background: #F5CB5C;
          opacity: 0;
          box-shadow: 0 0 2px #F5CB5C;
          animation: floatThread 4s infinite;
          z-index: 1;
        }

        ${[...Array(20)].map((_, i) => `
          .thread-${i} {
            left: ${5 + (Math.random() * 90)}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 4}s;
            animation-duration: ${3 + Math.random() * 3}s;
            transform: rotate(${Math.random() * 360}deg);
          }
        `).join('')}

        @keyframes moveVertical {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes floatThread {
          0% {
            opacity: 0;
            transform: translate(0, -20px) rotate(0deg);
            width: 1px;
            height: 1px;
          }
          20% {
            opacity: 0.8;
            width: 1px;
            height: 15px;
            transform: translate(${Math.random() > 0.5 ? 20 : -20}px, 20px) rotate(${Math.random() * 180}deg);
          }
          50% {
            opacity: 0.8;
            width: 1px;
            height: 15px;
            transform: translate(${Math.random() > 0.5 ? 35 : -35}px, 60px) rotate(${Math.random() * 360}deg);
          }
          80% {
            opacity: 0.8;
            width: 1px;
            height: 15px;
            transform: translate(${Math.random() > 0.5 ? 20 : -20}px, 100px) rotate(${Math.random() * 540}deg);
          }
          100% {
            opacity: 0;
            transform: translate(${Math.random() > 0.5 ? 35 : -35}px, 140px) rotate(${Math.random() * 720}deg);
            width: 1px;
            height: 1px;
          }
        }

        .golden-corner-top-left, .golden-corner-top-right,
        .golden-corner-bottom-left, .golden-corner-bottom-right {
          position: absolute;
          width: 20px;
          height: 20px;
          @media (min-width: 640px) {
            width: 30px;
            height: 30px;
          }
          border: 1px solid #F5CB5C;
          opacity: 0.7;
        }

        .golden-corner-top-left {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
          box-shadow: -2px -2px 4px -1px #F5CB5C;
        }

        .golden-corner-bottom-left {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
          box-shadow: -2px 2px 4px -1px #F5CB5C;
        }

        .golden-corner-bottom-right {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
          box-shadow: 2px 2px 4px -1px #F5CB5C;
        }

        .golden-line-horizontal {
          position: absolute;
          height: 1px;
          width: 100%;
          background: linear-gradient(to right, transparent, #F5CB5C, transparent);
          box-shadow: 0 0 8px #F5CB5C;
        }

        .top-line {
          top: 0;
        }

        @keyframes shimmer {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </footer>
  );
};

export default FooterTV; 