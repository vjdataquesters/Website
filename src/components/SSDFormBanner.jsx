import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Server,
  Database,
  Shield,
  Layers,
  Cpu,
  Network,
  Activity,
} from "lucide-react";

const flowNodes = [
  { icon: Globe, label: "Client", color: "#60a5fa", glow: "rgba(96,165,250,0.3)" },
  { icon: Shield, label: "Load Balancer", color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  { icon: Server, label: "API Gateway", color: "#34d399", glow: "rgba(52,211,153,0.3)" },
  { icon: Cpu, label: "Microservices", color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
  { icon: Layers, label: "Cache Layer", color: "#f87171", glow: "rgba(248,113,113,0.3)" },
  { icon: Database, label: "Database", color: "#38bdf8", glow: "rgba(56,189,248,0.3)" },
];

const PulsingRing = ({ delay, size, opacity }) => (
  <motion.div
    className="absolute rounded-full border border-teal-400/20"
    style={{ width: size, height: size }}
    animate={{
      scale: [1, 1.8, 2.5],
      opacity: [opacity, opacity * 0.5, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeOut",
    }}
  />
);

const SSDFormBanner = () => {
  return (
    <motion.div
      className="text-white text-center w-full flex flex-col justify-center items-center h-full rounded-l-lg relative overflow-hidden py-6 px-6"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, #135168 0%, #0f323f 40%, #0a1f2e 100%)",
      }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)",
          top: "-10%",
          right: "-20%",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          bottom: "5%",
          left: "-15%",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: i % 2 === 0 ? "rgba(45,212,191,0.5)" : "rgba(96,165,250,0.5)",
            top: `${8 + ((i * 7.3) % 85)}%`,
            left: `${5 + ((i * 11.7) % 90)}%`,
          }}
          animate={{
            y: [0, -15 - (i % 3) * 10, 0],
            x: [0, (i % 2 === 0 ? 8 : -8), 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.25,
          }}
        />
      ))}

      {/* Pulsing rings behind title */}
      <div className="absolute top-[12%] flex items-center justify-center">
        <PulsingRing delay={0} size={80} opacity={0.15} />
        <PulsingRing delay={1.3} size={80} opacity={0.1} />
        <PulsingRing delay={2.6} size={80} opacity={0.08} />
      </div>

      {/* Event Title */}
      <div className="relative z-10 mb-3">
        <motion.div
          className="flex items-center gap-3 justify-center mb-2"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Network size={38} className="text-teal-300 drop-shadow-lg" />
          </motion.div>
          <h1 className="font-bold text-3xl tracking-tight whitespace-nowrap drop-shadow-lg">
            Summer System{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #5eead4 0%, #67e8f9 50%, #a5f3fc 100%)",
              }}
            >
              Design
            </span>
          </h1>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Activity size={14} className="text-teal-400/70" />
          <p className="text-sm text-teal-200/80 font-light tracking-wide">
            2-Day Intensive Workshop
          </p>
          <Activity size={14} className="text-teal-400/70" />
        </motion.div>

        <motion.p
          className="text-xs text-teal-300/60 mt-1 tracking-widest uppercase font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          by VJ DataQuesters
        </motion.p>
      </div>

      {/* Architecture Flow - enhanced */}
      <div className="relative z-10 flex flex-col items-center gap-0 my-1">
        {flowNodes.map((node, i) => (
          <React.Fragment key={node.label}>
            <motion.div
              className="flex items-center gap-3 backdrop-blur-md rounded-xl px-5 py-2 w-52 cursor-default"
              style={{
                background: `linear-gradient(135deg, ${node.glow}, rgba(255,255,255,0.05))`,
                border: `1px solid rgba(255,255,255,0.15)`,
              }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: "easeOut" }}
              whileHover={{
                scale: 1.08,
                boxShadow: `0 0 20px ${node.glow}, 0 0 40px ${node.glow}`,
              }}
            >
              <motion.div
                className="p-1.5 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${node.color}33, ${node.color}11)`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 5px ${node.glow}`,
                    `0 0 15px ${node.glow}`,
                    `0 0 5px ${node.glow}`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <node.icon size={16} style={{ color: node.color }} />
              </motion.div>
              <span className="text-xs font-semibold tracking-wide">{node.label}</span>
            </motion.div>

            {i < flowNodes.length - 1 && (
              <div className="relative h-4 flex items-center justify-center">
                {/* Connector line */}
                <motion.div
                  className="w-px h-full bg-gradient-to-b from-teal-400/40 to-teal-400/10"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                />
                {/* Animated data packet flowing down */}
                <motion.div
                  className="absolute w-1 h-1 rounded-full bg-teal-400"
                  style={{
                    boxShadow: "0 0 6px rgba(45,212,191,0.9)",
                  }}
                  animate={{ top: ["-2px", "14px"], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: 1 + i * 0.3,
                    ease: "easeIn",
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Topics - animated pill tags */}
      <motion.div
        className="relative z-10 mt-3 flex flex-wrap justify-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        {[
          { label: "REST APIs", icon: ">" },
          { label: "Load Balancing", icon: "=" },
          { label: "Caching", icon: "#" },
          { label: "SQL & NoSQL", icon: "{}" },
          { label: "Microservices", icon: "<>" },
          { label: "CAP Theorem", icon: "~" },
        ].map((topic, i) => (
          <motion.span
            key={topic.label}
            className="text-[10px] rounded-full px-2.5 py-1 font-medium tracking-wide"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(153,246,228,0.8)",
            }}
            whileHover={{
              background: "rgba(255,255,255,0.12)",
              scale: 1.1,
              borderColor: "rgba(45,212,191,0.4)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 + i * 0.08 }}
          >
            <span className="opacity-50 mr-1">{topic.icon}</span>
            {topic.label}
          </motion.span>
        ))}
      </motion.div>

      {/* Contact */}
      <motion.div
        className="relative z-10 text-center mt-3 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <p className="text-teal-100 font-semibold mb-1.5">For queries, contact</p>
        <div className="flex gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-200/80">
              <span className="text-teal-100 font-medium">Rohith</span>{" "}
              <span className="text-teal-300/60">77998 82377</span>
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-200/80">
              <span className="text-teal-100 font-medium">Siddharth</span>{" "}
              <span className="text-teal-300/60">91824 91855</span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SSDFormBanner;
