import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import data from "../data/hit.json";

function Hit() {
  const [params, setParams] = useSearchParams({ q: "" });
  const navigate = useNavigate();
  const key = params.get("q");
  const [queryRes, setQueryRes] = useState(null);
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    if (key) {
      const res = data.find((obj) => obj.qr === key);
      if (res) {
        setQueryRes(res);
        setTimeout(() => {
          navigate('/hit', { replace: true });
        }, 5000); 
      }
    }
  }, [key, navigate]);

  useEffect(() => {
    if (queryRes) {
      setAnimation(true);
    }
  }, [queryRes]);

  // Home page when no question is being viewed
  const renderHomePage = () => (
    <div className="max-w-md w-full mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Hit - Reloaded
        </h1>
        <p className="text-gray-600 text-lg">
          The Ultimate QR Code Scavenger Hunt
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">How to Play</h2>
        <ol className="text-left text-gray-600 space-y-3">
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">1</span>
            <span>Find QR codes hidden throughout the game area</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">2</span>
            <span>Scan them with your phone's camera</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">3</span>
            <span>Answer the questions to go to next step</span>
          </li>
        </ol>
      </div>
    </div>
  );

  // Question display with improved UI
  const renderQuestion = () => (
    <div 
      className={`max-w-md w-full mx-auto text-center transition-opacity duration-500 ${animation ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-indigo-500">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Question
          </h1>
          <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-lg mb-6">
          <p className="text-xl text-gray-700 font-medium">{queryRes.question}</p>
        </div>
      </div>

      <div className="mt-6 text-gray-500 text-sm">
        Part of <span className="font-semibold">Hit - Reloaded</span> • Keep hunting!
      </div>
    </div>
  );

  return (
    <section className="py-10 px-4 bg-gradient-to-br from-indigo-50 to-gray-100 min-h-screen flex justify-center items-center">
      {queryRes ? renderQuestion() : renderHomePage()}
    </section>
  );
}

export default Hit;