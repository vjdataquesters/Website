import React from "react";
import { QRCode } from "react-qrcode-logo";
import qrData from "../data/hit.json";

function GenerateAllQrs() {
  // Define QR colors array
  const qrColors = ['#e63946', '#1d3557', '#0f323f']; // Red, Blue, Dark Teal
  
  // Calculate QR code color based on position
  const getQrColor = (index) => {
    const groupSize = 3;
    const colorIndex = Math.floor(index / groupSize) % qrColors.length;
    return qrColors[colorIndex];
  };

  // Get eye color - matching main color but slightly darker for contrast
  const getEyeColor = (color) => {
    // Simple darkening function
    const darken = (hex, percent) => {
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
      
      r = Math.floor(r * (1 - percent));
      g = Math.floor(g * (1 - percent));
      b = Math.floor(b * (1 - percent));
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    return darken(color, 0.2);
  };

  const handleQrDownload = (index, question) => {
    const qrCanvas = document.getElementById(`qr-${index}`);
    if (qrCanvas) {
      const url = qrCanvas.toDataURL("image/png", 1.0); 
      const a = document.createElement("a");
      a.href = url;
      const filename = `qr-${question.substring(0, 20).replace(/\s+/g, '-')}-${index}.png`;
      a.download = filename;
      a.click();
    }
  };

  return (
    <div className="py-8 px-2 md:py-20 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrData.map((obj, index) => {
          const qrColor = getQrColor(index);
          const eyeColor = getEyeColor(qrColor);
          
          return (
            <div key={index} className="w-full bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-3">
                <QRCode
                  value={`https://vjdataquesters.vercel.app/hit?q=${obj.qr}`}
                  size={300}
                  fgColor={qrColor}
                  eyeColor={eyeColor}
                  qrStyle="squares"
                  quietZone={10}
                  ecLevel="H" 
                  enableCORS={true}
                  id={`qr-${index}`}
                  removeQrCodeBehindLogo={true}
                />
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-gray-50 p-3 rounded-md w-full">
                  <p className="text-sm text-gray-800 line-clamp-2 text-center" title={obj.question}>
                    {obj.question}
                  </p>
                </div>
                
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 w-full justify-center"
                  onClick={() => handleQrDownload(index, obj.question)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Download QR Code</span>
                </button>
                
                <div className="w-full bg-gray-100 rounded-md p-2 text-xs text-gray-500 text-center">
                  Group {Math.floor(index/3) + 1} • QR #{index + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}

export default GenerateAllQrs;