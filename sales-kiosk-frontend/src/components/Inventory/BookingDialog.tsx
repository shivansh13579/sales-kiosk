import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { sendBooking } from "../../socket/socket";
import { setBookingInProgress } from "../../store/slices/inventorySlice";
import { Unit } from "../../types";

export function BookingDialog({
  unit,
  towerName,
  onClose,
}: {
  unit: Unit;
  towerName: string;
  onClose: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const bookingInProgress = useSelector((s: RootState) => s.inventory.bookingInProgress);

  // Form fields stay local — broadcasting every keystroke to other devices
  // would be noise, not a useful mirror. Only the submit action matters.
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phoneNumber.trim()) {
      setFormError("Please fill in both fields.");
      return;
    }
    if (!/^\+?[0-9\s-]{7,15}$/.test(phoneNumber.trim())) {
      setFormError("Enter a valid phone number.");
      return;
    }

    setFormError(null);
    dispatch(setBookingInProgress(true));
    sendBooking({ unitId: unit.id, customerName, phoneNumber });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-overlay__content modal-overlay__content--form" onClick={(e) => e.stopPropagation()}>
        <button className="modal-overlay__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2>Book Unit {unit.unitNumber}</h2>
        <p className="booking-dialog__subtitle">{towerName}</p>

        <form onSubmit={handleSubmit} className="booking-dialog__form">
          <label>
            Customer Name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={bookingInProgress}
              autoFocus
            />
          </label>
          <label>
            Phone Number
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={bookingInProgress}
            />
          </label>

          {formError && <p className="booking-dialog__error">{formError}</p>}

          <button type="submit" className="booking-dialog__submit" disabled={bookingInProgress}>
            {bookingInProgress ? "Booking…" : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
