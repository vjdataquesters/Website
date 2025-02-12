import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import data from "../data/hit.json";
import qrData from "../data/qr.json";
import { QRCode } from "react-qrcode-logo";

function Hit() {
  const [params, setParams] = useSearchParams({ q: "" });
  const key = params.get("q");
  const [queryRes, setQueryRes] = useState(null);
  let res;
  useEffect(() => {
    if (key) {
      res = data.filter((obj) => obj.qr === key);
      if (res.length > 0) setQueryRes(res);
      else res = qrData.filter((obj) => obj.answer === key);
      if (res.length > 0) setQueryRes(res);
    }
  }, [key]);
  return (
    <section className="py-20 px-3 bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="shadow-xl rounded-lg bg-white p-8 max-w-md w-full">
        {queryRes && queryRes.length > 0 ? (
          queryRes[0].question ? (
            <div className="font-sans text-lg text-gray-700">
              <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Question:
              </h1>
              {queryRes[0].question}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <h3 className="font-bold text-xl mb-2 text-gray-700">
                You are one step closer
              </h3>
              <h1 className="font-bold text-3xl text-center mb-4 text-gray-800">
                Scan the QR
              </h1>
              <QRCode
                value={`https://vjdataquesters.vercel.app/hit?q=${queryRes[0].qr}`}
                size={200}
                logoImage="/logo.png"
                logoWidth={80}
                qrStyle="dots"
                className="mb-4"
              />
            </div>
          )
        ) : (
          <div className="text-red-500 text-center">
            Invalid path or No data found
          </div>
        )}
      </div>
    </section>
  );
}

export default Hit;
