import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteLogo({
  className,
  href = "/",
  size = "header",
  onClick
}: {
  className?: string;
  href?: string;
  size?: "header" | "footer";
  onClick?: () => void;
}) {
  const imageClass =
    size === "header"
      ? "h-11 w-auto md:h-12"
      : "h-16 w-auto md:h-[72px]";

  return (
    <Link href={href} className={cn("inline-flex items-center", className)} aria-label="よりみち日和 ホームへ" onClick={onClick}>
      <Image
        src="/yorimichi-logo.png"
        alt="よりみち日和"
        width={1920}
        height={851}
        priority={size === "header"}
        className={cn(imageClass, "object-contain")}
      />
    </Link>
  );
}
