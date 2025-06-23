// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { Send, CheckCircle, Lock } from "lucide-react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// const SERVER_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000"
//     : "https://api.vjdataquesters.com";

// const api = axios.create({
//   baseURL: SERVER_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const transitionVariants = {
//   initial: { opacity: 0, filter: "blur(10px)" },
//   animate: {
//     opacity: 1,
//     filter: "blur(0px)",
//     transition: { duration: 0.5, ease: "easeOut" },
//   },
//   exit: {
//     opacity: 0,
//     filter: "blur(10px)",
//     transition: { duration: 0.5, ease: "easeIn" },
//   },
// };

// const pulseVariants = {
//   animate: {
//     opacity: [0.2, 0.6, 1, 0.6, 0.2],
//     transition: {
//       duration: 1.2,
//       repeat: Infinity,
//       ease: "easeInOut",
//     },
//   },
// };

// const FormComp = ({ setLoadingStatus, setSubmitStatus, formStatus }) => {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     getValues,
//     formState: { errors },
//     reset,
//   } = useForm();

//   const rollno = watch("rollno", "");
//   const college = watch("college", "");

//   useEffect(() => {
//     if (rollno && rollno !== rollno.toUpperCase()) {
//       setValue("rollno", rollno.toUpperCase());
//     }
//   }, [rollno, setValue]);

//   const submitForm = async (data) => {
//     try {
//       setLoadingStatus(true);
//       const response = await api.post("/register/tv25", data);
//       setSubmitStatus(false);
//       if (response.data.success) {
//         setSubmitStatus(true);
//         reset();
//       } else {
//         setSubmitStatus(false);
//       }
//     } catch (error) {
//       alert("Error submitting form. Please try again later.");
//       setSubmitStatus(false);
//       console.error("Error submitting payment:", error);
//     } finally {
//       setLoadingStatus(false);
//     }
//   };

//   // TECH NOTE -> REGISTRATION FORM FOR TECHNOVISTA SHALL NOT BE LIKE CLOUD CRAFT,
//   // MAKE IT SIMPLE WITH THEME OF BLACK AND GOLD -> BG BLACK, AND EVERYTHING GOLD -- KARTHIKEYA

//   return (
//     <motion.div
//       key="form"
//       initial="initial"
//       animate="animate"
//       exit="exit"
//       variants={transitionVariants}
//       className="md:h-[80vh] bg-transparent"
//     >
//       <div className="flex flex-col justify-center ">
//         <div className="flex items-center justify-between">
//           <h1 className="text-lg md:text-2xl font-bold text-gray-900">
//             <span className="text-blue-500">&lt;/&gt;</span> TechnoVista 2k25
//           </h1>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(submitForm)} className="grid gap-2 p-4">
//         {/* Full Name */}
//         <div>
//           <label className="text-sm text-gray-950">Full Name</label>
//           <input
//             {...register("name", { required: true })}
//             placeholder="Name"
//             className="border p-2 w-full rounded-md"
//           />
//           {errors.name && (
//             <p className="text-red-500 text-sm">Name is required</p>
//           )}
//         </div>

