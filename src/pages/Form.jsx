import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [formData, setFormData] = useState(null);
  const [transactionid, setTransactionid] = useState(null);
  const makePayment = (data) => {
    setFormData(data);
    console.log("Form Data:", data);
    sendPostRequest(data);
  };

  const makePaymentRequest = async (data) => {
    try {
      const response = await axios.post(
        "https://your-api-endpoint.com/submit",
        data
      );
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="p-4 py-32 max-w-md mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Form</h2>
      <form onSubmit={handleSubmit(makePayment)} className="space-y-3">
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

        <input
          {...register("branch", { required: true })}
          placeholder="Branch"
          className="border p-2 w-full"
        />
        {errors.branch && (
          <p className="text-red-500 text-sm">Branch is required</p>
        )}

        <input
          {...register("year", { required: true })}
          type="number"
          placeholder="Year"
          className="border p-2 w-full"
        />
        {errors.year && (
          <p className="text-red-500 text-sm">Year is required</p>
        )}

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

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Make payment
        </button>
      </form>

      <form>
        <input
          placeholder="Transaction ID"
          className="border p-2 w-full"
          value={transactionid}
          onChange={(e) => setTransactionid(e.target.value)}
          {...register("transactionid", { required: true })}
        />
        {errors.transactionid && (
          <p className="text-red-500 text-sm">Transaction ID is required</p>
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
