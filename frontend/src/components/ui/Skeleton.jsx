export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton rounded bg-slate/60 ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
