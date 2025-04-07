import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Carousel3D = () => {
  const navigate = useNavigate();
  const imageFiles = Object.keys(import.meta.glob('/public/events/Technovista2024/*.png', { eager: true }))
    .map(path => path.replace('/public', ''))
    .sort((a, b) => {
      const aNum = a.match(/img(\d+)/);
      const bNum = b.match(/img(\d+)/);
      if (aNum && bNum) return parseInt(aNum[1]) - parseInt(bNum[1]);
      if (aNum) return -1;
      if (bNum) return 1;
      return a.localeCompare(b);
    });

  // Map event names to their respective routes
  const eventPaths = {
    'img1': '/events/technovista/coding',
    'img2': '/events/technovista/robotics',
    'img3': '/events/technovista/gaming',
    'img4': '/events/technovista/workshops',
    // Add more mappings as needed
  };

  const images = imageFiles;
  const totalImages = images.length;  
  const rotationSpeed = 0.5;
  const [angle, setAngle] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const requestRef = useRef(null);
  const isPhone = dimensions.width <= 480;
  const isTablet = dimensions.width <= 768 && dimensions.width > 480;
  const angleStep = 360 / totalImages;

  const colorPalette = {
    black: "#0B0B0B",
    darkGray: "#333533", 
    cream: "#F2ECDD",
    gold: "#F5CB5C",
    deepGold: "#CD9C20"
  };

  const animate = () => {
    if (isAnimating) {
      setAngle(prevAngle => (prevAngle + rotationSpeed) % 360);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isAnimating]);

  const getImageDimensions = () => {
    const aspectRatio = 16 / 9;
    let baseWidth;

    if (totalImages <= 6) {
      baseWidth = isPhone ? dimensions.width * 0.45 : dimensions.width * 0.22;
    } else if (totalImages <= 10) {
      baseWidth = isPhone ? dimensions.width * 0.4 : dimensions.width * 0.2;
    } else {
      baseWidth = isPhone ? dimensions.width * 0.35 : dimensions.width * 0.18;
    }

    const width = Math.min(
      baseWidth,
      isPhone ? 220 : isTablet ? 200 : 240
    );

    const height = width / aspectRatio;
    return { width, height };
  };

  const getRadius = () => {
    const { width: imageWidth } = getImageDimensions();
  
    const minSpacing = imageWidth * (isPhone ? 0.7 : 0.6);
    const circumference = (imageWidth + minSpacing) * totalImages;
    const baseRadius = circumference / (2 * Math.PI);

    const scaleFactor = isPhone ? 1.0 : isTablet ? 0.9 : 0.95;
    const adjustedRadius = baseRadius * scaleFactor;

    return Math.min(
      Math.max(
        adjustedRadius,
        isPhone ? dimensions.width * 0.6 : dimensions.width * 0.3
      ),
      isPhone ? dimensions.width * 0.9 : dimensions.width * 0.4
    );
  };

  const { width: imageWidth, height: imageHeight } = getImageDimensions();
  const radius = getRadius();

  return (
    <div 
      className="w-full h-screen flex items-center justify-center overflow-hidden bg-black relative"
      style={{ 
        perspective: isPhone ? '800px' : isTablet ? '1000px' : '1200px'
      }}
    >
      {/* Enhanced Retro Grid Background with Bend Effect */}
      <div 
        className="absolute inset-0 w-[200%] h-[200%] left-[-50%] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, ${colorPalette.gold}30 2px, transparent 2px),
            linear-gradient(to bottom, ${colorPalette.gold}30 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(40deg) translateY(-30%)',
          transformOrigin: 'center center',
          opacity: 0.3,
          backgroundPosition: 'center',
          animation: 'gridMove 20s linear infinite'
        }}
      />
      
      <style>
        {`
          @keyframes gridMove {
            0% {
              backgroundPosition: 0 0;
            }
            100% {
              backgroundPosition: 60px 60px;
            }
          }
        `}
      </style>

      <div 
        className="relative"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `rotateY(${angle}deg)`,
          transition: 'transform 0.5s ease-out',
        }}
      >
        {images.map((image, index) => {
          const itemAngle = angleStep * index;
          const radians = (-1 * itemAngle * Math.PI) / 180;
          const x = Math.sin(radians) * radius;
          const z = Math.cos(radians) * radius;
          
          const imgName = image.match(/img\d+/)?.[0];
          const eventPath = eventPaths[imgName] || '/events/technovista';

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                left: '50%',
                top: '50%',
                marginLeft: `-${imageWidth / 2}px`,
                marginTop: `-${imageHeight / 2}px`,
                transformStyle: 'preserve-3d',
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${-itemAngle}deg)`,
                transition: 'all 0.5s ease-out',
                cursor: 'pointer'
              }}
              onMouseEnter={() => {
                setHoveredIndex(index);
                setIsAnimating(false);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setIsAnimating(true);
              }}
              onClick={() => navigate(eventPath)}
            >
              <div 
                className="w-full h-full rounded-lg overflow-hidden shadow-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  border: hoveredIndex === index 
                    ? `2px solid ${colorPalette.gold}` 
                    : `1px solid ${colorPalette.cream}`,
                  backgroundColor: colorPalette.black,
                  transform: hoveredIndex === index ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.3s ease-out',
                }}
              >
                <img 
                  src={image}
                  className="w-full h-full object-cover"
                  alt={`Carousel image ${index + 1}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel3D;
