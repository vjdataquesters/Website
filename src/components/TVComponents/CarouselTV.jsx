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

  const eventPaths = {
    'img1': '/events/technovista/coding',
    'img2': '/events/technovista/robotics',
    'img3': '/events/technovista/gaming',
    'img4': '/events/technovista/workshops',
  };

  const images = imageFiles;
  const totalImages = images.length;  
  const rotationSpeed = 0.5;
  const [angle, setAngle] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startAngle, setStartAngle] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const requestRef = useRef(null);
  const containerRef = useRef(null);
  
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

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAnimating && !isDragging && hoveredIndex === null) {
      const animate = () => {
        setAngle(prevAngle => (prevAngle + rotationSpeed) % 360);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }
  }, [isAnimating, isDragging, hoveredIndex]);

  const config = {
    phone: {
      imageWidth: 160,
      imageHeight: 90,
      radius: dimensions.width <= 380 ? 280 : 320,
      perspective: 1000,
      transitionSpeed: 0.7,
      gridSize: 40
    },
    tablet: {
      imageWidth: 180,
      imageHeight: 101,
      radius: 360,
      perspective: 1100,
      transitionSpeed: 0.7,
      gridSize: 50
    },
    desktop: {
      imageWidth: 240,
      imageHeight: 135,
      radius: 540,
      perspective: 1200,
      transitionSpeed: 0.7,
      gridSize: 60
    }
  };

  const currentConfig = isPhone ? config.phone : isTablet ? config.tablet : config.desktop;

  const handleTouchStart = (e) => {
    if (isAnimating) setIsAnimating(false);
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartAngle(angle);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 0.5;
    setAngle(startAngle + (deltaX * sensitivity));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (hoveredIndex === null) {
      setTimeout(() => setIsAnimating(true), 1500);
    }
  };

  const handleMouseDown = (e) => {
    if (isAnimating) setIsAnimating(false);
    setIsDragging(true);
    setStartX(e.clientX);
    setStartAngle(angle);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const sensitivity = 0.5;
    setAngle(startAngle + (deltaX * sensitivity));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (hoveredIndex === null) {
      setTimeout(() => setIsAnimating(true), 1500);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (hoveredIndex === null) {
        setTimeout(() => setIsAnimating(true), 1500);
      }
    }
    setHoveredIndex(null);
  };

  const handleImageHover = (index) => {
    setHoveredIndex(index);
    setIsAnimating(false);
  };

  const handleImageLeave = () => {
    setHoveredIndex(null);
    if (!isDragging) {
      setIsAnimating(true);
    }
  };

  return (
    <div 
      className="w-full h-[35vh] flex items-center justify-center overflow-visible bg-black relative -mt-8"
      style={{ 
        perspective: `${currentConfig.perspective}px`
      }}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 w-[200%] h-[200%] left-[-50%] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, ${colorPalette.gold}30 1px, transparent 1px),
            linear-gradient(to bottom, ${colorPalette.gold}30 1px, transparent 1px)
          `,
          backgroundSize: `${currentConfig.gridSize}px ${currentConfig.gridSize}px`,
          transform: 'perspective(1000px) rotateX(35deg) translateY(-30%)',
          transformOrigin: 'center center',
          opacity: 0.3,
          backgroundPosition: 'center',
          animation: 'gridMove 20s linear infinite'
        }}
      />
      
      <style>
        {`
          @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: ${currentConfig.gridSize}px ${currentConfig.gridSize}px; }
          }
        `}
      </style>

      <div 
        className="relative"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `rotateY(${angle}deg)`,
          transition: isDragging ? 'none' : `transform ${currentConfig.transitionSpeed}s ease-out`,
        }}
      >
        {images.map((image, index) => {
          const itemAngle = angleStep * index;
          const radians = (-1 * itemAngle * Math.PI) / 180;
          const x = Math.sin(radians) * currentConfig.radius;
          const z = Math.cos(radians) * currentConfig.radius;
          
          const imgName = image.match(/img\d+/)?.[0];
          const eventPath = eventPaths[imgName] || '/events/technovista';

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: `${currentConfig.imageWidth}px`,
                height: `${currentConfig.imageHeight}px`,
                left: '50%',
                top: '50%',
                marginLeft: `-${currentConfig.imageWidth / 2}px`,
                marginTop: `-${currentConfig.imageHeight / 2}px`,
                transformStyle: 'preserve-3d',
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${-itemAngle}deg)`,
                transition: isDragging ? 'none' : `all ${currentConfig.transitionSpeed}s ease-out`,
                cursor: 'pointer',
                zIndex: hoveredIndex === index ? 10 : 'auto',
                WebkitTapHighlightColor: 'transparent'
              }}
              onClick={() => !isDragging && navigate(eventPath)}
              onMouseEnter={() => handleImageHover(index)}
              onMouseLeave={handleImageLeave}
            >
              <div 
                className="w-full h-full rounded-lg overflow-hidden shadow-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  border: hoveredIndex === index 
                    ? `2px solid ${colorPalette.gold}` 
                    : `1px solid ${colorPalette.cream}`,
                  backgroundColor: colorPalette.black,
                  transform: hoveredIndex === index ? 'scale(1.25)' : 'scale(1)',
                  transition: isDragging ? 'none' : `all ${currentConfig.transitionSpeed}s ease-out`,
                  boxShadow: hoveredIndex === index 
                    ? `0 0 20px ${colorPalette.gold}80` 
                    : 'none'
                }}
              >
                <img 
                  src={image} 
                  alt={`Event ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable="false"
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
