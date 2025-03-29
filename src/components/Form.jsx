import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

const SERVER_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://api.vjdataquesters.com";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [submitStatus, setSubmitStatus] = useState(false);

  useEffect(() => {
    // send stats req
  }, []) 

  // put a use effect and hit /status endpoint to get isForm
  /**
   * @param { * {
  *  isFormOpen: boolean;
  *  currentRegistrations: number; 
  *  maxRegistrations: number
  *  lastUpdated: string;
  * }}
  * 
  * if isFormOpen is false - dont show the form
  * also show the participant currentRegistrations and maxRegistrations
  *  
  */


  const submitForm = async (data) => {
    setSubmitStatus(false);
    console.log("Register Form Data:", data);
    try {
      const response = await api.post("/register", data);
      if (response.data.status) {
        setSubmitStatus(true);
        reset();
      }
      else {
        setSubmitStatus(false);
      }
      alert(response.data.message);
    } catch (error) {
      alert("Error submitting form. Please try again later.");
      setSubmitStatus(false);
      console.error("Error submitting payment:", error);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md bg-white shadow-lg rounded-lg p-4 border overflow-y-auto max-h-[90vh]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* <div className=""> */}
      {/* <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4 border overflow-y-auto max-h-[90vh]"> */}
      {submitStatus ? (
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700">
            Thank you for registering!
          </h2>
        </div>
      ) : (
        <div>
          {/* Form Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            <span className="text-blue-500">&lt;/&gt;</span> Cloud Craft
            Registrations
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit(submitForm)} className="grid gap-2">
            {/* Full Name */}
            <div>
              <label className="text-sm text-gray-950">Full Name</label>
              <input
                {...register("name", { required: true })}
                placeholder="Name"
                className="border p-2 w-full rounded-md"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">Name is required</p>
              )}
            </div>

            {/* Department & Section */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-950">Department</label>
                <select
                  {...register("branch", { required: true })}
                  className="border p-2 w-full rounded-md mt-1"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="CSBS">CSBS</option>
                  <option value="CSE-DS">CSE-DS</option>
                  <option value="CSE-CyS">CSE-CyS</option>
                  <option value="AI&DS">AI&DS</option>
                  <option value="AIML">AIML</option>
                  <option value="IOT">IOT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="EIE">EIE</option>
                  <option value="MECHANICAL">MECHANICAL</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="AUTOMOBILE">AUTOMOBILE</option>
                </select>
                {errors.department && (
                  <p className="text-red-500 text-sm">Branch is required</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-950">Section</label>
                <select
                  {...register("section", { required: true })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
                {errors.year && (
                  <p className="text-red-500 text-sm">Section is required</p>
                )}
              </div>
            </div>

            {/* Roll Number & Year */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-950">Roll Number</label>
                <input
                  {...register("rollno", { required: true })}
                  placeholder="Roll No"
                  className="border p-2 w-full rounded-md"
                />
                {errors.rollno && (
                  <p className="text-red-500 text-sm">Roll No is required</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-950">Year</label>
                <select
                  {...register("year", { required: true })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  <option>1ˢᵗ Year</option>
                  <option>2ⁿᵈ Year</option>
                  <option>3ʳᵈ Year</option>
                  <option>4ᵗʰ Year</option>
                </select>
                {errors.year && (
                  <p className="text-red-500 text-sm">Year is required</p>
                )}
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="text-sm text-gray-950">Contact Number</label>
              <input
                {...register("phno", { required: true })}
                type="tel"
                placeholder="Phone No"
                className="border p-2 w-full rounded-md"
              />
              {errors.phno && (
                <p className="text-red-500 text-sm">Phone No is required</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-950">Email</label>
              <input
                {...register("email", { required: true })}
                placeholder="Email"
                className="border p-2 w-full rounded-md"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">Email is required</p>
              )}
            </div>

            {/* Payment QR Code */}
            <div className="text-center">
              <label className="text-sm text-gray-950 block">
                Payment QR Code
              </label>
              <img
                src="/paymentsQR.png"
                alt="Payment QR Code"
                className="max-w-[200px] mx-auto rounded shadow"
              />
            </div>
            {/* payment platform */}
            <div className="mt-1">
              <label className="text-sm text-gray-950 block">
                Payment Platform
              </label>
              <select
                {...register("paymentplatform", { required: true })}
                className="border p-2 w-full rounded-md"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Payment Platform
                </option>
                <option value="Google Pay">Google Pay</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
                <option value="Amazon Pay">Amazon Pay</option>
                <option value="BHIM UPI">BHIM UPI</option>
                <option value="Mobikwik">Mobikwik</option>
                <option value="FreeCharge">FreeCharge</option>
                <option value="Other">Other</option>
              </select>
              {errors.paymentplatform && (
                <p className="text-red-500 text-sm">
                  Please select a payment platform
                </p>
              )}
            </div>
            {/* Transaction ID */}
            <div>
              <label className="text-sm text-gray-950">Transaction ID</label>
              <input
                {...register("transactionid", { required: true })}
                placeholder="Transaction ID"
                className="border p-2 w-full rounded-md"
              />
              {errors.transactionid && (
                <p className="text-red-500 text-sm">
                  Transaction ID is required
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-3 flex justify-center">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gradient-to-r px-5 bg-[#0f323fee] hover:bg-[#135168] md:from-blue-900 md:to-teal-400 text-white font-semibold py-2 rounded-full shadow hover:opacity-90"
              >
                <span>Submit</span>
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
      {/* </div> */}
      {/* </div> */}
    </motion.div>
  );
};

export default Form;
