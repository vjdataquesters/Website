import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { farewellData } from "./farewell-data";

const INTRO_MANIFEST_PATH = "/farewell-2k26/intro/manifest.json";

function buildIntroImagePool(slug) {
    if (!slug) return [];

    const fallbackCommon = [
        "/farewell-2k26/intro/common/20260109_160012.jpg.jpeg",
        "/farewell-2k26/intro/common/image copy 2.png",
        "/farewell-2k26/intro/common/image copy.png",
        "/farewell-2k26/intro/common/image.png",
        "/farewell-2k26/intro/common/IMG-20260410-WA0078.jpg.jpeg",
    ];

    // Fallback if manifest is missing: use known valid shared photos only.
    return fallbackCommon;
}

function shuffleArray(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildIntroImagePoolFromManifest(manifest, slug) {
    if (!slug || !manifest) return [];

    const common = shuffleArray(Array.isArray(manifest.common) ? manifest.common : []);
    const individualBySlug = manifest.individual && typeof manifest.individual === "object"
        ? manifest.individual[slug]
        : [];
    const individual = shuffleArray(Array.isArray(individualBySlug) ? individualBySlug : []);

    let commonCount = common.length <= 2
        ? common.length
        : 2 + Math.floor(Math.random() * 2); // 2 or 3

    const selectedIndividual = individual.slice(0, 12 - commonCount);
    
    if (selectedIndividual.length + commonCount < 12) {
        commonCount = Math.min(common.length, 12 - selectedIndividual.length);
    }

    const selectedCommon = common.slice(0, commonCount);

    return [...selectedCommon, ...selectedIndividual];
}

function preloadImages(urls, timeoutMs = 1200) {
    if (!urls || urls.length === 0) return Promise.resolve();

    const loadPromises = urls.map((url) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = encodeURI(url);
    }));

    const timeout = new Promise((resolve) => {
        setTimeout(resolve, timeoutMs);
    });

    return Promise.race([Promise.allSettled(loadPromises), timeout]);
}

function buildRandomHighlightBuckets(photoCount, wordCount = 7) {
    const buckets = Array.from({ length: wordCount }, () => []);
    if (photoCount <= 0) return buckets;

    const ids = Array.from({ length: photoCount }, (_, i) => i);
    const shuffled = shuffleArray(ids);

    const ensured = Math.min(wordCount, shuffled.length);
    for (let i = 0; i < ensured; i++) {
        buckets[i].push(shuffled[i]);
    }

    for (let i = ensured; i < shuffled.length; i++) {
        const w = Math.floor(Math.random() * wordCount);
        buckets[w].push(shuffled[i]);
    }

    return buckets;
}

