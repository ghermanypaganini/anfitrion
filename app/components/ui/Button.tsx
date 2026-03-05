"use client";

import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  const base = "px-5 py-2.5 rounded-lg font-medium transition shadow-sm";

  const styles = {
    primary: "bg-accent-600 hover:bg-accent-700 text-white",
    secondary: "bg-brand-600 hover:bg-brand-700 text-white",
    ghost: "bg-brand-100 text-brand-800 hover:bg-brand-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button className={clsx(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
