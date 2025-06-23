import React from "react";
import FormBanner from "../components/TVComponents/FormBanner";
import TForm from "../components/TVComponents/RegistrationForm";

const TechnovistaForm = () => {
  return (
    <>
      {/* Mobile Layout */}
      <div className="flex md:hidden pt-20 min-h-screen">
        <div className="w-full">
          <TForm />
        </div>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex justify-center items-center py-20 min-h-screen bg-black">
        {/* Main Container */}
        <div className="flex flex-col md:flex-row w-full md:max-w-6xl bg-black backdrop-blur-md rounded-lg min-h-[80vh]">
          {/* Left Section (Hidden on small screens) */}
          <div className="hidden md:flex md:w-1/2 text-white justify-center items-center rounded-l-lg">
            <FormBanner />
          </div>
          {/* Right Section (Form) */}
          <div className="w-full md:w-1/2 bg-black backdrop-blur-md flex flex-col justify-center items-center md:rounded-r-lg min-h-[80vh]">
            <div className="w-full h-full">
              <TForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnovistaForm;
