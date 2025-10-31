import React from "react";
import { QRCode } from "react-qrcode-logo";
import qrData from "../data/hitData";

const GenerateAllQrs = () => {
  const colorMap = {
    'red': '#ff6600',
    'yellow': '#ffcc00',
    'blue': '#3399ff',
    'green': '#22c55e',
  };
  
  const getEyeColor = (color) => {
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

  const handleQrDownload = async (obj, globalIndex) => {
    try {
      // Validate if this is a special path QR code
      if (obj.path === 'final' || obj.path === 'fooled') {
        // Get the actual QR container for THIS specific QR
        const qrContainer = document.getElementById(`qr-${obj.color}-${obj.path}-${obj.qr}`);
        if (!qrContainer) {
          throw new Error('QR container not found');
        }
        const canvas = qrContainer.getElementsByTagName('canvas')[0];
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          const questionPreview = obj.image 
            ? "image-question" 
            : obj.question
                .substring(0, 15)
                .replace(/[^a-zA-Z0-9]/g, '-')
                .toLowerCase();
          
          const filename = `qr-${obj.color}-path${obj.path}-${questionPreview}.png`;
          
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Regular path QR code - use the original globalIndex method
        const qrContainer = document.getElementById(`qr-${globalIndex}`);
        if (!qrContainer) {
          throw new Error('QR container not found');
        }
        
        const canvas = qrContainer.getElementsByTagName('canvas')[0];
        if (!canvas) {
          throw new Error('Canvas element not found');
        }
        
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const questionPreview = obj.image 
          ? "image-question" 
          : obj.question
              .substring(0, 15)
              .replace(/[^a-zA-Z0-9]/g, '-')
              .toLowerCase();
        
        const filename = `qr-${obj.color}-path${obj.path}-${questionPreview}.png`;
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  // Group QR codes by color and path for better organization
  const groupedQrs = qrData.reduce((acc, obj) => {
    const key = `${obj.color}-${obj.path}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-8 pt-16">QR Code Generator</h1>
      
      {Object.entries(groupedQrs).map(([groupKey, items], groupIndex) => {
        const [color, path] = groupKey.split('-');
        const colorHex = colorMap[color] || '#000000';
        return (
          <div key={groupKey} className="mb-10">
            <div className="flex items-center mb-4 border-b pb-2">
              <div 
                className="w-6 h-6 rounded-full mr-2" 
                style={{ backgroundColor: colorHex }}
              ></div>
              <h2 className="text-xl font-semibold">
                {color.charAt(0).toUpperCase() + color.slice(1)} Path {path}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((obj, index) => {
                const qrColor = colorMap[obj.color] || '#000000';
                const eyeColor = getEyeColor(qrColor);
                const globalIndex = groupIndex * items.length + index;
                const qrId = obj.path === 'final' || obj.path === 'fooled' 
                  ? `qr-${obj.color}-${obj.path}-${obj.qr}`
                  : `qr-${globalIndex}`;
                
                return (
                  <div key={globalIndex} className="w-full bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-center mb-3">
                      <div id={qrId}>
                        <QRCode
                          value={`https://vjdataquesters.vercel.app/hit?q=${obj.qr}`}
                          size={350}
                          fgColor={qrColor}
                          eyeColor={eyeColor}
                          qrStyle="squares"
                          quietZone={10}
                          ecLevel="H"
                          enableCORS={true}
                          removeQrCodeBehindLogo={true}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-gray-50 p-3 rounded-md w-full">
                        {obj.image ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium mb-1">Image Question</span>
                            <a href={obj.image} className="underline text-blue-500">Go to Image</a>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-800 line-clamp-2 text-center" title={obj.question}>
                            {obj.question}
                          </p>
                        )}
                      </div>
                      
                      <button
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 w-full justify-center"
                        onClick={() => handleQrDownload(obj, globalIndex)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Download QR Code</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GenerateAllQrs;