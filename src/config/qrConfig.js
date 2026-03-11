const USE_VNR = true;

export const QR_CONFIG = {
  vnr: { qrImage: "/qr/vnr-qr.jpg", qrValue: "vnr" },
  dq:  { qrImage: "/qr/dq-qr.jpg",  qrValue: "vjdq"  },
};

export const activeQR = USE_VNR ? "vnr" : "vjdq";
