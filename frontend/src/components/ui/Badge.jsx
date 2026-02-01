export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate text-gray-300',
    success: 'bg-status-green/20 text-status-green',
    warning: 'bg-status-amber/20 text-status-amber',
    danger: 'bg-status-red/20 text-status-red',
    info: 'bg-accent-blue/20 text-accent-cyan',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
