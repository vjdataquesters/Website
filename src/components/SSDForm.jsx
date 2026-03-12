import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Send, CheckCircle, Lock, Network } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { QR_CONFIG, activeQR } from "../config/qrConfig";
import DropdownCombobox from "./DropdownCombobox";

const IS_FORM_OPEN = true;

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

const FormComp = ({ setLoadingStatus, setSubmitStatus }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const rollno = watch("rollno", "");
  React.useEffect(() => {
    if (rollno && rollno !== rollno.toUpperCase()) {
      setValue("rollno", rollno.toUpperCase());
    }
  }, [rollno, setValue]);

  // Register dropdown fields manually for validation (DropdownCombobox doesn't support ...register())
  React.useEffect(() => {
    register("year", { required: "Year is required" });
    register("branch", { required: "Department is required" });
    register("section", { required: "Section is required" });
    register("paymentplatform", {
      required: "Please select a payment platform",
    });
  }, [register]);

  const yearValue = watch("year", "");
  const branchValue = watch("branch", "");
  const sectionValue = watch("section", "");
  const paymentPlatformValue = watch("paymentplatform", "");

  const submitForm = async (data) => {
    try {
      setLoadingStatus(true);

      const file = data.screenshot[0];
      const uniqueFileName = `${Date.now()}_${file.name}`;

      const {
        data: { signedUrl, fileName },
      } = await api.post("/register/get-signed-url", {
        fileName: uniqueFileName,
        fileType: file.type,
      });

      await axios.put(signedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      const payload = {
        ...data,
        screenshot: fileName,
        event: "ssd",
        qr: QR_CONFIG[activeQR].qrValue,
      };
      const response = await api.post("/register", payload);

      setSubmitStatus(false);
      if (response.data.success) {
        setSubmitStatus(true);
        reset();
      } else {
        setSubmitStatus(false);
      }
    } catch (error) {
      alert("Error submitting form. Please try again later.");
      setSubmitStatus(false);
      console.error("Error submitting form:", error);
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
      className=""
    >
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <Network size={22} className="text-[#135168]" />
          <h1 className="text-2xl md:text-2xl font-bold text-gray-900">
            Summer <span className="text-[#135168]">System Design</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Register for the 2-day intensive workshop
        </p>
      </div>

      <form onSubmit={handleSubmit(submitForm)} className="grid gap-2 p-4">
        {/* Name */}
        <div>
          <label className="text-sm text-gray-950 font-medium">Name</label>
          <input
            {...register("name", { required: "Name is required" })}
            placeholder="Full Name"
            className="border border-gray-300 p-2.5 w-full rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#135168] focus:border-transparent transition-all"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Roll Number & Year */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-950 font-medium">
              Roll Number
            </label>
            <input
              {...register("rollno", { required: "Roll Number is required" })}
              placeholder="e.g. 22071A1234"
              className="border border-gray-300 p-2.5 w-full rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#135168] focus:border-transparent transition-all"
            />
            {errors.rollno && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rollno.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-950 font-medium">Year</label>
            <div className="mt-1">
              <DropdownCombobox
                options={[
                  { label: "1st Year", value: "1" },
                  { label: "2nd Year", value: "2" },
                  { label: "3rd Year", value: "3" },
                  { label: "4th Year", value: "4" },
                ]}
                value={yearValue}
                onChange={(val) =>
                  setValue("year", val, { shouldValidate: true })
                }
                placeholder="Select Year"
                disableSearch
              />
            </div>
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>
        </div>

        {/* Department & Section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-950 font-medium">
              Department
            </label>
            <div className="mt-1">
              <DropdownCombobox
                options={[
                  "CSE",
                  "IT",
                  "CSBS",
                  "CSE-DS",
                  "CSE-CyS",
                  "AI&DS",
                  "AIML",
                  "IOT",
                  "ECE",
                  "EEE",
                  "EIE",
                  "MECHANICAL",
                  "CIVIL",
                  "AUTOMOBILE",
                ]}
                value={branchValue}
                onChange={(val) =>
                  setValue("branch", val, { shouldValidate: true })
                }
                placeholder="Select Dept"
              />
            </div>
            {errors.branch && (
              <p className="text-red-500 text-sm mt-1">
                {errors.branch.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-950 font-medium">Section</label>
            <div className="mt-1">
              <DropdownCombobox
                options={["A", "B", "C", "D"]}
                value={sectionValue}
                onChange={(val) =>
                  setValue("section", val, { shouldValidate: true })
                }
                placeholder="Select Section"
                disableSearch
              />
            </div>
            {errors.section && (
              <p className="text-red-500 text-sm mt-1">
                {errors.section.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-950 font-medium">Email</label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            placeholder="your.email@example.com"
            className="border border-gray-300 p-2.5 w-full rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#135168] focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="text-sm text-gray-950 font-medium">
            Phone Number
          </label>
          <input
            {...register("phno", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit phone number",
              },
            })}
            type="tel"
            placeholder="10-digit phone number"
            className="border border-gray-300 p-2.5 w-full rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#135168] focus:border-transparent transition-all"
          />
          {errors.phno && (
            <p className="text-red-500 text-sm mt-1">{errors.phno.message}</p>
          )}
        </div>

        {/* Payment QR Code */}
        <div className="text-center">
          <label className="text-md text-gray-950 block">Payment QR Code</label>
          <img
            src={QR_CONFIG[activeQR].qrImage}
            alt="Payment QR Code"
            className="max-w-[200px] mx-auto rounded shadow"
          />
        </div>
        {/* Payment Platform */}
        <div className="mt-1">
          <label className="text-sm text-gray-950 font-medium block">
            Payment Platform
          </label>
          <div className="mt-1">
            <DropdownCombobox
              options={[
                "Google Pay",
                "PhonePe",
                "Paytm",
                "Amazon Pay",
                "BHIM UPI",
                "FamPay",
                "Mobikwik",
                "WhatsApp Pay",
                "FreeCharge",
                "Other",
              ]}
              value={paymentPlatformValue}
              onChange={(val) =>
                setValue("paymentplatform", val, { shouldValidate: true })
              }
              placeholder="Select Payment Platform"
            />
          </div>
          {errors.paymentplatform && (
            <p className="text-red-500 text-sm mt-1">
              {errors.paymentplatform.message}
            </p>
          )}
        </div>
        {/* Transaction ID */}
        <div>
          <label className="text-sm text-gray-950 font-medium">
            Transaction ID
          </label>
          <input
            {...register("transactionid", {
              required: "Transaction ID is required",
            })}
            placeholder="Transaction ID"
            className="border border-gray-300 p-2.5 w-full rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#135168] focus:border-transparent transition-all"
          />
          {errors.transactionid && (
            <p className="text-red-500 text-sm mt-1">
              {errors.transactionid.message}
            </p>
          )}
        </div>
        {/* Payment Screenshot */}
        <div>
          <label className="text-sm text-gray-950 font-medium">
            Payment Screenshot
          </label>
          <input
            {...register("screenshot", {
              required: "Payment screenshot is required",
            })}
            type="file"
            accept="image/*"
            className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#135168] focus:border-transparent transition-all file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#0f323f] file:text-white hover:file:bg-[#135168] file:cursor-pointer"
          />
          {errors.screenshot && (
            <p className="text-red-500 text-sm mt-1">
              {errors.screenshot.message}
            </p>
          )}
        </div>
        {/* Submit Button */}
        <div className="mt-3 flex justify-center">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-gradient-to-r px-8 bg-[#0f323fee] hover:bg-[#135168] md:from-blue-900 md:to-teal-400 text-white font-semibold py-2.5 rounded-full shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300"
          >
            <span>Register Now</span>
            <Send size={16} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const SubmittedComp = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        key="submitted"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={transitionVariants}
        className="flex flex-col items-center justify-center min-h-[40vh] text-center"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 10,
            delay: 0.2,
          }}
          className="bg-green-500 text-white p-4 rounded-full shadow-lg"
        >
          <CheckCircle size={50} />
        </motion.div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Registration Successful!
        </h2>
        <p className="text-gray-600 mt-2">
          Thank you for registering for Summer System Design. You will receive a
          confirmation email soon.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-2 font-semibold rounded-full shadow-md bg-gradient-to-r bg-[#0f323fee] hover:bg-[#135168] text-white"
          onClick={() => (window.top.location.href = "/events")}
        >
          Back to Events
        </motion.button>
      </motion.div>
    </div>
  );
};

const LoadingComp = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center min-h-[40vh]">
        <motion.img
          src="/icon-logo.jpg"
          alt="Loading Logo"
          variants={pulseVariants}
          animate="animate"
          className="w-24 h-24 object-contain"
        />
        <p>Loading, please wait...</p>
      </div>
    </div>
  );
};

const FormClosedComp = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center min-h-[40vh] p-6"
      >
        <Lock size={48} className="text-gray-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Registration Closed
        </h2>
        <p className="text-gray-600 text-center">
          Thank you for your interest in Summer System Design!
        </p>
        <p className="text-gray-600 text-center mb-6">
          Registration is no longer being accepted.
        </p>

        <div className="mt-6 border-t pt-6 w-full max-w-md">
          <p className="text-gray-800 font-medium text-center mb-3">
            In case of any queries, contact our coordinators!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="bg-gray-100 px-4 py-3 rounded-lg text-center w-full sm:w-auto">
              <p className="font-medium text-gray-800">Rohith</p>
              <p className="text-gray-600"> 77998 82377</p>
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-lg text-center w-full sm:w-auto">
              <p className="font-medium text-gray-800">Siddharth</p>
              <p className="text-gray-600">91824 91865</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SSDForm = () => {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(false);
  const [formStatus] = useState({
    isFormOpen: IS_FORM_OPEN,
  });

  return (
    <motion.div
      className="w-full max-w-full pt-2 px-4 pb-4 overflow-y-auto md:max-h-[90vh] small-scrollbar md:rounded-r-lg h-full"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {loadingStatus ? (
        <LoadingComp />
      ) : formStatus.isFormOpen ? (
        <FormClosedComp />
      ) : submitStatus ? (
        <SubmittedComp />
      ) : (
        <FormComp
          setLoadingStatus={setLoadingStatus}
          setSubmitStatus={setSubmitStatus}
        />
      )}
    </motion.div>
  );
};

export default SSDForm;
