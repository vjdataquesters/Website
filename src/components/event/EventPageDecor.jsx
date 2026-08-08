import { motion } from "framer-motion";

export default function EventPageDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Tech Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,50,63,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,50,63,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Linear Tech Dot Matrix Overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(rgba(15,50,63,0.15) 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Premium Gradient Blobs */}
      {/* Cyan Blob */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-20 top-1/4 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[100px]"
      />

      {/* Purple Glow Blob */}
      <motion.div
        animate={{
          x: [0, -30, 50, 0],
          y: [0, 50, -40, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-20 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-500/8 blur-[120px]"
      />

      {/* Teal / Emerald Blob */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/3 top-10 h-[350px] w-[350px] rounded-full bg-emerald-500/8 blur-[90px]"
      />

      {/* Deep Brand Contrast Blob */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, -30, 60, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-2/3 bottom-10 h-[400px] w-[400px] rounded-full bg-[#0f323f]/15 blur-[110px]"
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
