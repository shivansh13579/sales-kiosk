import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export function Toast() {
  const result = useSelector((s: RootState) => s.kiosk.lastBookingResult);

  if (!result) return null;

  return (
    <div className={`toast ${result.success ? "toast--success" : "toast--error"}`}>
      {result.message}
    </div>
  );
}
