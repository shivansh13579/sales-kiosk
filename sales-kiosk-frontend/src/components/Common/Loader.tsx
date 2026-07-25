export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="loader">
      <div className="loader__spinner" />
      <span>{label}</span>
    </div>
  );
}
