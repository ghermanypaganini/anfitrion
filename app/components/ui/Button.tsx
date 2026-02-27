export default function Button({
  children,
  variant = "primary",
  ...props
}: any) {
  const base =
    "px-5 py-2 rounded-lg font-medium transition disabled:opacity-50";

  const variants: any = {
    primary: "bg-accent-600 text-white hover:bg-accent-700",
    secondary: "bg-brand-700 text-white hover:bg-brand-800",
    outline: "border border-gray-300 hover:bg-gray-100",
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
