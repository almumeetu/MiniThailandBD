import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

const logoSizes = {
  sm: {
    frame: "h-[30px] w-[30px]",
    imageSize: 30,
    text: "text-[17px] sm:text-[18px]",
    gap: "gap-1.5",
  },
  md: {
    frame: "h-[36px] w-[36px]",
    imageSize: 36,
    text: "text-[20px] sm:text-[21px]",
    gap: "gap-2",
  },
  lg: {
    frame: "h-[42px] w-[42px]",
    imageSize: 42,
    text: "text-[23px] sm:text-[25px]",
    gap: "gap-2.5",
  },
  xl: {
    frame: "h-[48px] w-[48px]",
    imageSize: 48,
    text: "text-2xl sm:text-3xl",
    gap: "gap-3",
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
      aria-label="Mini Thailand home"
    >
      <span className={`relative block shrink-0 overflow-hidden rounded-full ring-2 ring-[#ec1c67] shadow-xs ${logoSize.frame}`} aria-hidden="true">
        <Image
          src="/products/logo.jpg"
          alt="Mini Thailand Logo"
          width={logoSize.imageSize}
          height={logoSize.imageSize}
          className="h-full w-full object-cover"
        />
      </span>
      <span className={`${logoSize.text} inline-flex items-baseline font-black leading-none tracking-[-0.03em]`}>
        <span className={isLight ? "text-white" : "text-neutral-900"}>Mini</span>
        <span className="text-[#ec1c67]">Thailand</span>
      </span>
    </Link>
  );
}
