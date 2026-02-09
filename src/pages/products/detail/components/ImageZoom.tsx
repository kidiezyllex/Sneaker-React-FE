import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import { Button } from "@/components/ui/button";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageZoom: React.FC<ImageZoomProps> = ({
  src,
  alt,
  className,
}) => {
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setMousePosition({ x: xPercent, y: yPercent });

    const lensSize = 150;
    const lensX = Math.max(
      lensSize / 2,
      Math.min(rect.width - lensSize / 2, x)
    );
    const lensY = Math.max(
      lensSize / 2,
      Math.min(rect.height - lensSize / 2, y)
    );

    setLensPosition({ x: lensX, y: lensY });
  };

  const handleTouchStart = () => {
    if (isMobile) {
      setIsZooming(!isZooming);
    }
  };

  return (
    <div className="relative overflow-visible group zoom-container overflow-hidden">
      <div
        className={`relative ${className} transition-all duration-300 ${!isMobile && !isZooming ? "cursor-zoom-in" : ""
          } ${!isMobile && isZooming ? "cursor-none" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
      >
        <div className="relative w-full h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner group-hover:shadow-md transition-all duration-500">
          <img
            src={src}
            alt={alt}
            draggable="false"
            className="object-contain w-full h-full p-8 transition-transform duration-700 group-hover:scale-105"
          />

          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* Ultra Premium SVG Frame Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 p-2">
          <svg
            className="w-full h-full drop-shadow-2xl"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="50%" stopColor="#16A34A" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Elaborate Corner Brackets */}
            <g className="text-primary" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="square">
              {/* Top Left */}
              <path d="M40 15H15V40" />
              <path d="M22 22L28 28" strokeWidth="1.5" opacity="0.5" />

              {/* Top Right */}
              <path d="M360 15H385V40" />
              <path d="M378 22L372 28" strokeWidth="1.5" opacity="0.5" />

              {/* Bottom Left */}
              <path d="M40 385H15V360" />
              <path d="M22 378L28 372" strokeWidth="1.5" opacity="0.5" />

              {/* Bottom Right */}
              <path d="M360 385H385V360" />
              <path d="M378 378L372 372" strokeWidth="1.5" opacity="0.5" />
            </g>

            {/* Geometric Accents */}
            <rect x="12" y="12" width="376" height="376" rx="12" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.2" />
            <rect x="20" y="20" width="360" height="360" rx="8" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.1" />

            {/* Top Seal - Authentic Badge */}
            <g transform="translate(200, 20)">
              <path d="M-60 0 H60" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.3" />
              <rect x="-45" y="-12" width="90" height="24" rx="12" fill="white" stroke="url(#goldGradient)" strokeWidth="1.5" />
              <text y="4" textAnchor="middle" fill="#15803D" fontSize="8" fontWeight="900" className="uppercase tracking-[0.2em]">AUTHENTIC</text>
              <circle cx="-38" cy="0" r="2" fill="url(#goldGradient)" />
              <circle cx="38" cy="0" r="2" fill="url(#goldGradient)" />
            </g>

            {/* Bottom Badge - Collection Details */}
            <g transform="translate(200, 380)">
              <path d="M-100 0 H100" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.3" />
              <rect x="-70" y="-10" width="140" height="20" rx="4" fill="#15803D" />
              <text y="3" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" className="uppercase tracking-[0.15em]">PREMIUM QUALITY SNEAKER</text>
            </g>

            {/* Side Labels - Rotated */}
            <g transform="rotate(-90, 15, 200)">
              <text x="15" y="200" fill="#15803D" fontSize="5" fontWeight="bold" opacity="0.4" className="uppercase tracking-[0.3em]">ESTABLISHED 2024</text>
            </g>
            <g transform="rotate(90, 385, 200)">
              <text x="385" y="200" fill="#15803D" fontSize="5" fontWeight="bold" opacity="0.4" className="uppercase tracking-[0.3em]">SNEAKER GENZ SERVICE</text>
            </g>

            {/* Floating Dust/Sparkle elements */}
            <circle cx="50" cy="50" r="1.5" fill="url(#goldGradient)" opacity="0.4" />
            <circle cx="350" cy="350" r="1.5" fill="url(#goldGradient)" opacity="0.4" />
            <circle cx="350" cy="50" r="1" fill="url(#goldGradient)" opacity="0.2" />
            <circle cx="50" cy="350" r="1" fill="url(#goldGradient)" opacity="0.2" />
          </svg>
        </div>

        {isZooming && !isMobile && (
          <motion.div
            className="absolute pointer-events-none border-4 border-primary rounded-full shadow-2xl z-30 overflow-hidden zoom-lens"
            style={{
              width: "150px",
              height: "150px",
              left: `${lensPosition.x - 75}px`,
              top: `${lensPosition.y - 75}px`,
              boxShadow:
                "0 0 0 2px rgba(59, 130, 246, 0.8), 0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-full h-full relative bg-white"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: "400%",
                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute inset-2 border border-white/30 rounded-full pointer-events-none"></div>
          </motion.div>
        )}
      </div>
      {isZooming && isMobile && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsZooming(false)}
        >
          <motion.div
            className="relative w-full max-w-lg aspect-square bg-white rounded-xl overflow-hidden"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={src}
              alt={alt}
              className="object-contain p-4"
              draggable="false"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white"
              onClick={() => setIsZooming(false)}
            >
              ✕
            </Button>
            <div className="absolute bottom-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              Nhấn để đóng
            </div>
          </motion.div>
        </motion.div>
      )}

      {isMobile && (
        <motion.div
          className="absolute bottom-2 right-2 bg-primary/90 text-white px-2 py-1 rounded text-sm font-medium opacity-70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Icon path={mdiMagnify} size={0.8} className="inline mr-1" />
          Nhấn để phóng to
        </motion.div>
      )}

      {!isMobile && !isZooming && (
        <motion.div
          className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium opacity-0 group-hover:opacity-70 transition-opacity duration-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0, y: 0 }}
          whileHover={{ opacity: 0.7 }}
        >
          <Icon path={mdiMagnify} size={0.8} className="inline mr-1" />
          Hover để phóng to
        </motion.div>
      )}
    </div>
  );
};
