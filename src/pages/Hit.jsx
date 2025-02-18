import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import data from "../data/hit.json";

function Hit() {
  const [params, setParams] = useSearchParams({ q: "" });
  const key = params.get("q");
  const [queryRes, setQueryRes] = useState(null);
  let res;
  useEffect(() => {
    if (key) {
      res = data.find((obj) => obj.qr === key);
      console.log(res);
      if (res) setQueryRes(res);
    }
  }, [key]);
  return (
    <section className="py-20 px-3 bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="shadow-xl rounded-lg bg-white p-4 pb-8 max-w-md w-full">
        {queryRes?.question ? (
          <div className="font-sans text-lg text-gray-700 m-w-[50%] text-center">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Question:
            </h1>
            <p className="text-center">{queryRes.question}</p>
          </div>
        ) : (
          <div className="text-red-500 text-center">Invalid path</div>
        )}
      </div>
    </section>
  );
}

export default Hit;
