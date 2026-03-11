const USE_VNR = true;

export const QR_CONFIG = {
  vnr: { qrImage: "/qr/vnr-qr.jpg", qrValue: "vnr" },
  dq:  { qrImage: "/qr/dq-qr.jpg",  qrValue: "dq"  },
};

export const activeQR = USE_VNR ? "vnr" : "dq";
