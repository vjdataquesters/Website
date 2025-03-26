import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function Form() {
  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
  } = useForm();

  const {
    register: registerTransaction,
    handleSubmit: handleTransactionSubmit,
    formState: { errors: transactionErrors },
  } = useForm();

  const [makePaymentStatus, setMakePaymentStatus] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(false);
  const makePayment = async (data) => {
    setMakePaymentStatus(false);
    console.log("Payment Form Data:", data);
    try {
      const response = await axios.post(
        `${SERVER_URL}/register/makepayment`,
        data
      );
      if (response.data.error) {
        alert(response.data.error);
      } else {
        setMakePaymentStatus(true);
      }

      console.log("Payment Response:", response.data);
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  const submitTransaction = async (data) => {
    console.log("transaction Form Data:", data);
    setTransactionStatus(false);
    try {
      const response = await axios.post(
        `${SERVER_URL}/register/submittransaction`,
        data
      );
      if (response.data.error) {
        alert(response.data.error);
      } else {
        setTransactionStatus(true);
      }

      console.log("Transaction Response:", response.data);
    } catch (error) {
      console.error("Error submitting Transaction:", error);
    }
  };

  return (
    <div className="p-4 py-32 max-w-md mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Payment Form</h2>
      <form onSubmit={handlePaymentSubmit(makePayment)} className="space-y-3">
        <input
          {...registerPayment("name", { required: true })}
          placeholder="Name"
          className="border p-2 w-full"
        />
        {paymentErrors.name && (
          <p className="text-red-500 text-sm">Name is required</p>
        )}
        <input
          {...registerPayment("rollno", { required: true })}
          placeholder="Roll No"
          className="border p-2 w-full"
        />
        {paymentErrors.rollno && (
          <p className="text-red-500 text-sm">Roll No is required</p>
        )}

        <select
          {...registerPayment("branch", { required: true })}
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
        {paymentErrors.department && (
          <p className="text-red-500 text-sm">Branch is required</p>
        )}

        <div>
          <p className="font-medium">Year</p>
          <select
            {...registerPayment("year", { required: true })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          {paymentErrors.year && (
            <p className="text-red-500 text-sm">Year is required</p>
          )}
        </div>

        <input
          {...registerPayment("email", { required: true })}
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
        />
        {paymentErrors.email && (
          <p className="text-red-500 text-sm">Valid Email is required</p>
        )}

        <input
          {...registerPayment("phno", { required: true })}
          type="tel"
          placeholder="Phone No"
          className="border p-2 w-full"
        />
        {paymentErrors.phno && (
          <p className="text-red-500 text-sm">Phone No is required</p>
        )}
        {makePaymentStatus && (
          <p className="text-green-500 text-sm">User registered Successfully</p>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Make Payment
        </button>
      </form>

      <h2 className="text-xl font-bold mt-8 mb-4">Transaction Form</h2>
      <form
        onSubmit={handleTransactionSubmit(submitTransaction)}
        className="space-y-3"
      >
        <input
          {...registerTransaction("rollno", { required: true })}
          placeholder="Roll No"
          className="border p-2 w-full"
        />
        {paymentErrors.rollno && (
          <p className="text-red-500 text-sm">Roll No is required</p>
        )}

        <input
          {...registerTransaction("transactionid", { required: true })}
          placeholder="Transaction ID"
          className="border p-2 w-full"
        />
        {transactionErrors.transactionid && (
          <p className="text-red-500 text-sm">Transaction ID is required</p>
        )}

        {transactionStatus && (
          <p className="text-green-500 text-sm">
            transactionId submitted Successfully
          </p>
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
