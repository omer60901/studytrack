export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-3xl font-black tracking-normal">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
