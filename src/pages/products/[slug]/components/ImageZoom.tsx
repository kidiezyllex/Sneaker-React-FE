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
    <div className="relative overflow-visible group zoom-container">
      <div
        className={`relative ${className} transition-all duration-300 ${
          !isMobile && !isZooming ? "cursor-zoom-in" : ""
        } ${!isMobile && isZooming ? "cursor-none" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
      >
        <img
          src={src}
          alt={alt}
          draggable="false"
          className="object-contain p-4 transition-transform duration-300"
        />

        {isZooming && !isMobile && (
          <motion.div
            className="absolute pointer-events-none border-4 border-white rounded-full shadow-2xl z-30 overflow-hidden zoom-lens"
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
