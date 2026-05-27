import PropTypes from "prop-types";

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
}) {
  const colors = {
    blue: "bg-[#EFF6FF] text-[#0052FF]",
    green: "bg-[#ECFDF5] text-[#10B981]",
    orange: "bg-[#FFFBEB] text-[#F59E0B]",
    red: "bg-[#FEF2F2] text-[#EF4444]",
    purple: "bg-[#F5F3FF] text-[#7C3AED]",
  };

  return (
    <div className="group rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,82,255,0.08)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,82,255,0.12)]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#64748B]">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0A0F1E]">
            {value}
          </p>
          {trend && (
            <p className="mt-1 text-xs font-medium text-[#10B981]">{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(["blue", "green", "orange", "red", "purple"]),
  trend: PropTypes.string,
};
