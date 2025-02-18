import React, { useRef } from "react";
import { QRCode } from "react-qrcode-logo";
import qrData from "../data/hit.json";

function GenerateAllQrs() {
  const handleQrDownload = (index) => {
    const qrCanvas = document.getElementById(index);
    if (qrCanvas) {
      const url = qrCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
    }
  };
  return (
    <div className="py-20 mx-auto ">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center text-center gap-7">
        {qrData.map((obj, index) => (
          <div key={index}>
            <QRCode
              value={`https://vjdataquesters.vercel.app/hit?q=${obj.qr}`}
              size={200}
              logoImage="/logo.png"
              logoWidth={80}
              qrStyle="dots"
              className="mb-4"
              id={index}
            />
            <div className="flex gap-3 justify-center items-center cursor-pointer">
              <p>{obj.question}</p>
              <span
                className="p-2 bg-gray-800 text-white rounded-lg"
                onClick={() => handleQrDownload(index)}
              >
                Download
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GenerateAllQrs;
