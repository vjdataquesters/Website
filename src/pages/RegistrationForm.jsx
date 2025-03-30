import React from "react";
import Leftside from "../components/FormBanner";
import Form from "../components/Form";

const RegistrationForm = () => {
  return (
    <>
      <div className="flex md:hidden pt-20">
        <Form />
      </div>
      <div className="hidden md:flex justify-center items-center py-20 min-h-screen">
        {/* Main Container */}
        <div className="flex flex-col md:flex-row w-full md:max-w-6xl bg-white  ">
          {/* Left Section (Hidden on small screens) */}
          <div className="hidden md:flex md:w-1/2  text-white justify-center items-center rounded-l-lg">
            <Leftside />
          </div>
          {/* Right Section (Form) */}

          <div className="w-full md:w-1/2 bg-white flex flex-row justify-center items-center md:rounded-r-lg">
            <Form />
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationForm;
