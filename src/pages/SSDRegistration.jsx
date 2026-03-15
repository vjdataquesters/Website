import React from "react";
import SSDFormBanner from "../components/SSDFormBanner";
import SSDForm from "../components/SSDForm";

const SSDRegistration = () => {
  return (
    <>
      <div className="flex justify-center items-center py-8 min-h-screen">
        <div className="flex flex-col md:flex-row w-full md:max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden p-8">
          <div className="w-full flex flex-col justify-center items-center text-center py-20 min-h-[50vh]">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Registration Closed</h1>
            <p className="text-xl text-gray-600">Thank you for your interest! Registrations for Summer System Design are now closed.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SSDRegistration;
