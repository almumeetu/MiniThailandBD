import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const logoSizes = {
  sm: {
    frame: "h-[30px] w-[30px]",
    imageSize: 30,
    text: "text-[17px]",
    gap: "gap-1.5",
  },
  md: {
    frame: "h-[42px] w-[42px]",
    imageSize: 42,
    text: "text-[22px]",
    gap: "gap-2",
  },
  lg: {
    frame: "h-12 w-12",
    imageSize: 48,
    text: "text-2xl sm:text-3xl",
    gap: "gap-2.5",
  },
} as const;

export default function Logo({
  variant = "dark",
  className = "",
  size = "md",
  href = "/",
}: LogoProps) {
  const isLight = variant === "light";
  const logoSize = logoSizes[size];

  return (
    <Link
      href={href}
      className={`group inline-flex select-none items-center ${logoSize.gap} transition-opacity duration-200 hover:opacity-90 ${className}`}
      aria-label="MiniThailandBD home"
    >
      <span className={`relative block shrink-0 overflow-hidden rounded-full ${logoSize.frame}`} aria-hidden="true">
        <Image
          src="/products/logo.jpg"
          alt="MiniThailandBD Logo"
          width={logoSize.imageSize}
          height={logoSize.imageSize}
          className="h-full w-full object-cover"
        />
      </span>
      <span className={`${logoSize.text} inline-flex items-baseline font-extrabold leading-none tracking-[-0.045em]`}>
        <span className={isLight ? "text-white" : "text-[#c0185a]"}>Mini</span>
        <span className={isLight ? "text-yellow-300" : "text-[#e8a020]"}>Thailand</span>
        <span className={isLight ? "text-white/80" : "text-neutral-700"}>BD</span>
      </span>
    </Link>
  );
}
