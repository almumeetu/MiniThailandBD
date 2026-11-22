import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
  imageClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  priority?: boolean;
  forceOriginal?: boolean;
}

const logoSizes = {
  sm: {
    width: 64,
    height: 36,
    className: "h-[32px] sm:h-[36px] w-auto",
  },
  md: {
    width: 78,
    height: 44,
    className: "h-[40px] sm:h-[44px] w-auto",
  },
  lg: {
    width: 96,
    height: 54,
    className: "h-[46px] lg:h-[52px] w-auto",
  },
  xl: {
    width: 120,
    height: 68,
    className: "h-[60px] sm:h-[66px] w-auto",
  },
} as const;

export default function Logo({
  variant = "dark",
  className = "",
  imageClassName = "",
  size = "md",
  href = "/",
  priority = true,
  forceOriginal = false,
}: LogoProps) {
  const isLight = variant === "light";
  const logoSize = logoSizes[size] || logoSizes.md;
  // Use mini-thailand-white-logo.png on dark backgrounds,
  // and minithailand-logo.png on light/white backgrounds.
  const src = forceOriginal
    ? "/images/minithailand-logo.png"
    : isLight
    ? "/images/mini-thailand-white-logo.png"
    : "/images/minithailand-logo.png";

  return (
    <Link
      href={href}
      className={`group inline-flex select-none items-center shrink-0 transition-opacity duration-200 hover:opacity-90 ${className}`}
      aria-label="Mini Thailand home"
    >
      <Image
        src={src}
        alt="Mini Thailand"
        width={logoSize.width}
        height={logoSize.height}
        priority={priority}
        className={`${logoSize.className} object-contain transition-transform duration-200 group-hover:scale-[1.02] ${imageClassName}`}
      />
    </Link>
  );
}
