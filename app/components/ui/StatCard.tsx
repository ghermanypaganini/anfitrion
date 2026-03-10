type StatCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
};

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </div>
      {icon != null && <div className="text-2xl">{icon}</div>}
    </div>
  );
}
