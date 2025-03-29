import React, { useState } from "react";
import { Send } from "lucide-react";

const Form = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4 border overflow-y-auto max-h-[90vh]">
        {submitted ? (
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Thank you for registering!
            </h2>
          </div>
        ) : (
          <div>
            {/* Form Heading */}
            <h1 className="text-lg font-semibold text-center text-gray-800 mb-2">
              <span className="text-blue-500">&lt;/&gt;</span> Cloud Craft
              Registrations
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid gap-2">
              {/* Full Name */}
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Department & Section */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-500">Department</label>
                  <select
                    className="w-full border rounded p-2 text-sm"
                    required
                  >
                    <option value="">Select Department</option>
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
                </div>

                <div>
                  <label className="text-sm text-gray-500">Section</label>
                  <select
                    className="w-full border rounded p-2 text-sm"
                    required
                  >
                    <option value="">Select Section</option>
                    <option>Section A</option>
                    <option>Section B</option>
                    <option>Section C</option>
                    <option>Section D</option>
                  </select>
                </div>
              </div>

              {/* Roll Number & Year */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-500">Roll Number</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Enter your roll number"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Year</label>
                  <select
                    className="w-full border rounded p-2 text-sm"
                    required
                  >
                    <option value="">Select Year</option>
                    <option>1ˢᵗ Year</option>
                    <option>2ⁿᵈ Year</option>
                    <option>3ʳᵈ Year</option>
                    <option>4ᵗʰ Year</option>
                  </select>
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-sm text-gray-500">Contact Number</label>
                <input
                  type="tel"
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Your contact number"
                  required
                />
              </div>

              {/* Payment QR Code */}
              <div className="text-center">
                <label className="text-sm text-gray-500 block">
                  Payment QR Code
                </label>
                <img
                  src="/api/placeholder/200/200"
                  alt="Payment QR Code"
                  className="max-w-[200px] mx-auto rounded shadow"
                />
              </div>

              {/* Transaction ID */}
              <div>
                <label className="text-sm text-gray-500">Transaction ID</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Enter transaction ID"
                  required
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-900 to-teal-400 text-white font-semibold py-2 rounded shadow hover:opacity-90"
                >
                  <span>Submit Registration</span>
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
