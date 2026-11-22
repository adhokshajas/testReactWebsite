/**
 * Native SVG QR Code component using qrcode.react
 * Renders as SVG and updates dynamically when value changes
 */

import { QRCodeSVG } from 'qrcode.react';

export default function QRCode({ value, size = 120 }) {
  return (
    <div style={{ display: 'inline-block' }}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={false}
        style={{
          border: '2px solid #d1d5db',
          borderRadius: '8px',
          padding: '8px',
          background: 'white',
        }}
      />
    </div>
  );
}
