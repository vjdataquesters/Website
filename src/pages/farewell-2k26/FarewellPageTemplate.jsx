import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  commonJourneyPhotos,
  defaultJuniorComments,
} from "./farewellContent";
import "./FarewellStyles.css";

gsap.registerPlugin(ScrollTrigger);

function FarewellPageTemplate({
  title = "Member",
  subtitle = "A journey that shaped us all.",
  role = "Core Team",
  photoSrc,
  juniorsComments,
  journeyPhotos,
}) {
  console.log("🎬 FarewellPageTemplate loaded for:", title);
  const [introComplete, setIntroComplete] = useState(false);
  const [showProfileFallback, setShowProfileFallback] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const memoriesContainerRef = useRef(null);
  const lightboxRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  const profilePhoto = photoSrc || `/teamImages/${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.png`;
  const comments = juniorsComments?.length ? juniorsComments : defaultJuniorComments;
  const gallery = journeyPhotos?.length ? journeyPhotos : commonJourneyPhotos;

  // ===================== GENERATE RANDOM MEMORY PHOTOS =====================
  const generateMemoryPhotos = () => {
    const photos = [];
    const photoCount = 12;
    for (let i = 0; i < photoCount; i++) {
      const randomX = Math.random() * (window.innerWidth - 160);
      const randomY = Math.random() * (window.innerHeight - 200);
      const randomRotation = Math.random() * 24 - 12;
      const randomSize = Math.random() * 80 + 80;

      photos.push({
        id: i,
        src: gallery[i % gallery.length]?.src || gallery[0]?.src,
        x: randomX,
        y: randomY,
        rotation: randomRotation,
        size: randomSize,
      });
    }
    return photos;
  };

  const memoryPhotos = generateMemoryPhotos();
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      if (cursorDotRef.current) {
        gsap.to(cursorDotRef.current, {
          left: clientX,
          top: clientY,
          duration: 0,
        });
      }
      if (cursorRingRef.current) {
        gsap.to(cursorRingRef.current, {
          left: clientX,
          top: clientY,
          duration: 0.1,
        });
      }
    };

    const handleMouseEnter = (e) => {
      if (e.target.closest("button, a, [data-interactive]")) {
        if (cursorRingRef.current) {
          gsap.to(cursorRingRef.current, {
            width: 38,
            height: 38,
            borderColor: "rgba(45, 212, 191, 0.4)",
            backgroundColor: "rgba(45, 212, 191, 0.1)",
            duration: 0.3,
          });
        }
      }
    };

    const handleMouseLeave = (e) => {
      if (e.target.closest("button, a, [data-interactive]")) {
        if (cursorRingRef.current) {
          gsap.to(cursorRingRef.current, {
            width: 22,
            height: 22,
            borderColor: "rgba(45, 212, 191, 0.6)",
            backgroundColor: "transparent",
            duration: 0.3,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, []);

  // ===================== OPENING SEQUENCE SCREENPLAY =====================
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const tl = gsap.timeline();

    // T=0ms: Pure black (nothing to do)

    // T=800ms: Grid fade in (1200ms duration)
    tl.to(
      ".intro-grid",
      { opacity: 0.05, duration: 1.2, ease: "power2.inOut" },
      0.8
    );

    // T=1000ms: Photos spawn with stagger
    memoryPhotos.forEach((photo, index) => {
      const photoEl = canvas.querySelector(`[data-photo-id="${photo.id}"]`);
      if (!photoEl) return;

      tl.fromTo(
        photoEl,
        {
          scale: 0.6,
          opacity: 0,
          filter: "blur(8px)",
        },
        {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "back.out",
        },
        1.0 + index * 0.22
      );

      // Float animation
      gsap.to(photoEl, {
        y: gsap.utils.random(-10, 10),
        duration: gsap.utils.random(4, 7),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.0 + index * 0.22,
      });
    });

    // T=~4000ms: Photos fly outward
    tl.to(
      ".intro-photo",
      {
        x: (index, target) => {
          const rect = target.getBoundingClientRect();
          const centerX = window.innerWidth / 2;
          const direction = rect.left > centerX ? 1 : -1;
          return direction * window.innerWidth;
        },
        y: (index, target) => {
          const rect = target.getBoundingClientRect();
          const centerY = window.innerHeight / 2;
          const direction = rect.top > centerY ? 1 : -1;
          return direction * window.innerHeight;
        },
        opacity: 0,
        duration: 1,
        ease: "power2.in",
      },
      4.0
    );

    // T=4300ms: VJDQ appears character by character
    const nameChars = canvas.querySelectorAll(".intro-name-char");
    tl.fromTo(
      nameChars,
      { translateY: 30, opacity: 0 },
      { translateY: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      4.3
    );

    // Name glow pulse
    tl.to(
      ".intro-name",
      {
        textShadow: [
          "0 0 60px rgba(45, 212, 191, 0.6), 0 0 120px rgba(45, 212, 191, 0.3)",
          "0 0 100px rgba(45, 212, 191, 0.4), 0 0 180px rgba(45, 212, 191, 0.15)",
          "0 0 60px rgba(45, 212, 191, 0.6), 0 0 120px rgba(45, 212, 191, 0.3)",
        ],
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
      },
      4.3
    );

    // T=4300ms: Subtitle line + text
    tl.fromTo(
      ".intro-subtitle-line",
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
      4.8
    );

    tl.to(".intro-subtitle", { opacity: 1, duration: 0.6 }, 4.8);

    // T=6500ms: VJDQ + photos FADE OUT
    tl.to(
      [".intro-name", ".intro-photo"],
      { opacity: 0, duration: 0.8, ease: "power2.inOut" },
      6.5
    );

    // T=7300ms: Word sequence "WILL NEVER FORGET..."
    const words = ["WILL", "NEVER", "FORGET", "WHAT", "YOU", "LEFT", "BEHIND"];
    const wordElement = canvas.querySelector(".intro-word");

    words.forEach((word, index) => {
      const wordStartTime = 7.3 + index * 1.2;

      tl.call(
        () => {
          if (wordElement) wordElement.textContent = word;
        },
        null,
        wordStartTime
      );

      tl.fromTo(
        wordElement,
        { scale: 1.4, opacity: 0, filter: "blur(12px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power2.out" },
        wordStartTime
      );

      tl.to(
        wordElement,
        { opacity: 0, duration: 0.15, ease: "power2.in" },
        wordStartTime + 0.85
      );
    });

    // T=12400ms: Photos reappear
    tl.fromTo(
      ".intro-photo",
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.inOut" },
      12.4
    );

    // Reset photo positions and restart float
    tl.call(
      () => {
        memoryPhotos.forEach((photo) => {
          const photoEl = canvas.querySelector(
            `[data-photo-id="${photo.id}"]`
          );
          if (!photoEl) return;
          gsap.set(photoEl, {
            x: 0,
            y: 0,
          });
        });
      },
      null,
      12.4
    );

    // T=13000ms: Name reappears and STAYS
    tl.to(".intro-name", { opacity: 1, duration: 0.6 }, 13.0);
    tl.to(".intro-subtitle", { opacity: 1, duration: 0.6 }, 13.0);
    tl.to(".intro-scroll-hint", { opacity: 0.5, duration: 1, repeat: -1, yoyo: true }, 13.6);

    // Set intro complete after timeline finishes (add buffer for last animation)
    tl.call(() => {
      gsap.to(canvas, { position: "relative", duration: 0.1 });
      setIntroComplete(true);
    }, null, 14.5);
  }, [memoryPhotos]);

  // ===================== SECTION 1: STORY =====================
  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target === section1Ref.current) {
          const photoClip = section1Ref.current.querySelector(".story-photo-clip");
          const storyQuote = section1Ref.current.querySelector(".story-quote");

          if (photoClip) {
            gsap.fromTo(
              photoClip,
              { clipPath: "inset(100% 0 0 0)" },
              {
                clipPath: "inset(0% 0 0 0)",
                duration: 0.9,
                ease: "power2.out",
              }
            );
          }

          if (storyQuote) {
            gsap.fromTo(
              storyQuote,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.3,
              }
            );
          }

          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
    });

    if (section1Ref.current) {
      observer.observe(section1Ref.current);
    }

    return () => {
      if (section1Ref.current) {
        observer.unobserve(section1Ref.current);
      }
    };
  }, [introComplete]);

  // ===================== SECTION 2: JUNIOR TRIBUTES (WHATSAPP CHAT) =====================
  useEffect(() => {
    const playoutChatSequence = () => {
      const messages = [];
      comments.forEach((comment, index) => {
        messages.push({
          id: index,
          name: comment.name,
          text: comment.text,
        });
      });

      const tl = gsap.timeline();
      messages.forEach((msg, index) => {
        const typingDelay = index * 2.2;

        // Typing bubble appears
        tl.fromTo(
          section2Ref.current?.querySelector(
            `.chat-typing-bubble[data-msg-id="${msg.id}"]`
          ),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3 },
          typingDelay
        );

        // Typing duration 1200–1800ms (randomized)
        const typingDuration = gsap.utils.random(1.2, 1.8);
        tl.to({}, {}, typingDelay + typingDuration);

        // Typing disappears
        tl.to(
          section2Ref.current?.querySelector(
            `.chat-typing-bubble[data-msg-id="${msg.id}"]`
          ),
          { opacity: 0, y: -10, duration: 0.2 },
          typingDelay + typingDuration
        );

        // Message bubble slides in from left
        tl.fromTo(
          section2Ref.current?.querySelector(
            `.chat-message-bubble[data-msg-id="${msg.id}"]`
          ),
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
          typingDelay + typingDuration + 0.1
        );

        // Wait before next
        tl.to({}, {}, typingDelay + typingDuration + 0.7);
      });

      // System message at end
      tl.fromTo(
        section2Ref.current?.querySelector(".chat-system-message"),
        { opacity: 0 },
        { opacity: 1, duration: 0.6 }
      );
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target === section2Ref.current) {
          playoutChatSequence();
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.2,
    });

    if (section2Ref.current && introComplete) {
      observer.observe(section2Ref.current);
    }

    return () => {
      if (section2Ref.current) {
        observer.unobserve(section2Ref.current);
      }
    };
  }, [introComplete, comments]);

  // ===================== SECTION 3: CLUB MEMORIES =====================
  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target === section4Ref.current) {
          const heading = section4Ref.current.querySelector(".memories-heading-underline");
          if (heading) {
            gsap.fromTo(
              heading,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.8,
                ease: "power2.inOut",
              }
            );
          }

          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
    });

    if (section4Ref.current) {
      observer.observe(section4Ref.current);
    }

    return () => {
      if (section4Ref.current) {
        observer.unobserve(section4Ref.current);
      }
    };
  }, [introComplete]);

  // ===================== LIGHTBOX =====================
  const openLightbox = (imageSrc) => {
    if (lightboxRef.current) {
      const img = lightboxRef.current.querySelector(".lightbox-image");
      if (img) {
        img.src = imageSrc;
      }
      gsap.to(lightboxRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.35,
      });
    }
  };

  const closeLightbox = () => {
    if (lightboxRef.current) {
      gsap.to(lightboxRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.35,
      });
    }
  };

  // ===================== LIGHTBOX KEYBOARD SUPPORT =====================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && lightboxRef.current) {
        const lightbox = lightboxRef.current;
        if (lightbox.style.opacity !== "0" && lightbox.style.pointerEvents !== "none") {
          closeLightbox();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ===================== RENDER =====================
  return (
    <div ref={containerRef} className="farewell-root">
      {/* ===== CUSTOM CURSOR ===== */}
      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorRingRef} className="cursor-ring" />

      {/* ===== INTRO CANVAS (FIXED UNTIL COMPLETE) ===== */}
      <div 
        ref={canvasRef} 
        className="intro-canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#0b2a30",
          zIndex: 1000,
          overflow: "hidden"
        }}
      >
        {/* Grid texture */}
        <div className="intro-grid" />

        {/* Memory Photos */}
        {memoryPhotos.map((photo) => (
          <div
            key={photo.id}
            className="intro-photo"
            data-photo-id={photo.id}
            style={{
              left: `${photo.x}px`,
              top: `${photo.y}px`,
              transform: `rotate(${photo.rotation}deg)`,
              width: `${photo.size}px`,
              aspectRatio: "1",
            }}
          >
            <img
              src={photo.src}
              alt={`Memory ${photo.id}`}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        ))}

        {/* Center Dynamic Word */}
        <div className="intro-word-container">
          <div className="intro-word"></div>
        </div>

        {/* Name Display */}
        <div className="intro-name">
          {title.split("").map((char, i) => (
            <span key={i} className="intro-name-char">
              {char}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <div className="intro-subtitle-line" />
        <p className="intro-subtitle">2K26 · FAREWELL</p>

        {/* Scroll Hint */}
        <p className="intro-scroll-hint">↓ scroll</p>
      </div>

      {/* ===== SCROLLABLE CONTENT (VISIBLE AFTER INTRO) ===== */}
      {introComplete && (
        <>
          {/* ===== SECTION 1: THEIR STORY ===== */}
          <section ref={section1Ref} className="section-story">
            <div className="story-container">
              {/* Portrait */}
              <div className="story-photo-wrapper">
                <div className="story-photo-clip">
                  <img
                    src={profilePhoto}
                    alt={title}
                    className="story-photo"
                    onError={() => setShowProfileFallback(true)}
                  />
                  {showProfileFallback && (
                    <div className="story-photo-fallback">
                      {title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="story-photo-overlay">
                  <h2 className="story-name">{title}</h2>
                  <p className="story-role">{role}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="story-quote-wrapper">
                <div className="quote-mark-left">"</div>
                <p className="story-quote">{subtitle}</p>
              </div>
            </div>

            {/* Particle Field */}
            <div className="particle-field">
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 8}s`,
                  }}
                />
              ))}
            </div>
          </section>

          {/* ===== SECTION 2: JUNIOR TRIBUTES (WHATSAPP CHAT) ===== */}
          <section ref={section2Ref} className="section-chat">
            <div className="chat-window">
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-info">
                  <div className="chat-avatar">VJDQ</div>
                  <div>
                    <h3 className="chat-title">VJDQ Group</h3>
                    <p className="chat-subtitle">The juniors have something to say...</p>
                  </div>
                  <div className="chat-status-dot" />
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {comments.map((comment, index) => (
                  <div key={index}>
                    {/* Typing Bubble */}
                    <div
                      className="chat-typing-bubble"
                      data-msg-id={index}
                      style={{ opacity: 0 }}
                    >
                      <div className="avatar" style={{
                        background: "linear-gradient(135deg, #9b59b6, #2dd4bf)",
                      }}>
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="typing-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className="chat-message-bubble"
                      data-msg-id={index}
                      style={{ opacity: 0 }}
                    >
                      <div className="avatar" style={{
                        background: "linear-gradient(135deg, #9b59b6, #2dd4bf)",
                      }}>
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="bubble">
                        {index === 0 && (
                          <div className="sender-name">{comment.name}</div>
                        )}
                        <div className="message-text">{comment.text}</div>
                        <div className="message-time">Recently</div>
                        <div className="message-ticks">✓✓</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* System Message */}
                <div className="chat-system-message" style={{ opacity: 0 }}>
                  <div className="system-lock">🔒</div>
                  <p>Messages are end-to-end memories</p>
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 3: CLUB MEMORIES ===== */}
          <section ref={section4Ref} className="section-memories">
            <div className="memories-header">
              <h2 className="memories-title">
                Club Memories
                <span className="memories-heading-underline" />
              </h2>
            </div>

            {/* Filmstrip */}
            <div ref={memoriesContainerRef} className="memories-filmstrip">
              {gallery.map((photo, index) => (
                <div
                  key={index}
                  className="filmstrip-item"
                  onClick={() => openLightbox(photo.src)}
                  data-interactive
                >
                  <img src={photo.src} alt={photo.title} />
                  <div className="filmstrip-overlay">
                    <h3 className="filmstrip-title">{photo.title}</h3>
                    <p className="filmstrip-caption">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Dots */}
            <div className="memories-dots">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  className="memory-dot"
                  aria-label={`Memory ${index + 1}`}
                  data-interactive
                />
              ))}
            </div>
          </section>

          {/* ===== LIGHTBOX ===== */}
          <div ref={lightboxRef} className="lightbox">
            <div className="lightbox-content">
              <button
                className="lightbox-close"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                ×
              </button>
              <img src="" alt="Memory" className="lightbox-image" />
              <button className="lightbox-nav lightbox-prev" aria-label="Previous">
                ←
              </button>
              <button className="lightbox-nav lightbox-next" aria-label="Next">
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FarewellPageTemplate;