export default function FarewellPage() {
  const { name } = useParams();
    const slug = name?.toLowerCase();
  const person = farewellData[name?.toLowerCase()];
    const [introManifest, setIntroManifest] = useState(null);
    const baseIntroImages = useMemo(() => {
        if (!person) return [];

        const slug = name?.toLowerCase();
        const manifestPool = buildIntroImagePoolFromManifest(introManifest, slug);

        return person.introImages?.length
            ? person.introImages
            : (
                manifestPool.length > 0
                    ? manifestPool
                    : buildIntroImagePool(slug)
            );
    }, [person, name, introManifest]);

    const introImages = useMemo(() => {
        if (baseIntroImages.length === 0) return [];
        return shuffleArray(baseIntroImages);
    }, [baseIntroImages]);

    const galleryImages = useMemo(() => {
        let result = [];
        const manifestIndividual = introManifest?.individual?.[slug];
        if (Array.isArray(manifestIndividual) && manifestIndividual.length > 0) {
            result = [...manifestIndividual];
        }

        const manifestCommon = introManifest?.common;
        if (Array.isArray(manifestCommon) && manifestCommon.length > 0) {
            result = [...result, ...manifestCommon];
        }

        return result;
    }, [introManifest, slug]);

    const galleryDeck = useMemo(() => {
        const shuffled = shuffleArray(galleryImages);
        return shuffled.map((src, idx) => ({
            src,
            tilt: (idx % 2 === 0 ? -1 : 1) * (2 + (idx % 3)),
            lift: idx % 3 === 0 ? -10 : idx % 3 === 1 ? -4 : -7,
            delay: 0.08 * (idx % 10),
            hue: idx % 4,
        }));
    }, [galleryImages]);

  // Movie Sequence States
  const [stage, setStage] = useState('init');
  const [currentWord, setCurrentWord] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [positions, setPositions] = useState([]);
    const [wordHighlightBuckets, setWordHighlightBuckets] = useState(Array.from({ length: 7 }, () => []));
  const [lightboxIndex, setLightboxIndex] = useState(null);
        const [activeIntroImages, setActiveIntroImages] = useState([]);

    useEffect(() => {
        let isCancelled = false;

        const loadIntroManifest = async () => {
            try {
                const res = await fetch(`${INTRO_MANIFEST_PATH}?v=${Date.now()}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!isCancelled) {
                    setIntroManifest(data);
                }
            } catch (_) {
                // Keep silent fallback to legacy naming.
            }
        };

        loadIntroManifest();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if (lightboxIndex === null) return;
        if (galleryDeck.length === 0) {
            setLightboxIndex(null);
            return;
        }
        if (lightboxIndex >= galleryDeck.length) {
            setLightboxIndex(0);
        }
    }, [lightboxIndex, galleryDeck]);

  // Section Refs for scroll tracking
  const storyRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, amount: 0.3 });

  const chatRef = useRef(null);
  const chatInView = useInView(chatRef, { once: true, amount: 0.3 });

  const galleryRef = useRef(null);
  const galleryInView = useInView(galleryRef, { once: true, amount: 0.3 });

  // Chat States
  const [chatStarted, setChatStarted] = useState(false);
  const [typedHeading, setTypedHeading] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(null);
  const [sysMessage, setSysMessage] = useState(false);
  const chatBodyRef = useRef(null);
    const sequenceStartedFor = useRef(null);
        const mouseRafRef = useRef(null);
        const lastMouseRef = useRef({ x: 0, y: 0 });
  
  // Parallax state (basic mouse tracking)
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Phase 1 - 3x3 Config
  const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setActiveIntroImages([]);
    }, [name]);

    useEffect(() => {
        if (!person) return;
        if (introImages.length === 0) return;
        if (stage !== 'init') return;

        // Allow manifest-driven pool to replace initial fallback while still in init.
        setActiveIntroImages(introImages);
    }, [person, introImages, stage]);

  useEffect(() => {
        if (!person) return;

        const readyIntroImages = activeIntroImages.length > 0 ? activeIntroImages : introImages;
        if (readyIntroImages.length === 0) return;
        if (sequenceStartedFor.current === name) return;
        sequenceStartedFor.current = name;

    const W = window.innerWidth;
    const mobileMode = W < 768;
    setIsMobile(mobileMode);

    // Generate positions mapping zones cleanly without overlaps
    const generatePhotoPositions = () => {
        const H = window.innerHeight;
        const cx = W / 2;
        const cy = H / 2;
        const placed = [];
        
        if (mobileMode) {
            // Mobile: 3x3 Grid covering the screen
            const mobilePushDirs = [
                { x: -W*1.1, y: -H*1.1 },
                { x: 0,       y: -H*1.2 },
                { x: W*1.1,  y: -H*1.1 },
                { x: -W*1.2, y: 0 },
                { x: 0,       y: 0 }, // Center tile goes nowhere
                { x: W*1.2,  y: 0 },
                { x: -W*1.1, y: H*1.1 },
                { x: 0,       y: H*1.2 },
                { x: W*1.1,  y: H*1.1 }
            ];
            
            const gap = 3;
            const tileW = (W - gap * 2) / 3;
            const tileH = (H - gap * 2) / 3;
            // Spiral indexing delay:
            const spiralOrder = [0, 2, 6, 8, 1, 3, 5, 7, 4];
            
            return Array.from({length: 9}).map((_, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                
                return {
                    id: i,
                    x: col * (tileW + gap),
                    y: row * (tileH + gap),
                    width: tileW,
                    height: tileH,
                    pushedX: mobilePushDirs[i].x,
                    pushedY: mobilePushDirs[i].y,
                    size: tileW, // approximate
                    rotation: 0,
                    floatDuration: 0,
                    depth: 0,
                    spawnDelay: spiralOrder.indexOf(i) * 0.1,
                    isCenter: i === 4
                };
            });
        }
        
        const zones = [
            { xMin:10,      xMax:W*0.22,  yMin:10,      yMax:H*0.38 },
            { xMin:W*0.38,  xMax:W*0.62,  yMin:10,      yMax:H*0.18 },
            { xMin:W*0.78,  xMax:W-150,   yMin:10,      yMax:H*0.38 },
            { xMin:10,      xMax:W*0.18,  yMin:H*0.3,   yMax:H*0.7  },
            { xMin:W*0.82,  xMax:W-150,   yMin:H*0.3,   yMax:H*0.7  },
            { xMin:10,      xMax:W*0.22,  yMin:H*0.62,  yMax:H-150  },
            { xMin:W*0.38,  xMax:W*0.62,  yMin:H*0.78,  yMax:H-150  },
            { xMin:W*0.78,  xMax:W-150,   yMin:H*0.62,  yMax:H-150  },
            { xMin:10,      xMax:W*0.14,  yMin:H*0.08,  yMax:H*0.28 },
            { xMin:W*0.86,  xMax:W-150,   yMin:H*0.08,  yMax:H*0.28 },
            { xMin:10,      xMax:W*0.14,  yMin:H*0.68,  yMax:H*0.88 },
            { xMin:W*0.86,  xMax:W-150,   yMin:H*0.68,  yMax:H*0.88 },
        ];

        function overlaps(newPos, size) {
            return placed.some(p => {
                const MathAbs = Math.abs;
                const dx = MathAbs(newPos.x - p.x);
                const dy = MathAbs(newPos.y - p.y);
                const minDist = (size + p.size) / 2 + 20; // 20px padding
                return dx < minDist && dy < minDist;
            });
        }

        return zones.map((z, i) => {
            const size = 80 + Math.random() * 70;
            let pos, attempts = 0;
            do {
                pos = {
                    x: z.xMin + Math.random() * Math.max(z.xMax - z.xMin - size, 0),
                    y: z.yMin + Math.random() * Math.max(z.yMax - z.yMin - size, 0),
                };
                attempts++;
            } while (overlaps(pos, size) && attempts < 20);
            
            const dx = pos.x - cx;
            const dy = pos.y - cy;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            const final = { 
                id: i,
                x: pos.x, 
                y: pos.y, 
                pushedX: dist < 280 ? dx * 2.5 : 0, 
                pushedY: dist < 280 ? dy * 2.5 : 0, 
                size, 
                rotation: (Math.random() * 24) - 12,
                floatDuration: 3 + Math.random() * 3,
                depth: 0.5 + (i % 3) * 0.5,
                spawnDelay: i * 0.22,
                isCenter: false
            };
            placed.push(final);
            return final;
        });
    };
    
    setPositions(generatePhotoPositions());
    setWordHighlightBuckets(buildRandomHighlightBuckets(mobileMode ? 9 : 12, 7));

    document.body.style.overflowY = 'hidden';

    const runSequence = async () => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));

        await preloadImages(readyIntroImages.slice(0, 12), 700);

        setStage('canvas_in');
        await sleep(1300);

        setStage('photos_spawn');
        await sleep(2500); // tightened for better sync and snappier pacing

        setStage('push_and_name');
        await sleep(2600); 

        setStage('fade_out');
        await sleep(1300);

        setStage('words');
        const words = ['WILL','NEVER','FORGET','WHAT','YOU','LEFT','BEHIND'];
        
        for (let idx = 0; idx < words.length; idx++) {
            setCurrentWordIndex(idx);
            setCurrentWord(words[idx]);
            await sleep(620); // slower word hold
            setCurrentWord(null);
            await sleep(260); // slower transition gap
        }
        setCurrentWordIndex(-1);
        await sleep(900);

        setStage('return');
        await sleep(3400);

        setStage('page');
        document.body.style.overflowY = 'auto';
    };

    runSequence();

    const handleMouse = (e) => {
        if (window.matchMedia('(pointer:fine)').matches) {
            lastMouseRef.current = {
                x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
                y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
            };

            if (mouseRafRef.current !== null) return;
            mouseRafRef.current = requestAnimationFrame(() => {
                setMouse(lastMouseRef.current);
                mouseRafRef.current = null;
            });
        }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => {
        document.body.style.overflowY = 'auto';
        window.removeEventListener('mousemove', handleMouse);
        if (mouseRafRef.current !== null) {
            cancelAnimationFrame(mouseRafRef.current);
            mouseRafRef.current = null;
        }
    };
    }, [person, name, activeIntroImages, introImages]);

  // Chat simulation effect
  useEffect(() => {
    if (chatInView && !chatStarted && person) {
        setChatStarted(true);
        const playFullChat = async () => {
            const sleep = ms => new Promise(r => setTimeout(r, ms));
            const headingText = "What the Juniors Say";
            
            for(let i=1; i<=headingText.length; i++) {
                setTypedHeading(headingText.substring(0, i));
                await sleep(80);
            }
            await sleep(500);
            setShowSubtitle(true);

            for(let i=0; i<person.juniorsComments.length; i++) {
                const c = person.juniorsComments[i];
                setTypingIndicator(c);
                await sleep(1400 + Math.random()*400);
                setTypingIndicator(null);
                setVisibleMessages(prev => [...prev, c]);
                await sleep(700);
            }
            await sleep(800);
            setSysMessage(true);
        };
        playFullChat();
    }
  }, [chatInView, chatStarted, person]);

  // Auto-scroll chat
  useEffect(() => {
    if(chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [visibleMessages, typingIndicator]);

  if (!person) return <Navigate to="/farewell-2k26" replace />;

  const isMovieActive = stage !== 'page';
  const isPostMovie = stage === 'page';

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--white)', overflowX: 'hidden', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* PHASE 1: CANVAS */}
      <motion.div 
        className="grid-bg" 
        style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', zIndex:100, overflow:'hidden', pointerEvents: isMovieActive ? 'auto' : 'none' }}
        animate={{ opacity: stage !== 'init' ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
            style={{ position:'absolute', inset:0, zIndex: 1 }}
            animate={{ opacity: stage === 'fade_out' ? 0 : 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            {positions.map((pos) => {
                const isSpawned = stage !== 'init' && stage !== 'canvas_in';
                const isPushed = stage === 'push_and_name' || stage === 'fade_out';
                const isInWords = stage === 'words';
                const isHighlightedWord = isInWords && currentWordIndex !== -1 && wordHighlightBuckets[currentWordIndex]?.includes(pos.id);
                
                let targetX = 0;
                let targetY = 0;
                let currentScale = isSpawned ? 1 : (isMobile ? 0.85 : 0.6);
                let currentOpacity = isSpawned ? 1 : 0;
                let currentFilter = isSpawned ? 'blur(0px) brightness(1) saturate(1)' : (isMobile ? 'blur(0px) brightness(1) saturate(1)' : 'blur(3px) brightness(1) saturate(1)');
                let currentBoxShadow = isMobile ? 'none' : '0 8px 24px rgba(0,0,0,0.5)';
                let photoZIndex = (isMobile && pos.isCenter) ? 5 : 1;

                if (isMobile) {
                    if (isPushed) {
                        if (pos.isCenter) {
                            currentScale = 8;
                            currentOpacity = 0;
                        } else {
                            currentScale = 0.7;
                            currentOpacity = 0;
                        }
                    }
                    if (isInWords) {
                        currentOpacity = 1;
                        if (isHighlightedWord) {
                            currentScale = 1.06;
                            currentFilter = 'brightness(1.3) saturate(1.5)';
                            photoZIndex = 5;
                        } else {
                            currentScale = 1;
                            currentFilter = 'brightness(0.25) saturate(0.2)';
                        }
                    }
                    if (stage === 'return' || stage === 'page') {
                        currentOpacity = 1;
                        currentScale = 1;
                        currentFilter = 'brightness(1) saturate(1)';
                    }
                } else {
                    if (isInWords && currentWordIndex !== -1) {
                        if (isHighlightedWord) {
                            currentScale = 1.08;
                            currentOpacity = 1;
                            currentFilter = 'blur(0px) brightness(1.2) saturate(1.4)';
                            currentBoxShadow = '0 0 30px rgba(45,212,191,0.6)';
                            photoZIndex = 5;
                        } else {
                            currentScale = 0.88;
                            currentOpacity = 0.15;
                            currentFilter = 'blur(0px) brightness(0.4) saturate(0.3)';
                        }
                    }
                }
                
                if (isSpawned) {
                    targetX = isPushed ? pos.pushedX : 0;
                    targetY = isPushed ? pos.pushedY : 0;
                    
                    // Parallax execution logic mapped directly mapped to frames
                    if (isMovieActive && !isPushed) {
                        targetX += mouse.x * 12 * pos.depth;
                        targetY += mouse.y * 8 * pos.depth;
                    }
                }

                return (
                    <motion.div
                        key={pos.id}
                        style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: photoZIndex, width: pos.width, height: pos.height }}
                        initial={{ x: 0, y: 0, scale: isMobile ? 0.85 : 0.6, rotate: pos.rotation, filter: isMobile ? 'blur(0px)' : 'blur(3px)', opacity: 0 }}
                        animate={{ 
                            x: targetX, 
                            y: targetY,
                            scale: currentScale,
                            rotate: pos.rotation,
                            filter: currentFilter,
                            opacity: currentOpacity
                        }}
                        transition={{ 
                            delay: stage === 'photos_spawn' ? pos.spawnDelay : 0,
                            duration: isInWords ? 0.2 : (stage === 'return' ? (isMobile ? 0.4 : 1) : (stage === 'push_and_name' ? 0.6 : 0.6)),
                            ease: isInWords ? "backOut" : (stage === 'push_and_name' ? "easeIn" : "easeOut") 
                        }}
                    >
                        <motion.img 
                            src={activeIntroImages.length > 0 ? encodeURI(activeIntroImages[pos.id % activeIntroImages.length]) : '/logo.png'}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/logo.png';
                            }}
                            animate={isSpawned && !isMobile ? { y: [0, 12, 0] } : {}}
                            transition={{ duration: pos.floatDuration, repeat: Infinity, ease: "easeInOut" }}
                            style={{ 
                                width: isMobile ? '100%' : pos.size, height: isMobile ? '100%' : pos.size, objectFit: 'cover', 
                                border: isMobile ? 'none' : '5px solid white', borderRadius: isMobile ? 0 : 3, 
                                boxShadow: currentBoxShadow,
                                transition: 'box-shadow 0.2s ease-out',
                                willChange: 'transform, opacity'
                            }}
                            loading="eager"
                            decoding="async"
                            alt="memory"
                        />
                    </motion.div>
                );
            })}
        </motion.div>

        {/* NAME DISPLAY */}
        <motion.div 
            style={{ position:'absolute', top:'50%', left:'50%', x:'-50%', y:'-50%', textAlign:'center', zIndex: 10, pointerEvents:'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'push_and_name' ? 1 : 0 }}
            transition={{ duration: stage === 'fade_out' ? 0.8 : 0.1, delay: stage === 'push_and_name' ? 0.3 : 0 }}
        >
            <div style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:900, fontSize:'clamp(80px,12vw,140px)', color:'var(--teal)', textShadow:'0 0 60px rgba(45,212,191,0.7)', display:'flex', gap:'0.05em', alignItems:'center', whiteSpace:'nowrap' }}>
                <motion.img 
                    src="/logo.png" 
                    alt="VJDQ Logo"
                    style={{ width: 'clamp(50px, 7vw, 90px)', height: 'clamp(50px, 7vw, 90px)', objectFit: 'contain', marginRight: '0.15em', filter: 'drop-shadow(0 0 20px rgba(45,212,191,0.6))' }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: stage === 'push_and_name' ? 1 : 0, scale: stage === 'push_and_name' ? 1 : 0.5 }}
                    transition={{ duration: 0.6, ease: "backOut", delay: stage === 'push_and_name' ? 0.3 : 0 }}
                />
                {['V', 'J', 'D', 'Q'].map((char, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: stage === 'push_and_name' ? 1 : 0, y: stage === 'push_and_name' ? 0 : 30 }}
                        transition={{ duration: 0.45, delay: stage === 'push_and_name' ? 0.4 + i*0.08 : 0, ease: "easeOut" }}
                    >
                        {char}
                    </motion.span>
                ))}
            </div>
            <motion.div 
                style={{ height:2, background:'var(--teal)', margin:'16px auto 0' }}
                initial={{ width: 0 }}
                animate={{ width: stage === 'push_and_name' ? 80 : 0 }}
                transition={{ duration: 0.6, delay: stage === 'push_and_name' ? 0.8 : 0, ease: "easeOut" }}
            />
            <motion.div 
                style={{ fontFamily:'Inter, sans-serif', fontSize:'clamp(10px,1.5vw,14px)', color:'var(--muted)', letterSpacing:'8px', marginTop:12 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: stage === 'push_and_name' ? 1 : 0 }}
                transition={{ duration: 0.6, delay: stage === 'push_and_name' ? 1.0 : 0 }}
            >
                2K26 · FAREWELL
            </motion.div>
        </motion.div>

        <motion.div
            style={{
                position:'absolute',
                top:'50%',
                left:'50%',
                x:'-50%',
                y:'-50%',
                textAlign:'center',
                zIndex: 10,
                pointerEvents:'none',
                color:'var(--white)',
                fontSize:'clamp(12px,1.7vw,17px)',
                letterSpacing:'0.12em',
                textTransform:'uppercase',
                background:'rgba(11,42,48,0.75)',
                border:'1px solid rgba(45,212,191,0.35)',
                borderRadius:'999px',
                padding:'10px 16px',
                boxShadow:'0 0 20px rgba(45,212,191,0.18)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={stage === 'page' ? { opacity: [0.75, 1, 0.75], y: 0 } : { opacity: 0, y: 10 }}
            transition={stage === 'page' ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.35, ease: 'easeOut' }}
        >
            Scroll down for memories
        </motion.div>

        {/* WORD DISPLAY */}
        <AnimatePresence>
            {currentWord && (
                <motion.div 
                    key={currentWord}
                    style={{ position:'absolute', top:'50%', left:'50%', x:'-50%', y:'-50%', fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:'clamp(56px,9vw,110px)', color:'var(--white)', textAlign:'center', zIndex: 10, pointerEvents:'none', whiteSpace:'nowrap' }}
                    initial={{ opacity: 0, scale: 1.4, filter: 'blur(12px)', y: 20 }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -15 }}
                    transition={{ 
                        duration: 0.15, ease: "easeOut",
                        exit: { duration: 0.12, ease: "easeIn" } 
                    }}
                >
                    {currentWord}
                </motion.div>
            )}
        </AnimatePresence>

        {/* SCROLL HINT */}
        <motion.div 
            style={{ position:'absolute', bottom:32, left:'50%', x: '-50%', fontSize:13, color:'var(--muted)', letterSpacing:3, zIndex: 10 }}
            animate={stage === 'page' ? { opacity: [0.4, 1, 0.4] } : { opacity: 0 }}
            transition={stage === 'page' ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        >
            ↓ scroll to continue
        </motion.div>
      </motion.div>

      {/* PHASE 2: PAGE CONTENT */}
      <motion.div 
        style={{ marginTop: '100vh', zIndex: 200, position: 'relative' }}
        initial={{ opacity: 0, pointerEvents: 'none' }}
        animate={{ opacity: isPostMovie ? 1 : 0, pointerEvents: isPostMovie ? 'auto' : 'none' }}
        transition={{ duration: 0.8 }}
      >
        {/* STORY SECTION */}
        <section ref={storyRef} className="grid-bg" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 20px', position:'relative' }}>
          <button onClick={() => chatRef.current?.scrollIntoView({behavior: 'smooth'})} style={{ position:'absolute', top:24, right:24, background:'none', border:'none', color:'var(--muted)', fontSize:12, cursor:'pointer', letterSpacing:2 }}>tap to skip ↓</button>

          <motion.img 
             src={person.portrait} alt={person.name} 
             style={{ maxWidth:'min(320px,85vw)', borderRadius:8, border:'1px solid rgba(45,212,191,0.3)', boxShadow:'0 0 30px rgba(45,212,191,0.1)' }}
             initial={{ clipPath: 'inset(100% 0 0 0)' }}
             animate={storyInView ? { clipPath: 'inset(0% 0 0 0)' } : {}}
             transition={{ duration: 0.9, ease: "easeOut" }}
          />
          
          <div style={{ maxWidth:560, width:'100%', textAlign:'center', marginTop:32, position:'relative' }}>
            <div style={{ fontSize:120, color:'rgba(168,85,247,0.15)', position:'absolute', top:-40, left:-10, fontFamily:'Playfair Display, serif', lineHeight:1, pointerEvents:'none' }}>"</div>
            <motion.h2 
                style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'clamp(28px,5vw,48px)', color:'var(--teal)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                {person.name}
            </motion.h2>
            <motion.p 
                style={{ fontSize:13, color:'var(--muted)', letterSpacing:3, textTransform:'uppercase', marginTop:8 }}
                initial={{ opacity: 0, y: 15 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 }}
            >
                {person.role}
            </motion.p>
            <motion.p 
                style={{ fontFamily:'Playfair Display, serif', fontStyle:'italic', fontSize:'clamp(17px,2.5vw,24px)', lineHeight:1.7, marginTop:32 }}
                initial={{ opacity: 0, y: 20 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.8 }}
            >
                {person.quote}
            </motion.p>
          </div>
        </section>

        {/* CHAT SECTION */}
        <section ref={chatRef} className="grid-bg" style={{ minHeight:'100vh', padding:'80px 0' }}>
          <div style={{ textAlign:'center', padding:'0 20px' }}>
            <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:'clamp(28px,5vw,48px)', color:'var(--white)', minHeight: '1.2em' }}>
                {typedHeading}
                {chatStarted && typedHeading.length < "What the Juniors Say".length && <span style={{ color: 'var(--teal)', animation: 'blink 1s infinite' }}>|</span>}
            </h2>
            <motion.p 
                style={{ fontFamily:'Playfair Display, serif', fontStyle:'italic', color:'var(--muted)', marginTop:12, fontSize:16 }}
                animate={{ opacity: showSubtitle ? 1 : 0 }}
                transition={{ duration: 0.8 }}
            >
                The words they leave behind
            </motion.p>
          </div>

          <div style={{ maxWidth:480, width:'calc(100% - 32px)', margin:'40px auto 0', borderRadius:16, border:'1px solid rgba(45,212,191,0.2)', overflow:'hidden' }}>
            <div style={{ background:'var(--bg-card)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(45,212,191,0.15)' }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#9b59b6,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>DQ</div>
              <div><div style={{ fontWeight:600, fontSize:14 }}>VJDQ Group</div><div style={{ fontSize:12, color:'var(--teal)' }}>● online</div></div>
            </div>
            
            <div ref={chatBodyRef} style={{ background:'var(--bg)', padding:16, display:'flex', flexDirection:'column', gap:12, minHeight:200, maxHeight:400, overflowY:'auto' }}>
                <AnimatePresence initial={false}>
                    {visibleMessages.map((msg, i) => (
                        <motion.div 
                            key={i}
                            style={{ display:'flex', alignItems:'flex-end', gap:8 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#9b59b6,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white', flexShrink:0 }}>{msg.initials}</div>
                            <div>
                                <div style={{ fontSize:12, fontWeight:600, color:'var(--teal)', marginBottom:3, marginLeft:4 }}>{msg.name}</div>
                                <div style={{ background:'var(--bg-card)', border:'1px solid rgba(45,212,191,0.15)', borderRadius:'0 18px 18px 18px', padding:'10px 14px', color:'var(--white)', fontSize:15, lineHeight:1.5, whiteSpace:'pre-line' }}>
                                    {msg.comment}
                                    <span style={{ display:'block', fontSize:11, color:'var(--muted)', textAlign:'right', marginTop:4 }}>{msg.time} <span style={{ color:'var(--teal)' }}>✓✓</span></span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <AnimatePresence>
                    {typingIndicator && (
                        <motion.div 
                            key="typing"
                            style={{ display:'flex', alignItems:'flex-end', gap:8 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                             <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#9b59b6,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white', flexShrink:0 }}>{typingIndicator.initials}</div>
                             <div style={{ background:'var(--bg-card)', border:'1px solid rgba(45,212,191,0.12)', borderRadius:'0 18px 18px 18px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
                                 <span className="tdot"></span><span className="tdot"></span><span className="tdot"></span>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {sysMessage && (
                        <motion.div 
                            style={{ textAlign:'center', fontSize:12, color:'var(--muted)', fontStyle:'italic', padding:8 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            🔒 Messages are end-to-end memories
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section ref={galleryRef} className="grid-bg" style={{ minHeight:'100vh', padding:'80px 0' }}>
          <div style={{ textAlign:'center', padding:'0 20px 40px' }}>
            <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:'clamp(32px,5vw,56px)' }}>Club Memories</h2>
            <motion.div 
                style={{ height:3, background:'var(--teal)', margin:'12px auto 0', borderRadius:2 }}
                initial={{ width: 0 }}
                animate={galleryInView ? { width: 80 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          
                    <div className="gallery-stage">
                        <div className="lights-wire"></div>
                        <div className="lights-row">
                            {Array.from({ length: 14 }).map((_, i) => (
                                <span
                                    key={i}
                                    className={`light-bulb bulb-${i % 4}`}
                                    style={{ animationDelay: `${(i % 5) * 0.2}s` }}
                                />
                            ))}
                        </div>

                        <div className="memory-spark memory-spark-left">with love</div>
                        <div className="memory-spark memory-spark-right">for always</div>

                        <div className="emotional-gallery custom-scrollbar">
                            {galleryDeck.map((item, idx) => (
                                <motion.button
                                    key={`${item.src}-${idx}`}
                                    type="button"
                                    className={`memory-card tone-${item.hue}`}
                                    style={{ transform: `rotate(${item.tilt}deg)`, top: `${item.lift}px` }}
                                    initial={{ opacity: 0, y: 30, rotate: item.tilt - 3 }}
                                    animate={galleryInView ? { opacity: 1, y: 0, rotate: item.tilt } : {}}
                                    transition={{ duration: 0.55, delay: item.delay, ease: "easeOut" }}
                                    whileHover={{ scale: 1.04, rotate: 0, y: -8 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setLightboxIndex(idx)}
                                >
                                    <img src={encodeURI(item.src)} alt="memory" loading="lazy" />
                                </motion.button>
                            ))}
                        </div>
          </div>
        </section>
      </motion.div>

      {/* LIGHTBOX */}
      <AnimatePresence>
          {lightboxIndex !== null && (
              <motion.div 
                  style={{ position:'fixed', inset:0, background:'rgba(11,42,48,0.96)', backdropFilter:'blur(10px)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => { if(e.target === e.currentTarget) setLightboxIndex(null); }}
              >
                  <motion.img 
                      src={encodeURI(galleryDeck[lightboxIndex]?.src)}
                      style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:8, objectFit: 'contain' }}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                  <button onClick={() => setLightboxIndex(null)} style={{ position:'absolute', top:20, right:24, background:'none', border:'none', color:'var(--teal)', fontSize:28, cursor:'pointer' }}>×</button>
                  <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => (prev - 1 + galleryDeck.length) % galleryDeck.length); }} style={{ position:'absolute', left:20, background:'none', border:'none', color:'var(--white)', fontSize:32, cursor:'pointer' }}>‹</button>
                  <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => (prev + 1) % galleryDeck.length); }} style={{ position:'absolute', right:20, background:'none', border:'none', color:'var(--white)', fontSize:32, cursor:'pointer' }}>›</button>
              </motion.div>
          )}
      </AnimatePresence>

      <style>{`
        :root { --bg: #0b2a30; --bg-card: #0f3540; --teal: #2dd4bf; --purple: #a855f7; --white: #f0fdfc; --muted: #7fb3ae; --grid-line: rgba(45,212,191,0.05); }
        .grid-bg { background-color: var(--bg); background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px); background-size: 40px 40px; }
        @keyframes blink { 0%, 100%{opacity:1} 50%{opacity:0} }
        .tdot { width:7px; height:7px; border-radius:50%; background:var(--muted); display:inline-block; animation:tdotbounce 1.2s infinite; }
        .tdot:nth-child(2) { animation-delay:.2s }
        .tdot:nth-child(3) { animation-delay:.4s }
        @keyframes tdotbounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
                .gallery-stage { position: relative; max-width: 1240px; margin: 0 auto; padding: 58px 24px 24px; }
                .lights-wire { position: absolute; left: 4%; right: 4%; top: 26px; border-top: 2px dashed rgba(240,253,252,0.25); }
                .lights-row { position: absolute; left: 6%; right: 6%; top: 24px; display: flex; justify-content: space-between; pointer-events: none; }
                .light-bulb { width: 12px; height: 18px; border-radius: 999px; display: inline-block; filter: drop-shadow(0 0 10px rgba(255,255,255,0.35)); animation: bulbPulse 1.8s ease-in-out infinite; }
                .bulb-0 { background: #ffd166; }
                .bulb-1 { background: #ff6b6b; }
                .bulb-2 { background: #80ed99; }
                .bulb-3 { background: #7cc6fe; }
                @keyframes bulbPulse { 0%,100% { opacity:.55; transform: translateY(0); } 50% { opacity:1; transform: translateY(2px); } }
                .memory-spark { position: absolute; font-family: 'Playfair Display, serif'; font-style: italic; color: rgba(240,253,252,0.55); font-size: clamp(12px, 1.8vw, 18px); pointer-events: none; }
                .memory-spark-left { left: 26px; top: 46px; transform: rotate(-5deg); }
                .memory-spark-right { right: 26px; top: 46px; transform: rotate(5deg); }
                .emotional-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; align-items: start; }
                .memory-card { position: relative; border: 0; background: rgba(255,255,255,0.07); padding: 10px; border-radius: 12px; cursor: pointer; box-shadow: 0 14px 28px rgba(0,0,0,0.35); overflow: hidden; }
                .memory-card::before { content: ''; position: absolute; inset: 0; border: 1px solid rgba(240,253,252,0.25); border-radius: 12px; pointer-events: none; }
                .memory-card img { width: 100%; height: 100%; min-height: 180px; max-height: 330px; object-fit: cover; border-radius: 8px; display: block; }
                .tone-0 img { filter: saturate(1.08) brightness(1.02); }
                .tone-1 img { filter: saturate(1.14) contrast(1.04); }
                .tone-2 img { filter: saturate(1.12) sepia(0.06); }
                .tone-3 img { filter: saturate(1.1) brightness(1.04); }
                @media (max-width: 760px) {
                    .gallery-stage { padding-top: 68px; }
                    .lights-row { top: 22px; }
                    .memory-spark { display: none; }
                    .emotional-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
                    .memory-card { padding: 7px; }
                    .memory-card img { min-height: 150px; max-height: 230px; }
                }
      `}</style>
    </div>
  );
}