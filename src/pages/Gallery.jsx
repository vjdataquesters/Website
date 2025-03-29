import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { galleryImages } from "../data/galleryImages";

export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Categorize images by size type
  const sizedImages = galleryImages.map((img, i) => ({
    ...img,
    sizeType: 
      i % 12 === 0 ? "large" :
      i % 5 === 0 ? "horizontal" :
      "small"
  }));

  const openLightbox = (img, index) => {
    setSelectedImg(img);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImg(null);
    document.body.style.overflow = 'auto';
  };

  const goNext = (e) => {
    e?.stopPropagation();
    const nextIndex = (currentIndex + 1) % sizedImages.length;
    setSelectedImg(sizedImages[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const goPrev = (e) => {
    e?.stopPropagation();
    const prevIndex = (currentIndex - 1 + sizedImages.length) % sizedImages.length;
    setSelectedImg(sizedImages[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diffX = touchStartX.current - touchEndX.current;
    if (diffX > 50) {
      goNext();
    } else if (diffX < -50) {
      goPrev();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImg) return;
      
      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          goNext(e);
          break;
        case 'ArrowLeft':
          goPrev(e);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImg, currentIndex]);

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-8">
      <h1 className="text-3xl font-bold text-center mb-10 mt-3">Gallery</h1>

      {/* Grid with dense packing to eliminate gaps */}
      <div className="flex justify-center px-2 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(120px,auto)] max-w-6xl w-full grid-flow-dense">
          {sizedImages.map((img, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all ${
                img.sizeType === "large" ? "md:col-span-2 md:row-span-2" :
                img.sizeType === "horizontal" ? "md:col-span-2" : ""
              }`}
              whileHover={{ scale: 1.03 }}
              onClick={() => openLightbox(img, index)}
              layout
            >
              <img
                src={img.src}
                alt={`Gallery Image ${img.id}`}
                className={`w-full h-full object-cover ${
                  img.sizeType === "horizontal" ? "aspect-[16/9]" :
                  img.sizeType === "large" ? "aspect-square" : "aspect-[4/3]"
                }`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Lightbox */}
      {selectedImg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={closeLightbox}
        >
          <div 
            className="relative w-full max-w-5xl h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              src={selectedImg.src}
              alt="Selected Image"
              className="max-w-full max-h-[90vh] object-contain mx-auto cursor-default"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation Arrows - Bottom position for all screens */}
            <button
              onClick={goPrev}
              className="absolute left-4 top-[90%] transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goNext}
              className="absolute right-4 top-[90%] transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Close Button - Top right with more spacing */}
            <button
              onClick={closeLightbox}
              className="absolute top-8 right-8 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Close gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Index Indicator - Centered at bottom */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {sizedImages.length}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}