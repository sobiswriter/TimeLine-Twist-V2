import React from 'react';

interface ImageWithLoaderProps {
  isLoading: boolean;
  src?: string;
  alt: string;
}

// A themed, self-contained SVG fallback image.
// Replaced "IMAGE FAILED" with a more creative, in-theme message.
// Decoded SVG:
// <svg width="160" height="90" xmlns="http://www.w3.org/2000/svg">
//   <rect width="160" height="90" fill="#111827"/>
//   <text x="80" y="48" font-family="monospace" font-size="10" fill="#F59E0B" text-anchor="middle">CHRONO-VISION OFFLINE</text>
//   <text x="80" y="62" font-family="monospace" font-size="8" fill="#D1D5DB" text-anchor="middle">Recalibrating aether-matrix...</text>
// </svg>
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiIGZpbGw9IiMxMTE4MjciLz48dGV4dCB4PSI4MCIgeT0iNDgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiNGNTlFMEIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNIUk9OTy1WSVNJT04gT0ZGTElORTwvdGV4dD48dGV4dCB4PSI4MCIgeT0iNjIiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iI0QxRDVEQiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmVjYWxpYnJhdGluZyBhZXRoZXItbWF0cml4Li4uPC90ZXh0Pjwvc3ZnPg==';


const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ isLoading, src, alt }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-surface/80 rounded-lg animate-pulse border border-cyan-glow/10"></div>
    );
  }

  if (!src || src === 'error') {
    return (
       <img
        src={FALLBACK_IMAGE}
        alt={`Image generation failed for: "${alt}". Displaying fallback.`}
        className="w-full aspect-video object-cover rounded-lg border border-red-500/30"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full aspect-video object-cover rounded-lg border border-cyan-glow/20 shadow-lg shadow-black/30"
    />
  );
};

export default ImageWithLoader;