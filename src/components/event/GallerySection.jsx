import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function GallerySection({ pics, eventName }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev + 1) % pics.length);
    }
  }, [lightboxIndex, pics.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev - 1 + pics.length) % pics.length);
    }
  }, [lightboxIndex, pics.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, goNext, goPrev]);

  if (!pics?.length) return null;

  return (
    <section id="gallery" className="scroll-mt-28">
      <div className="mb-12 text-center">
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 border border-cyan-400/20">
          Moments
        </span>
        <h2 className="mt-3 font-[Poppins] text-3xl font-black text-white sm:text-4xl tracking-tight">
          Captured Memories
        </h2>
        <p className="mt-2 text-base text-slate-400 max-w-md mx-auto">
          Immersive snapshots capturing energy, collaboration, and learning.
        </p>
      </div>

      {/* Modern CSS Masonry columns layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance] w-full">
        {pics.map((pic, index) => (
          <div key={index} className="break-inside-avoid mb-6">
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden rounded-2xl bg-white/5 w-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 block"
            >
              {!loadedImages.has(index) && (
                <div className="absolute inset-0 z-20 animate-pulse bg-[#0f323f]/10" />
              )}

              <img
                src={pic}
                alt={`${eventName} - ${index + 1}`}
                loading="lazy"
                onLoad={() => setLoadedImages((prev) => new Set(prev).add(index))}
                className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.04] block"
                draggable={false}
              />

              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a2530]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#0f323f] opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <ZoomIn size={16} />
              </div>
            </motion.button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 border border-white/10"
              aria-label="Close gallery"
            >
              <X size={20} />
            </button>

            {pics.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 border border-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 border border-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              src={pics[lightboxIndex]}
              alt={`${eventName} - ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />

            <p className="absolute bottom-6 text-sm font-semibold tracking-wider text-white/60 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              {lightboxIndex + 1} / {pics.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
