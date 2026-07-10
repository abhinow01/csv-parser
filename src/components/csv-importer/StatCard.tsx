interface Props {
  label : string;
  value : number;
  tone? : "success" | "danger" | "neutral";
}

export function StatCard ({label , value , tone="neutral"}: Props){
    const toneClasses = {
    success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    danger: "text-red-600 bg-red-50 dark:bg-red-950/30",
    neutral: "text-gray-700 bg-gray-50 dark:bg-gray-900",
  }[tone];
  return (
    <div className={`rounded-xl px-5 py-4 ${toneClasses}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-1">{label}</p>
    </div>
  )
}