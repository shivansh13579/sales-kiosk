export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="error-message">
      <strong>Something went wrong.</strong>
      <span>{message}</span>
    </div>
  );
}
