import { useState } from "react";
import logoSrc from "../../assets/logo.png";

export default function Logo({ size = "md", showText = true }) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: "h-7",
    md: "h-9",
    lg: "h-14",
  };

  if (imgError || !logoSrc) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`${size === "lg" ? "w-14 h-14" : size === "sm" ? "w-7 h-7" : "w-9 h-9"} bg-primary rounded-xl flex items-center justify-center`}
        >
          <span className="text-white font-bold text-lg">S</span>
        </div>
        {showText && (
          <span
            className={`font-bold text-primary tracking-tight ${size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl"}`}
          >
            SAH<span className="text-gray-800">TECH</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={logoSrc}
        alt="SAHTECH"
        className={sizes[size]}
        onError={() => setImgError(true)}
      />
      {showText && (
        <span
          className={`font-bold text-primary tracking-tight ${size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl"}`}
        >
          SAH<span className="text-gray-800">TECH</span>
        </span>
      )}
    </div>
  );
}
