import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { galleryImages } from "../data/galleryImages"; 

export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numColumns, setNumColumns] = useState(4);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setNumColumns(2); 
      else if (window.innerWidth < 1024) setNumColumns(3); 
      else setNumColumns(4); 
    };

    updateColumns(); 
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  
  const columns = Array.from({ length: numColumns }, () => []);
  galleryImages.forEach((img, index) => {
    columns[index % numColumns].push({ ...img, originalIndex: index });
  });

  const openLightbox = (img, index) => {
    setSelectedImg(img);
    setCurrentIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImg(null);
    document.body.style.overflow = "auto";
  };

  const goNext = (e) => {
    e?.stopPropagation();
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setSelectedImg(galleryImages[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const goPrev = (e) => {
    e?.stopPropagation();
    const prevIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImg(galleryImages[prevIndex]);
    setCurrentIndex(prevIndex);
  };

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImg) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          goNext(e);
          break;
        case "ArrowLeft":
          goPrev(e);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImg, currentIndex]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f323f] mb-4">
          Our Gallery
        </h1>
        <p className="text-gray-600 text-lg">
          A visual journey through our events, hackathons, and community gatherings.
        </p>
      </div>

      {/* Dynamic Flex Masonry Layout */}
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-row gap-4 sm:gap-6 items-start justify-center">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-4 sm:gap-6 flex-1 w-full">
              {col.map((img) => (
                <motion.div
                  key={img.originalIndex}
                  // Container scale and shadow trigger
                  className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-gray-200 w-full"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => openLightbox(img, img.originalIndex)}
                  layout
                >
                  {/* Image Zoom */}
                  <img
                    src={img.src}
                    alt={`Gallery Image ${img.id || img.originalIndex}`}
                    className="w-full h-auto object-cover block transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Text Overlay Fade-In */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 sm:pb-8 px-4 text-center">
                    <span className="text-white font-medium tracking-wide text-sm sm:text-base drop-shadow-md line-clamp-2">
                      {img.title || "View Capture"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeLightbox}
          >
            <div
              className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-20 right-4 sm:top-20 sm:right-8 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-50"
                aria-label="Close gallery"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Main Image */}
              <motion.img
                key={currentIndex}
                src={selectedImg.src}
                alt="Selected Image"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />

              {/* Navigation Controls */}
              <div className="absolute bottom-8 flex items-center gap-6">
                <button
                  onClick={goPrev}
                  className="bg-white/10 hover:bg-white/20 text-white p-3.5 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium">
                  {currentIndex + 1} / {galleryImages.length}
                </div>

                <button
                  onClick={goNext}
                  className="bg-white/10 hover:bg-white/20 text-white p-3.5 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


