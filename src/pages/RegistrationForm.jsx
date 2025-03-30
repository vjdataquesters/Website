import React from "react";
import Leftside from "../components/FormBanner";
import Form from "../components/Form";

const RegistrationForm = () => {
  return (
    <div className="flex justify-center items-center bg-gray-100 py-20 min-h-screen">
      {/* Main Container */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Left Section (Hidden on small screens) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-blue-900 to-teal-400 text-white justify-center items-center rounded-l-lg">
          <Leftside />
        </div>
        {/* Right Section (Form) */}

        <div className="w-full md:w-1/2 bg-white flex flex-row justify-center items-center rounded-r-lg">
          <Form />
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
