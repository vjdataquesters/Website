const GET_RICH = false;

export const QR_CONFIG = {
  vnr: { qrImage: "/qr/vnr-qr.jpg", qrValue: "vnr" },
  vjdq:  { qrImage: "/qr/dq-qr.jpg",  qrValue: "vjdq"  },
};

export const activeQR = !GET_RICH ? "vnr" : "vjdq";
