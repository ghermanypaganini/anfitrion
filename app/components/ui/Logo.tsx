type LogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export default function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const baseColor = variant === "dark" ? "text-[#1f3a5f]" : "text-white";

  return (
    <span className={`${sizes[size]} font-bold tracking-tight`}>
      <span className={baseColor}>Anfitri</span>
      <span className="text-[#ff6a00]">on Hub</span>
    </span>
  );
}
