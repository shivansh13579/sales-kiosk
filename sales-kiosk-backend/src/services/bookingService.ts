import { sequelize } from "../config/database";
import { Unit, Booking, Tower } from "../models";
import { BookUnitPayload } from "../types";

export interface BookingResult {
  success: boolean;
  message: string;
  unit?: Unit;
}

/**
 * Books a unit atomically.
 *
 * Two layers of protection, so a double-booking is not possible even under
 * a race condition:
 *
 * 1. A conditional UPDATE — "flip this unit to booked, but only if it is
 *    still available" — runs inside a transaction. If two requests arrive
 *    at nearly the same instant, MySQL serializes the two UPDATEs against
 *    the same row; whichever commits first wins, and the row is no longer
 *    'available' by the time the second UPDATE runs, so its affected-row
 *    count is 0.
 * 2. A unique constraint on Booking.unitId as a backstop — even if step 1
 *    were ever bypassed, a second INSERT for the same unit would fail at
 *    the database level.
 */
export async function bookUnit(payload: BookUnitPayload): Promise<BookingResult> {
  const { unitId, customerName, phoneNumber } = payload;

  if (!customerName?.trim() || !phoneNumber?.trim()) {
    return { success: false, message: "Customer name and phone number are required." };
  }

  const transaction = await sequelize.transaction();

  try {
    // Row-level lock: nobody else can read/modify this row until we commit.
    const unit = await Unit.findByPk(unitId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!unit) {
      await transaction.rollback();
      return { success: false, message: "Unit not found." };
    }

    if (unit.status === "booked") {
      await transaction.rollback();
      return { success: false, message: "This unit has already been booked." };
    }

    // Conditional update: only succeeds if status is still 'available'.
    const [affectedRows] = await Unit.update(
      { status: "booked" },
      {
        where: { id: unitId, status: "available" },
        transaction,
      }
    );

    if (affectedRows === 0) {
      await transaction.rollback();
      return { success: false, message: "This unit has already been booked." };
    }

    await Booking.create(
      { unitId, customerName: customerName.trim(), phoneNumber: phoneNumber.trim() },
      { transaction }
    );

    await transaction.commit();

    const updatedUnit = await Unit.findByPk(unitId, {
      include: [{ model: Tower, as: "tower" }],
    });

    return { success: true, message: "Unit booked successfully.", unit: updatedUnit! };
  } catch (error) {
    await transaction.rollback();

    // A unique-constraint violation on Booking.unitId lands here if it ever
    // slips past the checks above — treat it the same way.
    return { success: false, message: "This unit has already been booked." };
  }
}
