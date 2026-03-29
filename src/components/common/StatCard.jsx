export default function StatCard({ title, value, icon, color = 'blue', trend }) {
  const colors = {
    blue: 'bg-blue-50 text-primary',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-500',
    red: 'bg-red-50 text-red-500',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && <p className="text-xs text-green-600 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}
