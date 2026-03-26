import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: '御剑术 · Sword Control',
  description: 'Gesture-Powered 3D Sword Experience',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
          strategy="beforeInteractive"
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
