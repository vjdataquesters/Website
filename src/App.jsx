import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { motion, useReducedMotion } from "framer-motion";
import PropTypes from "prop-types";

import router from "./pages";

import Header from "./components/Header";
import ConvergenceMarquee from "./components/ConvergenceMarquee";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";
import Footer from "./components/Footer";
import { PromoDiv } from "./components/PromoDiv";
import events from "./data/events";
import {
  introFadeStart,
  introFadeDuration,
  introRevealDelay,
  headerRevealDelay,
  pageRevealDelay,
  introFallbackMs,
} from "./config/animationConfig";

const loadingAnimationBlacklist = [
  "/hit",
  "/hit-gen-qr-ultrasecretendpoint",
  "/register",
  "/register/ssd",
  "/events/SSD/submissions",
];
const headerBlacklist = [
  "/hit",
  "/register",
  "/register/ssd",
  "/farewell-2k26",
];
const promoBlacklist = [
  "/hit",
  "/hit-gen-qr-ultrasecretendpoint",
  "/register",
  "/register/ssd",
];

if (typeof window !== "undefined" && window.isInitialLoad === undefined) {
  window.isInitialLoad = true;
}

function DynamicComponent({ Component, blacklist = [], ...props }) {
  const { pathname: currentPath } = useLocation();

  return (
    <>
      {!blacklist.some((path) => path === currentPath) && (
        <Component {...props} />
      )}
    </>
  );
}

DynamicComponent.propTypes = {
  Component: PropTypes.elementType.isRequired,
  blacklist: PropTypes.arrayOf(PropTypes.string),
};


function MainContentLayout({ children }) {
  const { pathname: currentPath } = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isBlacklisted = loadingAnimationBlacklist.some(
    (path) => path === currentPath,
  );
  const isInitial = typeof window !== "undefined" && window.isInitialLoad;
  const [animationDone, setAnimationDone] = useState(false);

  const contentVariants = {
    initial: {
      opacity: isBlacklisted || !isInitial ? 1 : 0,
    },
    animate: { opacity: 1 },
    transition: {
      duration: introFadeDuration,
      delay: isBlacklisted || !isInitial ? 0 : pageRevealDelay,
      ease: "easeOut",
    },
  };

  const reducedContentVariants = {
    initial: { opacity: isBlacklisted || !isInitial ? 1 : 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.5,
      delay: isBlacklisted || !isInitial ? 0 : pageRevealDelay,
    },
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-blue-50/70"
      variants={shouldReduceMotion ? reducedContentVariants : contentVariants}
      initial={isInitial && !isBlacklisted ? "initial" : false}
      animate="animate"
      onAnimationComplete={() => setAnimationDone(true)}
      style={
        animationDone ? { filter: "none", transform: "none", opacity: 1 } : {}
      }
    >
      {children}
    </motion.div>
  );
}

function HeaderWrapper({ children }) {
  const { pathname: currentPath } = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isBlacklisted = headerBlacklist.some((path) => path === currentPath);
  const isInitial = typeof window !== "undefined" && window.isInitialLoad;
  const [animationDone, setAnimationDone] = useState(false);

  return (
    <motion.div
      initial={
        isInitial && !isBlacklisted
          ? { opacity: 0, y: -20, scale: 0.98 }
          : false
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: isBlacklisted || !isInitial ? 0 : headerRevealDelay,
        ease: "easeOut",
      }}
      className="sticky top-0 left-0 w-full z-[102] pointer-events-none"
      onAnimationComplete={() => setAnimationDone(true)}
      style={
        animationDone
          ? {
              opacity: 1,
              transform: "none",
              transformOrigin: "center top",
            }
          : { transformOrigin: "center top" }
      }
    >
      <div className="pointer-events-auto flex flex-col w-full">{children}</div>
    </motion.div>
  );
}

function App() {
  const [load, setLoad] = useState(true);
  const fallbackTimer = useRef(null);

  useEffect(() => {
    fallbackTimer.current = setTimeout(() => {
      setLoad(false);
      if (typeof window !== "undefined") {
        window.isInitialLoad = false;
      }
    }, introFallbackMs);

    return () => clearTimeout(fallbackTimer.current);
  }, []);

  const handleIntroComplete = () => {
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    setLoad(false);
    if (typeof window !== "undefined") {
      window.isInitialLoad = false;
    }
  };

  function PromoSection() {
    return (
      <div className="fixed bottom-2 md:bottom-14 right-2 flex flex-col gap-2 z-10">
        {events.upcoming.map((e, i) => (
          <PromoDiv
            key={i}
            eventName={e.name}
            eventLink={e.link}
            eventStatus="upcoming"
          />
        ))}
      </div>
    );
  }

  return (
    <Router>
      <Analytics />
      <DynamicComponent
        Component={Loading}
        blacklist={loadingAnimationBlacklist}
        load={load}
        onComplete={handleIntroComplete}
      />
      <HeaderWrapper>
        <DynamicComponent Component={Header} blacklist={headerBlacklist} />
        <DynamicComponent
          Component={ConvergenceMarquee}
          blacklist={headerBlacklist}
        />
      </HeaderWrapper>
      <ScrollToTop />
      <MainContentLayout>
        <Routes>
          {router.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </MainContentLayout>
      <DynamicComponent Component={PromoSection} blacklist={promoBlacklist} />
      <DynamicComponent Component={Footer} blacklist={headerBlacklist} />
    </Router>
  );
}

export default App;
