import React from "react";
import SSDFormBanner from "../components/SSDFormBanner";
import SSDForm from "../components/SSDForm";

const SSDRegistration = () => {
  return (
    <>
      <div className="flex md:hidden pt-20">
        <SSDForm />
      </div>
      <div className="hidden md:flex justify-center items-center py-20 min-h-screen">
        <div className="flex flex-col md:flex-row w-full md:max-w-6xl bg-white rounded-lg shadow-2xl">
          {/* Left Section - System Design Banner */}
          <div className="hidden md:flex md:w-1/2 text-white justify-center items-center rounded-l-lg">
            <SSDFormBanner />
          </div>
          {/* Right Section - Registration Form */}
          <div className="w-full md:w-1/2 bg-white flex flex-row justify-center items-center md:rounded-r-lg">
            <SSDForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default SSDRegistration;
