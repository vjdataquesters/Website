import React, { useEffect, useState } from 'react';
import { db } from '../firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx'

function Admin() {

  //fetch users and store in Registrations

  const downloadExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(registrations);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      XLSX.writeFile(workbook, "registrations.xlsx");
    } catch (error) {
      console.error("Error downloading excel:", error);
      alert("Failed to download excel file");
    }
  };
  
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Registrations</h2>
            <button
              onClick={downloadExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent 
                       shadow-sm text-sm font-medium rounded-md text-white 
                       bg-green-600 hover:bg-green-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                       transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Excel
            </button>
          </div>
    
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Roll No", "Branch", "Year", "Email", "Phone", "Payment Platform", "Transaction ID", "Status"].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg.rollno} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.rollno}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.branch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.phno}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.paymentplatform}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.transactionid}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${reg.paymentStatus === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'}`}
                        >
                          {reg.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

export default Admin;