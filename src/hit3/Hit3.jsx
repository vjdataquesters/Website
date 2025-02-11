import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import data from "./hit3.json";

function Hit3() {
  const [params, setParams] = useSearchParams({ key: "" });
  const key = params.get("key");
  const [queryRes, setQueryRes] = useState(null);
  useEffect(() => {
    if (key) {
      const res = data.filter((obj) => obj.key === key);
      if (res.length > 0) setQueryRes(res);
    }
  }, [key]);

  // console.log("key is ", key);
  // console.log(data);
  // console.log(data[1].key);
  console.log(queryRes);
  return (
    <section className="py-20 px-3 bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="shadow-xl rounded-lg bg-white p-8 max-w-lg w-full">
        {queryRes &&
          (queryRes[0].question ? (
            <div className=" font-['inter'] text-lg text-gray-700">
              <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Question:
              </h1>
              {queryRes[0].question}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {queryRes && queryRes[0].isQR ? (
                <>
                  <h3 className="font-bold text-[1rem]">
                    your are one step closer
                  </h3>
                  <h1 className="font-bold text-[3rem] text-center pb-5">
                    scan the QR
                  </h1>
                  <div>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x3000&data=https://vjdataquesters.vercel.app/hit?key=${queryRes[0].qrData}`}
                    />
                  </div>
                </>
              ) : (
                <div className="text-[red]">Invalid path</div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}

export default Hit3;
