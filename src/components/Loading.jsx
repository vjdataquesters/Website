import { motion, useReducedMotion } from "framer-motion";
import { introFadeStart, introFadeDuration } from "../config/animationConfig";

export default function Loading({ load, onComplete }) {
  const shouldReduceMotion = useReducedMotion();

  if (!load) return null;

  // Reduced motion variants
  const containerVariants = {
    initial: { opacity: 1, scale: 1 },
    animate: {
      opacity: 0,
      scale: 1.04,
      transition: {
        duration: introFadeDuration,
        delay: introFadeStart,
        ease: "easeOut",
      },
    },
  };

  const logoReducedVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 1, 1, 0],
      transition: { duration: 1.5, times: [0, 0.2, 0.8, 1] },
    },
  };

  // Standard motion variants
  const fullContainerVariants = {
    initial: { opacity: 1, scale: 1 },
    animate: {
      opacity: 0,
      scale: 1.04,
      transition: {
        duration: introFadeDuration,
        delay: introFadeStart,
        ease: "easeOut",
      },
    },
  };

  const fullAuraVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.2, 0.8, 3.5],
      opacity: [0, 0.7, 0.7, 0.85],
    },
  };

  const fullLogoVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: [0.9, 1, 1, 0.5],
      opacity: [0, 1, 1, 0],
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[999999] flex items-center justify-center select-none"
      style={{
        background:
          "linear-gradient(124deg, #0f323f 29%, #155e79 81%, #0c9acf 100%)",
        transformOrigin: "center center",
      }}
      variants={shouldReduceMotion ? containerVariants : fullContainerVariants}
      initial="initial"
      animate="animate"
      onAnimationComplete={onComplete}
    >
      {!shouldReduceMotion && (
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-[#00f2fe] via-[#0c9acf] to-[#2dd4bf] blur-3xl opacity-90 pointer-events-none"
          style={{ willChange: "transform, opacity" }}
          variants={fullAuraVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 2.2, times: [0, 0.3, 0.6, 1] }}
        />
      )}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{ willChange: "transform, opacity" }}
        variants={shouldReduceMotion ? logoReducedVariants : fullLogoVariants}
        initial="initial"
        animate="animate"
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 2.2, times: [0, 0.2, 0.7, 1] }
        }
      >
        <img
          src="/logo.png"
          alt="Data Questers logo"
          className="w-56 md:w-72"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}
