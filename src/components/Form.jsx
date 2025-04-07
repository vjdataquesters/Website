import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Send, CheckCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SERVER_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://api.vjdataquesters.com";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
const transitionVariants = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    filter: "blur(10px)",
    transition: { duration: 0.5, ease: "easeIn" },
  },
};
const pulseVariants = {
  animate: {
    opacity: [0.2, 0.6, 1, 0.6, 0.2],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const FormComp = ({ setLoadingStatus, setSubmitStatus, formStatus }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const rollno = watch("rollno", "");
  useEffect(() => {
    if (rollno && rollno !== rollno.toUpperCase()) {
      setValue("rollno", rollno.toUpperCase());
    }
  }, [rollno, setValue]);

  const submitForm = async (data) => {
    // console.log("Register Form Data:", data);
    try {
      setLoadingStatus(true);
      const response = await api.post("/register", data);
      // console.log(response);
      setSubmitStatus(false);
      if (response.data.success) {
        setSubmitStatus(true);
        reset();
      } else {
        setSubmitStatus(false);
      }
      // registration success
    } catch (error) {
      alert("Error submitting form. Please try again later.");
      // console.log(error);
      setSubmitStatus(false);
      console.error("Error submitting payment:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <motion.div
      key="form"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={transitionVariants}
      className="md:h-[80vh]"
    >
      <div className="flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">
            <span className="text-blue-500">&lt;/&gt;</span> Cloud Craft
          </h1>

           {/*<div className="flex flex-wrap items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg shadow-sm border w-fit">
            <span className="text-xs sm:text-sm font-medium text-gray-800">
              Slots Left:
            </span>
            <span className="px-1 md:px-3 py-1 text-xs sm:text-sm font-semibold text-white bg-[#236e9c] rounded-md shadow">
              {formStatus.maxRegistrations - formStatus.currentRegistrations}
            </span>
          </div> */}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(submitForm)} className="grid gap-2 p-4">
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
        {/* Branch & Section */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm text-gray-950">Branch</label>
            <select
              {...register("branch", { required: true })}
              className="border p-2 w-full rounded-md mt-1"
              defaultValue=""
            >
              <option value="" disabled>
                Select Branch
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
            {errors.branch && (
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
            {errors.section && (
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
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
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
            {...register("phno", {
              required: "Phone No is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit phone number",
              },
            })}
            type="tel"
            placeholder="Phone No"
            className="border p-2 w-full rounded-md"
          />
          {errors.phno && (
            <p className="text-red-500 text-sm">{errors.phno.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-950">Email</label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            placeholder="Email"
            className="border p-2 w-full rounded-md"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        {/* Payment QR Code */}
        <div className="text-center">
          <label className="text-md text-gray-950 block">Payment QR Code</label>
          <p>
            Account Holder: <span id="accountHolder">Bandi Bindu Sree</span>
          </p>
          <img
            src="/paymentsQR.jpg"
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
            <option value="FamPay">Fampay</option>
            <option value="Mobikwik">Mobikwik</option>
            <option value="WhatsApp Pay">WhatsApp Pay</option>
            <option value="FreeCharge">FreeCharge</option>
            <option value="other">other</option>
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
            <p className="text-red-500 text-sm">Transaction ID is required</p>
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
    </motion.div>
  );
};
const SubmittedComp = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      key="submitted"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={transitionVariants}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.2 }}
        className="bg-green-500 text-white p-4 rounded-full shadow-lg"
      >
        <CheckCircle size={50} />
      </motion.div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-4">
        🎉 Submission Successful!
      </h2>
      <p className="text-gray-600 mt-2">
        Thank you for registering. You will receive a confirmation email soon.
      </p>

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 px-6 py-2 font-semibold rounded-full shadow-md bg-gradient-to-r bg-[#0f323fee] hover:bg-[#135168] text-white"
        onClick={() => navigate("/events")}
      >
        Back to Events
      </motion.button>
    </motion.div>
  );
};
const LoadingComp = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh]">
      {/* Spinning Loader */}
      <motion.img
        src="/icon-logo.jpg"
        alt="Loading Logo"
        variants={pulseVariants}
        animate="animate"
        className="w-24 h-24 object-contain"
      />

      {/* Loading Text with Animation */}
      <motion.p
        variants={pulseVariants}
        animate="animate"
        className="text-gray-700 font-semibold text-lg mt-2"
      >
        Loading, please wait...
      </motion.p>
    </div>
  );
};
const FormClosedComp = () => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[80vh] p-6"
    >
      <Lock size={48} className="text-gray-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Registration Closed</h2>
      <p className="text-gray-600 text-center">
        Thank you for your interest in our event!
      </p>
      <p className="text-gray-600 text-center mb-6">
        Registration is no longer being accepted.
      </p>
      
      <div className="mt-6 border-t pt-6 w-full max-w-md">
        <p className="text-gray-800 font-medium text-center mb-3">
          In case of any queries contact our student coordinators!
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="bg-gray-100 px-4 py-3 rounded-lg text-center w-full sm:w-auto">
            <p className="font-medium text-gray-800">RICHARD LUKE</p>
            <p className="text-gray-600">72072 58403</p>
          </div>
          <div className="bg-gray-100 px-4 py-3 rounded-lg text-center w-full sm:w-auto">
            <p className="font-medium text-gray-800">RENUKA SAI</p>
            <p className="text-gray-600">90631 08170</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
const Form = () => {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(false);
  const [formStatus, setFormStatus] = useState({
    isFormOpen: false,
    // currentRegistrations: 0,
    // maxRegistrations: 150,
    // lastUpdated: "",
  });

  // useEffect(() => {
    // setTimeout(() => setFormStatus({ ...formStatus, isFormOpen: true }), 0);
    // setTimeout(() => setLoadingStatus(true), 2000);
    // setTimeout(() => setLoadingStatus(false), 4000);
    // setTimeout(() => setSubmitStatus(true), 4000);
    // setTimeout(() => setFormStatus({ ...formStatus, isFormOpen: false }), 5000);

    // const fetchStatus = async () => {
    //   try {
    //     setLoadingStatus(true);
    //     const response = await api.get("/stats");
    //     // console.log(response);
    //     if (response.data.success === true && response.data.data) {
    //       setFormStatus({
    //         isFormOpen: response.data.data.isFormOpen,
    //         currentRegistrations: response.data.data.currentRegistrations || 0,
    //         maxRegistrations: response.data.data.maxRegistrations || 150,
    //         lastUpdated:
    //           response.data.data.lastUpdated || new Date().toISOString(),
    //       });
    //     } else {
    //       throw new Error(response.data.error);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   } finally {
    //     setLoadingStatus(false);
    //   }
    // };
    // fetchStatus();
  // }, []);
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

  return (
    <motion.div
      className="w-full max-w-full md:shadow-lg p-4 border overflow-y-auto md:max-h-[90vh] small-scrollbar md:rounded-r-lg"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {loadingStatus ? (
        <LoadingComp />
      ) : !formStatus.isFormOpen ? (
        <FormClosedComp />
      ) : submitStatus ? (
        <SubmittedComp />
      ) : (
        <FormComp
          setLoadingStatus={setLoadingStatus}
          setSubmitStatus={setSubmitStatus}
          formStatus={formStatus}
        />
      )}
    </motion.div>
  );
};

export default Form;
