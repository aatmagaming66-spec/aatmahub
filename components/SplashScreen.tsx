"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      setClosing(true);
    }, 1000);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1300);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#080a0f] transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      <Image
        src="/icon.png"
        alt="AatmaHub"
        width={180}
        height={180}
        priority
        className="rounded-[32px] animate-[splashIn_500ms_ease-out]"
      />

      <style jsx global>{`
        @keyframes splashIn {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        html,
        body {
          background: #080a0f;
        }
      `}</style>
    </div>
  );
}
