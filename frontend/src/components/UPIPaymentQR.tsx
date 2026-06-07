import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface UPIPaymentQRProps {
  amount: number;
}

const UPIPaymentQR: React.FC<UPIPaymentQRProps> = ({ amount }) => {
  const upiId   = process.env.REACT_APP_UPI_ID   || 'yourupi@okaxis';
  const gymName = process.env.REACT_APP_GYM_NAME || 'Lifetime Fitness';

  // UPI deep-link format — auto-fills amount in GPay / PhonePe / Paytm
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR`;

  return (
    <QRCodeCanvas
      value={upiLink}
      size={204}
      bgColor="#ffffff"
      fgColor="#000000"
      level="H"
      includeMargin={false}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};

export default UPIPaymentQR;