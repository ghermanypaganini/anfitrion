"use client";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
