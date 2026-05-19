import { useState } from "react";
import PropTypes from "prop-types";
import logoSrc from "../../assets/logo.png";
import logoWhiteSrc from "../../assets/logo.png";

export default function Logo({ size = "md", showText = true, variant = "default" }) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: "h-7",
    md: "h-9",
    lg: "h-14",
  };

  const isLight = variant === "light";
  const sahClass = isLight ? "text-white" : "text-primary";
  const techClass = isLight ? "text-white/80" : "text-gray-800";

  // Pick the right image for the variant
  const src = isLight ? logoWhiteSrc : logoSrc;

  // Fallback: only used if the image fails to load
  if (imgError || !src) {
    const dim =
      size === "lg" ? "w-14 h-14" : size === "sm" ? "w-7 h-7" : "w-9 h-9";
    const bg = isLight ? "bg-white/20 ring-1 ring-white/30" : "bg-primary";
    return (
      <div className="flex items-center gap-2">
        <div className={`${dim} ${bg} rounded-xl flex items-center justify-center`}>
          <span className={`text-white font-bold ${size === "sm" ? "text-sm" : "text-lg"}`}>S</span>
        </div>
        {showText && (
          <span
            className={`font-bold ${sahClass} tracking-tight ${
              size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl"
            }`}
          >
            SAH<span className={techClass}>TECH</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={src}
        alt="SAHTECH"
        className={sizes[size]}
        onError={() => setImgError(true)}
      />
      {showText && (
        <span
          className={`font-bold ${sahClass} tracking-tight ${
            size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl"
          }`}
        >
          SAH<span className={techClass}>TECH</span>
        </span>
      )}
    </div>
  );
}

Logo.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showText: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "light"]),
};