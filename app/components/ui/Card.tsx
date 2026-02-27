export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {children}
    </div>
  );
}
