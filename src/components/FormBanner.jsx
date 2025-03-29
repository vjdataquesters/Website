import React from "react";
import { motion } from "framer-motion";
import { Cloud, Server, Database } from "lucide-react";

const Leftside = () => {
  return (
    <motion.div
      className="text-white text-center w-full flex flex-col justify-center items-center h-full rounded-lg bg-gradient-to-r from-blue-900 to-teal-400"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Event Title at the Top */}
      <div className="flex items-center gap-2 mb-3">
        <motion.h1
          className="font-bold text-4xl"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          CloudCraft
        </motion.h1>
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Cloud size={40} className="text-white" />
        </motion.div>
      </div>

      {/* Subtitle */}
      <motion.p
        className="text-lg text-gray-200 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Master Cloud Basics & AWS with industry experts!
      </motion.p>

      {/* Features Section */}
      <div className="flex gap-6 justify-center mb-3">
        <motion.div className="p-4 rounded-lg bg-white text-blue-900 shadow-lg flex flex-col items-center w-44 hover:scale-110 transition-transform">
          <Server size={30} className="mb-2" />
          <h5 className="font-bold">Cloud Fundamentals</h5>
          <p className="text-sm text-center">
            Understand cloud computing, virtualization & storage.
          </p>
        </motion.div>

        <motion.div className="p-4 rounded-lg bg-white text-blue-900 shadow-lg flex flex-col items-center w-44 hover:scale-110 transition-transform">
          <Database size={30} className="mb-2" />
          <h5 className="font-bold">AWS Mastery</h5>
          <p className="text-sm text-center">
            Learn AWS services, EC2, S3, and serverless computing.
          </p>
        </motion.div>
      </div>

      {/* Contact Section */}
      <motion.p
        className="text-lg text-gray-200 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        For any queries, contact <span className="font-bold">K. Aditya</span>
        {/* who is aditya?? */}
      </motion.p>
    </motion.div>
  );
};

export default Leftside;
