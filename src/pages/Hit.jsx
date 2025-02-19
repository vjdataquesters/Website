import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import data from "../data/hit.json";

/**
 * format for each question in json
 * {  
 *   "color": "red | blue | yellow", // path color, every path color has 3 different paths
 *   "path": "1 | 2 | 3", // every path has 8 different questions
 *   "qr": "qr-code", // to make link, qr color is same as "color" in json
 *   "question": "Question text", // display in dangerouslySetInnerHTML, can be a single line question, can be multiline code, can be multiline text
 *   "image": "link to drive image" | null, - if not null, then question is "" to redirect to image link
 * }
 */

function Hit() {
  const [params, setParams] = useSearchParams({ q: "" });
  const navigate = useNavigate();
  const key = params.get("q");
  const [loading, setLoading] = useState(true);
  const [queryRes, setQueryRes] = useState(null);
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    if (key) {
      const res = data.find((obj) => obj.qr === key);
      if (res) {
        setQueryRes(res);
        // setTimeout(() => {
        //   navigate('/hit', { replace: true });
        // }, 5000); 
      }
    }
    setLoading(false);
  }, [key, navigate]);

  useEffect(() => {
    if (queryRes) {
      setAnimation(true);
    }
  }, [queryRes]);

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

  const renderQuestion = () => {
    const pathColor = queryRes.color || "indigo";
    if (queryRes.image) {
      window.location.href = queryRes.image;
      return null;
    }

    return (
      <div
        className={`max-w-md w-full mx-auto text-center transition-opacity duration-500 ${animation ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className={`bg-white rounded-lg shadow-xl p-6 border-t-4 border-${pathColor}-500`}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Question
            </h1>
            <div className={`w-16 h-1 bg-${pathColor}-500 mx-auto rounded-full`}></div>
            <p className="text-sm text-gray-500 mt-2">Path: {queryRes.path}</p>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg mb-6">
            <pre>
              <p
                className="text-left overflow-auto font-mono text-gray-700"
                dangerouslySetInnerHTML={{ __html: queryRes.question }}
              />
            </pre>
          </div>
        </div>

        <div className="mt-6 text-gray-500 text-sm">
          Part of <span className="font-semibold">Hit - Reloaded</span> • Keep hunting!
        </div>
      </div>
    );
  };

  if (loading) return null;

  return (
    <section className="py-10 px-4 bg-gradient-to-br from-indigo-50 to-gray-100 min-h-screen flex justify-center items-center">
      {queryRes ? renderQuestion() : renderHomePage()}
    </section>
  );
}

export default Hit;