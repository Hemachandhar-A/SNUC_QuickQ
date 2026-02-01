export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-graphite disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-accent-blue text-white hover:bg-blue-600 shadow-glow',
    secondary: 'bg-slate text-white hover:bg-slate/90 border border-slate',
    danger: 'bg-status-red text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-300 hover:bg-charcoal',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
