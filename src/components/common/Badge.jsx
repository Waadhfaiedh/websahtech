export default function Badge({ label, color = 'gray' }) {
  const map = {
    green: 'badge-green',
    orange: 'badge-orange',
    red: 'badge-red',
    blue: 'badge-blue',
    gray: 'badge-gray',
    active: 'badge-green',
    pending: 'badge-orange',
    suspended: 'badge-red',
    reviewed: 'badge-blue',
  };
  return <span className={map[color] || map.gray}>{label}</span>;
}
