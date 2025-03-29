import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [submitStatus, setSubmitStatus] = useState(false);
  const submitForm = async (data) => {
    setSubmitStatus(false);
    console.log("Payment Form Data:", data);
    try {
      const response = await axios.post(`${SERVER_URL}/register`, data);
      if (response.data.error) {
        alert(response.data.error);
      } else {
        setSubmitStatus(true);
      }
      console.log("Payment Response:", response.data);
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  return (

    <div className="p-4 py-32 max-w-md mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Event Form</h2>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-3">
        <input
          {...register("name", { required: true })}
          placeholder="Name"
          className="border p-2 w-full"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">Name is required</p>
        )}
        <input
          {...register("rollno", { required: true })}
          placeholder="Roll No"
          className="border p-2 w-full"
        />
        {errors.rollno && (
          <p className="text-red-500 text-sm">Roll No is required</p>
        )}

        <select
          {...register("branch", { required: true })}
          className="border p-2 w-full"
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

        <div>
          <p className="font-medium">Year</p>
          <select
            {...register("year", { required: true })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          {errors.year && (
            <p className="text-red-500 text-sm">Year is required</p>
          )}
        </div>

        <input
          {...register("email", { required: true })}
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">Valid Email is required</p>
        )}

        <input
          {...register("phno", { required: true })}
          type="tel"
          placeholder="Phone No"
          className="border p-2 w-full"
        />
        {errors.phno && (
          <p className="text-red-500 text-sm">Phone No is required</p>
        )}

        <select
          {...register("paymentplatform", { required: true })}
          className="border p-2 w-full"
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

        <input
          {...register("transactionid", { required: true })}
          placeholder="Transaction ID"
          className="border p-2 w-full"
        />
        {errors.transactionid && (
          <p className="text-red-500 text-sm">Transaction ID is required</p>
        )}
        {submitStatus && (
          <p className="text-green-500 text-sm">User registered Successfully</p>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Submit
        </button>
      </form>
    </div>

  );
}

export default Form;
