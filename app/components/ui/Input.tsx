export default function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
    />
  );
}