//         {/* College Selection */}
//         <div className="mb-1">
//           <label className="text-sm text-gray-950 block mb-1">College</label>
//           <div className="flex items-center space-x-4">
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 {...register("college", {
//                   required: "College selection is required",
//                 })}
//                 value="VNRVJIET"
//                 className="form-radio h-4 w-4 text-blue-600"
//               />
//               <span className="ml-2">VNRVJIET</span>
//             </label>
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 {...register("college", {
//                   required: "College selection is required",
//                 })}
//                 value="Other"
//                 className="form-radio h-4 w-4 text-blue-600"
//               />
//               <span className="ml-2">Other</span>
//             </label>
//           </div>
//           {errors.college && (
//             <p className="text-red-500 text-sm">{errors.college.message}</p>
//           )}
//         </div>

//         {/* Conditional College Name field */}
//         {watch("college") === "Other" && (
//           <div>
//             <label className="text-sm text-gray-950">College Name</label>
//             <input
//               {...register("collegeName", {
//                 required:
//                   watch("college") === "Other"
//                     ? "College name is required"
//                     : false,
//               })}
//               placeholder="Enter your college name"
//               className="border p-2 w-full rounded-md"
//             />
//             {errors.collegeName && (
//               <p className="text-red-500 text-sm">
//                 {errors.collegeName.message}
//               </p>
//             )}
//           </div>
//         )}

//         {/* Branch & Section */}
//         <div className="grid grid-cols-2 gap-2">
//           <div>
//             <label className="text-sm text-gray-950">Branch</label>
//             <select
//               {...register("branch", { required: true })}
//               className="border p-2 w-full rounded-md mt-1"
//               defaultValue=""
//             >
//               <option value="" disabled>
//                 Select Branch
//               </option>
//               <option value="CSE">CSE</option>
//               <option value="IT">IT</option>
//               <option value="CSBS">CSBS</option>
//               <option value="CSE-DS">CSE-DS</option>
//               <option value="CSE-CyS">CSE-CyS</option>
//               <option value="AI&DS">AI&DS</option>
//               <option value="AIML">AIML</option>
//               <option value="IOT">IOT</option>
//               <option value="ECE">ECE</option>
//               <option value="EEE">EEE</option>
//               <option value="EIE">EIE</option>
//               <option value="MECHANICAL">MECHANICAL</option>
//               <option value="CIVIL">CIVIL</option>
//               <option value="AUTOMOBILE">AUTOMOBILE</option>
//             </select>
//             {errors.branch && (
//               <p className="text-red-500 text-sm">Branch is required</p>
//             )}
//           </div>
//           <div>
//             <label className="text-sm text-gray-950">Section</label>
//             <select
//               {...register("section", { required: true })}
//               className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select Section</option>
//               <option value="A">A</option>
//               <option value="B">B</option>
//               <option value="C">C</option>
//               <option value="D">D</option>
//             </select>
//             {errors.section && (
//               <p className="text-red-500 text-sm">Section is required</p>
//             )}
//           </div>
//         </div>

//         {/* Roll Number & Year */}
//         <div className="grid grid-cols-2 gap-2">
//           <div>
//             <label className="text-sm text-gray-950">Roll Number</label>
//             <input
//               {...register("rollno", {
//                 required: "Roll number is required",
//                 validate: (value) => {
//                   const selectedCollege = getValues("college");
//                   if (selectedCollege === "VNRVJIET") {
//                     const isValid =
//                       /^[0-9]{2}(071A|075A)[0-9]{2}([0-9]{2}|[A-Za-z][0-9]|[0-9][A-Za-z])$/.test(
//                         value
//                       );
//                     return (
//                       (isValid && value.length === 10) ||
//                       "Enter a valid roll number"
//                     );
//                   }
//                   return true;
//                 },
//               })}
//               placeholder="Roll No"
//               className="border p-2 w-full rounded-md"
//             />
//             {errors.rollno && (
//               <p className="text-red-500 text-sm">{errors.rollno.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="text-sm text-gray-950">Year</label>
//             <select
//               {...register("year", { required: true })}
//               className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select Year</option>
//               <option value="1">1st Year</option>
//               <option value="2">2nd Year</option>
//               <option value="3">3rd Year</option>
//               <option value="4">4th Year</option>
//             </select>
//             {errors.year && (
//               <p className="text-red-500 text-sm">Year is required</p>
//             )}
//           </div>
//         </div>

//         {/* Contact Number */}
//         <div>
//           <label className="text-sm text-gray-950">Contact Number</label>
//           <input
//             {...register("phno", {
//               required: "Phone No is required",
//               pattern: {
//                 value: /^[0-9]{10}$/,
//                 message: "Enter a valid 10-digit phone number",
//               },
//             })}
//             type="tel"
//             placeholder="Phone No"
//             className="border p-2 w-full rounded-md"
//           />
//           {errors.phno && (
//             <p className="text-red-500 text-sm">{errors.phno.message}</p>
//           )}
//         </div>

//         <div>
//           <label className="text-sm text-gray-950">Email</label>
//           <input
//             {...register("email", {
//               required: "Email is required",
//               pattern: {
//                 value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                 message: "Enter a valid email address",
//               },
//             })}
//             placeholder="Email"
//             className="border p-2 w-full rounded-md"
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm">{errors.email.message}</p>
//           )}
//         </div>

//         {/* Payment QR Code */}
//         <div className="text-center">
//           <label className="text-md text-gray-950 block">Payment QR Code</label>
//           <p>
//             Account Holder: <span id="accountHolder">K. Adithya</span>
//           </p>
//           <img
//             src="/paymentsQR.jpg"
//             alt="Payment QR Code"
//             className="max-w-[200px] mx-auto rounded shadow"
//           />
//         </div>

//         {/* Payment Platform */}
//         <div className="mt-1">
//           <label className="text-sm text-gray-950 block">
//             Payment Platform
//           </label>
//           <select
//             {...register("paymentplatform", { required: true })}
//             className="border p-2 w-full rounded-md"
//             defaultValue=""
//           >
//             <option value="" disabled>
//               Select Payment Platform
//             </option>
//             <option value="Google Pay">Google Pay</option>
//             <option value="PhonePe">PhonePe</option>
//             <option value="Paytm">Paytm</option>
//             <option value="Amazon Pay">Amazon Pay</option>
//             <option value="BHIM UPI">BHIM UPI</option>
//             <option value="FamPay">Fampay</option>
//             <option value="Mobikwik">Mobikwik</option>
//             <option value="WhatsApp Pay">WhatsApp Pay</option>
//             <option value="FreeCharge">FreeCharge</option>
//             <option value="other">other</option>
//           </select>
//           {errors.paymentplatform && (
//             <p className="text-red-500 text-sm">
//               Please select a payment platform
//             </p>
//           )}
//         </div>

//         {/* Transaction ID */}
//         <div>
//           <label className="text-sm text-gray-950">Transaction ID</label>
//           <input
//             {...register("transactionid", { required: true })}
//             placeholder="Transaction ID"
//             className="border p-2 w-full rounded-md"
//           />
//           {errors.transactionid && (
//             <p className="text-red-500 text-sm">Transaction ID is required</p>
//           )}
//         </div>
//         {/* Submit Button */}
//         <div className="mt-3 flex justify-center">
//           <button
//             type="submit"
//             className="flex items-center justify-center gap-2 bg-gradient-to-r px-5 bg-[#0f323fee] hover:bg-[#135168] md:from-blue-900 md:to-teal-400 text-white font-semibold py-2 rounded-full shadow hover:opacity-90"
//           >
//             <span>Submit</span>
//             <Send size={16} />
//           </button>
//         </div>
//       </form>
//     </motion.div>
//   );
// };
// const SubmittedComp = () => {
//   const navigate = useNavigate();
//   return (
//     <motion.div
//       key="submitted"
//       initial="initial"
//       animate="animate"
//       exit="exit"
//       variants={transitionVariants}
//       className="flex flex-col items-center justify-center min-h-[80vh] text-center"
//     >
//       <motion.div
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1.2, opacity: 1 }}
//         transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.2 }}
//         className="bg-green-500 text-white p-4 rounded-full shadow-lg"
//       >
//         <CheckCircle size={50} />
//       </motion.div>

//       <h2 className="text-2xl font-semibold text-gray-900 mt-4">
//         🎉 Submission Successful!
//       </h2>
//       <p className="text-gray-600 mt-2">
//         Thank you for registering. You will receive a confirmation email soon.
//       </p>

//       {/* Back Button */}
//       <motion.button
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         className="mt-6 px-6 py-2 font-semibold rounded-full shadow-md bg-gradient-to-r bg-[#0f323fee] hover:bg-[#135168] text-white"
//         onClick={() => navigate("/events")}
//       >
//         Back to Events
//       </motion.button>
//     </motion.div>
//   );
// };
// const LoadingComp = () => {
//   return (
//     <div className="flex flex-col items-center justify-center text-center min-h-[80vh]">
//       {/* Spinning Loader */}
//       <motion.img
//         src="/icon-logo.jpg"
//         alt="Loading Logo"
//         variants={pulseVariants}
//         animate="animate"
//         className="w-24 h-24 object-contain"
//       />

//       {/* Loading Text with Animation */}
//       <motion.p
//         variants={pulseVariants}
//         animate="animate"
//         className="text-gray-700 font-semibold text-lg mt-2"
//       >
//         Loading, please wait...
//       </motion.p>
//     </div>
//   );
// };
// const FormClosedComp = () => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, filter: "blur(10px)" }}
//       animate={{ opacity: 1, filter: "blur(0px)" }}
//       transition={{ duration: 0.8, ease: "easeOut" }}
//       className="flex flex-col items-center justify-center min-h-[80vh] p-6 "
//     >
//       <Lock size={48} className="text-gray-500 mb-4" />
//       <h2 className="text-xl font-bold text-gray-800">Registration Closed</h2>
//       <p className="text-gray-600 text-center">
//         Thank you for your interest in our event!
//       </p>
//       <p className="text-gray-600 text-center">
//         Registration is no longer being accepted.
//       </p>
//     </motion.div>
//   );
// };
// const RegistrationForm = () => {
//   const [loadingStatus, setLoadingStatus] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState(false);
//   const [formStatus, setFormStatus] = useState({
//     isFormOpen: true,
//     // currentRegistrations: 0,
//     // maxRegistrations: 150,
//     // lastUpdated: "",
//   });

//   // useEffect(() => {
//   // setTimeout(() => setFormStatus({ ...formStatus, isFormOpen: true }), 0);
//   // setTimeout(() => setLoadingStatus(true), 2000);
//   // setTimeout(() => setLoadingStatus(false), 4000);
//   // setTimeout(() => setSubmitStatus(true), 4000);
//   // setTimeout(() => setFormStatus({ ...formStatus, isFormOpen: false }), 5000);

//   // const fetchStatus = async () => {
//   //   try {
//   //     setLoadingStatus(true);
//   //     const response = await api.get("/stats");
//   //     // console.log(response);
//   //     if (response.data.success === true && response.data.data) {
//   //       setFormStatus({
//   //         isFormOpen: response.data.data.isFormOpen,
//   //         currentRegistrations: response.data.data.currentRegistrations || 0,
//   //         maxRegistrations: response.data.data.maxRegistrations || 150,
//   //         lastUpdated:
//   //           response.data.data.lastUpdated || new Date().toISOString(),
//   //       });
//   //     } else {
//   //       throw new Error(response.data.error);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error);
//   //   } finally {
//   //     setLoadingStatus(false);
//   //   }
//   // };
//   // fetchStatus();
//   // }, []);
//   // put a use effect and hit /status endpoint to get isForm
//   /**
//    * @param { * {
//    *  isFormOpen: boolean;
//    *  currentRegistrations: number;
//    *  maxRegistrations: number
//    *  lastUpdated: string;
//    * }}
//    *
//    * if isFormOpen is false - dont show the form
//    * also show the participant currentRegistrations and maxRegistrations
//    *
//    */

//   return (
//     <motion.div
//       className="w-full max-w-full md:shadow-lg p-4 border overflow-y-auto md:max-h-[90vh] small-scrollbar md:rounded-r-lg"
//       initial={{ opacity: 0, filter: "blur(10px)" }}
//       animate={{ opacity: 1, filter: "blur(0px)" }}
//       transition={{ duration: 1, ease: "easeOut" }}
//     >
//       {loadingStatus ? (
//         <LoadingComp />
//       ) : !formStatus.isFormOpen ? (
//         <FormClosedComp />
//       ) : submitStatus ? (
//         <SubmittedComp />
//       ) : (
//         <FormComp
//           setLoadingStatus={setLoadingStatus}
//           setSubmitStatus={setSubmitStatus}
//           formStatus={formStatus}
//         />
//       )}
//     </motion.div>
//   );
// };

// export default RegistrationForm;








import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  CheckCircle,
  Lock,
  Send,
  Code,
  Zap,
  Star,
  Circle,
  Triangle,
  Square,
} from "lucide-react";
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
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const FormComp = ({ setLoadingStatus, setSubmitStatus, formStatus }) => {
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [focusedField, setFocusedField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      college: "",
      collegeName: "",
      branch: "",
      section: "",
      rollno: "",
      year: "",
      phno: "",
      email: "",
      paymentplatform: "",
      transactionid: "",
    },
  });

  const watchCollege = watch("college");
  const containerRef = useRef(null);

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          type: ["circle", "triangle", "square"][Math.floor(Math.random() * 3)],
        });
      }
      setParticles(newParticles);
    };

    generateParticles();

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: particle.y > 100 ? -5 : particle.y + particle.speed * 0.1,
          x: particle.x + Math.sin(particle.y * 0.01) * 0.1,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/submit", data);
      setSubmitStatus(true);
    } catch (error) {
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ParticleShape = ({ particle }) => {
    const shapeProps = {
      className: `absolute transition-all duration-1000 ease-out`,
      style: {
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        opacity: particle.opacity,
        transform: `rotate(${particle.y * 2}deg)`,
      },
    };

    switch (particle.type) {
      case "circle":
        return (
          <Circle
            {...shapeProps}
            className={`${shapeProps.className} text-yellow-400`}
          />
        );
      case "triangle":
        return (
          <Triangle
            {...shapeProps}
            className={`${shapeProps.className} text-yellow-500`}
          />
        );
      case "square":
        return (
          <Square
            {...shapeProps}
            className={`${shapeProps.className} text-yellow-300`}
          />
        );
      default:
        return (
          <div
            {...shapeProps}
            className={`${shapeProps.className} bg-yellow-400 rounded-full`}
          />
        );
    }
  };

  // Updated InputField and SelectField to accept ...rest
  const InputField = ({
    label,
    name,
    type = "text",
    placeholder,
    children,
    ...rest
  }) => (
    <div className="group relative">
      <label className="text-sm font-medium text-yellow-300 block mb-2 transition-colors duration-300 group-hover:text-yellow-200">
        {label}
        <span className="text-red-400 ml-1">*</span>
      </label>
      <div className="relative">
        {children || (
          <input
            type={type}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField("")}
            placeholder={placeholder}
            className={`
              w-full p-3 bg-gray-900/50 backdrop-blur-sm text-yellow-300 
              placeholder-yellow-500/60 border-2 rounded-xl
              transition-all duration-300 ease-out
              focus:scale-105 focus:shadow-2xl focus:shadow-yellow-500/20
              hover:bg-gray-800/50 hover:border-yellow-400
              ${
                focusedField === name
                  ? "border-yellow-400 shadow-lg shadow-yellow-500/30"
                  : "border-yellow-500/30"
              }
              ${errors[name] ? "border-red-400 animate-pulse" : ""}
            `}
            {...rest}
          />
        )}
        {focusedField === name && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 animate-pulse pointer-events-none" />
        )}
      </div>
      {errors[name] && (
        <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
          <Zap size={12} />
          {errors[name]?.message}
        </p>
      )}
    </div>
  );

  const SelectField = ({ label, name, options, placeholder, ...rest }) => (
    <InputField label={label} name={name} placeholder={placeholder}>
      <select
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField("")}
        className={`
          w-full p-3 bg-gray-900/50 backdrop-blur-sm text-yellow-300 
          border-2 rounded-xl appearance-none cursor-pointer
          transition-all duration-300 ease-out
          focus:scale-105 focus:shadow-2xl focus:shadow-yellow-500/20
          hover:bg-gray-800/50 hover:border-yellow-400
          ${
            focusedField === name
              ? "border-yellow-400 shadow-lg shadow-yellow-500/30"
              : "border-yellow-500/30"
          }
          ${errors[name] ? "border-red-400 animate-pulse" : ""}
        `}
        {...rest}
      >
        <option value="" disabled className="bg-gray-900 text-gray-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-900 text-yellow-300"
          >
            {option.label}
          </option>
        ))}
      </select>
    </InputField>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-yellow-400 relative overflow-hidden"
      >
        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <ParticleShape key={particle.id} particle={particle} />
          ))}
        </div>

        {/* Mouse Follower Effect */}
        <div
          className="absolute w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="animate-spin-slow">
                <Code className="text-yellow-500" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                TechnoVista 2k25
              </h1>
              <div className="animate-pulse">
                <Star className="text-yellow-500" size={32} />
              </div>
            </div>
            <p className="text-yellow-300/80 text-lg">
              Join the future of technology • Experience innovation
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="w-full max-w-4xl mx-auto px-4">
            <div className="bg-black/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-yellow-500/20 shadow-2xl">
              <div className="grid gap-8">
                {/* Full Name */}
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <div className="group relative">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-yellow-500"
                      {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* College Selection */}
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <div className="group relative">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      College <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-6">
                      {[
                        { value: "VNRVJIET", label: "VNRVJIET" },
                        { value: "Other", label: "Other" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            {...register("college", {
                              required: "College selection is required",
                            })}
                            className="w-5 h-5 text-yellow-500 border-2 border-yellow-500 focus:ring-yellow-400 focus:ring-2"
                          />
                          <span className="text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.college && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.college.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Conditional College Name */}
                {watchCollege === "Other" && (
                  <motion.div
                    className="transform hover:scale-105 transition-all duration-300"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      College Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your college name"
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-yellow-500"
                      {...register("collegeName", {
                        required: "College name is required",
                      })}
                    />
                    {errors.collegeName && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.collegeName.message}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* // Branch & Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Branch <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      {...register("branch", {
                        required: "Branch is required",
                      })}
                    >
                      <option value="">Select Branch</option>
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
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.branch.message}
                      </p>
                    )}
                  </div>
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Section <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      {...register("section", {
                        required: "Section is required",
                      })}
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                    {errors.section && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.section.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* // Roll Number & Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Roll Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter roll number"
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-yellow-500"
                      {...register("rollno", {
                        required: "Roll number is required",
                        validate: (value) => {
                          if (watchCollege === "VNRVJIET") {
                            const isValid =
                              /^[0-9]{2}(071A|075A)[0-9]{2}([0-9]{2}|[A-Za-z][0-9]|[0-9][A-Za-z])$/.test(
                                value
                              );
                            if (!isValid || value.length !== 10) {
                              return "Enter a valid roll number";
                            }
                          }
                          return true;
                        },
                      })}
                    />
                    {errors.rollno && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.rollno.message}
                      </p>
                    )}
                  </div>
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Year <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      {...register("year", { required: "Year is required" })}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    {errors.year && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.year.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Contact Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-yellow-500"
                      {...register("phno", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter a valid 10-digit phone number",
                        },
                      })}
                    />
                    {errors.phno && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.phno.message}
                      </p>
                    )}
                  </div>
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-yellow-500"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment QR */}
                <div className="text-center py-8 bg-gray-900/30 rounded-2xl border border-yellow-500/10">
                  <h3 className="text-xl font-semibold mb-2">
                    Payment QR Code
                  </h3>
                  <p className="mb-4">
                    Account Holder:{" "}
                    <span className="font-semibold text-yellow-300">
                      K. Adithya
                    </span>
                  </p>
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <img
                      src="/paymentsQR.jpg"
                      alt="Payment QR Code"
                      className="w-48 h-48 rounded-xl object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center"
                      style={{ display: "none" }}
                    >
                      <span className="text-gray-600 text-sm">
                        QR Code Not Found
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Platform & Transaction ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Payment Platform <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      {...register("paymentplatform", {
                        required: "Please select a payment platform",
                      })}
                    >
                      <option value="">Select Payment Platform</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Paytm">Paytm</option>
                      <option value="Amazon Pay">Amazon Pay</option>
                      <option value="BHIM UPI">BHIM UPI</option>
                      <option value="FamPay">FamPay</option>
                      <option value="Mobikwik">Mobikwik</option>
                      <option value="WhatsApp Pay">WhatsApp Pay</option>
                      <option value="FreeCharge">FreeCharge</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.paymentplatform && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.paymentplatform.message}
                      </p>
                    )}
                  </div>
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <label className="text-sm font-medium text-yellow-300 block mb-2">
                      Transaction ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter transaction ID"
                      className="w-full px-4 py-2 bg-black text-yellow-300 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-yellow-500"
                      {...register("transactionid", {
                        required: "Transaction ID is required",
                      })}
                    />
                    {errors.transactionid && (
                      <p className="text-red-400 text-sm mt-1 animate-bounce flex items-center gap-1">
                        <Zap size={12} />
                        {errors.transactionid.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      group relative inline-flex items-center gap-3 px-8 py-4 
                      bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 
                      text-black font-bold text-lg rounded-full
                      transform transition-all duration-300 ease-out
                      hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/40
                      focus:outline-none focus:ring-4 focus:ring-yellow-400/50
                      ${
                        isSubmitting
                          ? "animate-pulse cursor-not-allowed"
                          : "hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500"
                      }
                    `}
                  >
                    <span>
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </span>
                    <Send
                      size={20}
                      className={`transition-transform duration-300 ${
                        isSubmitting
                          ? "animate-spin"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                    {!isSubmitting && (
                      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `}</style>
      </div>
    </form>
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
      <motion.img
        src="/icon-logo.jpg"
        alt="Loading Logo"
        variants={pulseVariants}
        animate="animate"
        className="w-24 h-24 object-contain"
      />

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
      className="flex flex-col items-center justify-center min-h-[80vh] p-6 "
    >
      <Lock size={48} className="text-gray-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-800">Registration Closed</h2>
      <p className="text-gray-600 text-center">
        Thank you for your interest in our event!
      </p>
      <p className="text-gray-600 text-center">
        Registration is no longer being accepted.
      </p>
    </motion.div>
  );
};

const RegistrationForm = () => {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(false);
  const [formStatus, setFormStatus] = useState({
    isFormOpen: true,
  });

 return (
  <motion.div
    className="w-full max-w-2xl bg-black rounded-2xl shadow-2xl border-2 border-yellow-500/30 relative h-[805px]"
    initial={{ opacity: 0, filter: "blur(10px)" }}
    animate={{ opacity: 1, filter: "blur(0px)" }}
    transition={{ duration: 1, ease: "easeOut" }}
  >
    {/* Decorative golden corners - FIXED to container */}
    <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-yellow-400 rounded-tl-2xl z-30"></div>
    <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-yellow-400 rounded-tr-2xl z-30"></div>
    <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-yellow-400 rounded-bl-2xl z-30"></div>
    <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-yellow-400 rounded-br-2xl z-30"></div>

    {/* Golden glow effect */}
    <div className="absolute inset-0 bg-gradient-radial from-yellow-400/5 via-transparent to-transparent rounded-2xl"></div>

    {/* Scrollable content container */}
    <div className="relative z-10 h-full overflow-y-auto p-8 small-scrollbar">
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
    </div>
  </motion.div>
);
};

export default RegistrationForm;

