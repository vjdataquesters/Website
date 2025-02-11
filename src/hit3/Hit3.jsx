import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import data from "./hit3.json";

function Hit3() {
  const [params, setParams] = useSearchParams({ q: "" });
  const key = params.get("q");
  const [queryRes, setQueryRes] = useState(null);
  useEffect(() => {
    if (key) {
      const res = data.filter((obj) => obj.qr === key);
      if (res.length > 0) setQueryRes(res);
    }
  }, [key]);
  return (
    <section className="py-20 px-3 bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="shadow-xl rounded-lg bg-white p-8 max-w-lg w-full">
        {queryRes && queryRes[0]?.question ? (
          <div className=" font-['inter'] text-lg text-gray-700">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Question:
            </h1>
            {queryRes[0].question}
          </div>
        ) : (
          <div className="text-[red]">Invalid path</div>
        )}
      </div>
    </section>
  );
}

export default Hit3;
