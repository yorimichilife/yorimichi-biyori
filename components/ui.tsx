import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

export function Container({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-4 md:px-8 xl:px-0", className)}>
      {children}
    </div>
  );
}

export function Card({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-4xl border border-[#F1F1F1] bg-white shadow-soft", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  align = "left"
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-3", align === "center" && "text-center")}>
      <h2 className="font-accent text-3xl font-bold tracking-[0.04em] text-brand-text md:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="text-base leading-8 text-brand-sub">{subtitle}</p> : null}
    </div>
  );
}

export function Button({
  className,
  children,
  href,
  variant = "primary",
  ...props
}: {
  className?: string;
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = cn(
    "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] active:translate-y-0 md:text-base",
    variant === "primary" && "bg-brand-yellow text-brand-text hover:bg-brand-yellowHover",
    variant === "secondary" &&
      "border border-brand-border bg-white text-brand-text hover:border-brand-yellow hover:bg-[#fff9dd]",
    variant === "ghost" && "bg-transparent text-brand-text hover:bg-black/5",
    className
  );

  if (href) {
    return (
      <Link className={styles} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "yellow" | "green" | "blue" | "gray";
}) {
  const toneClass = {
    default: "bg-[#FFF6D6] text-[#8A6A00]",
    yellow: "bg-[#FFF6D6] text-[#8A6A00]",
    green: "bg-[#E8F7EA] text-[#4F7A49]",
    blue: "bg-[#EAF4FF] text-[#35669C]",
    gray: "bg-[#F5F5F5] text-[#666666]"
  }[tone];

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", toneClass)}>
      {children}
    </span>
  );
}
