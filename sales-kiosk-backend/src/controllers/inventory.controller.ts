import { Request, Response } from "express";
import { Tower, Unit } from "../models";
import { bookUnit } from "../services/bookingService";
import { getIO } from "../sockets/ioInstance";
import { Unit as UnitModel } from "../models";

export async function getInventory(req: Request, res: Response) {
  try {
    const towers = await Tower.findAll({
      include: [{ model: Unit, as: "units" }],
      order: [["id", "ASC"]],
    });
    res.json({ success: true, data: towers });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to load inventory." });
  }
}

export async function postBooking(req: Request, res: Response) {
  const { unitId, customerName, phoneNumber } = req.body;

  const result = await bookUnit({ unitId, customerName, phoneNumber });

  if (!result.success) {
    return res.status(409).json({ success: false, message: result.message });
  }

  const sessionId = (req.headers["x-session-id"] as string) || "default";
  const io = getIO();
  if (io) {
    const units = await UnitModel.findAll({
      include: [{ model: Tower, as: "tower" }],
    });
    io.to(sessionId).emit("booking-result", result);
    io.to(sessionId).emit("inventory-update", units);
  }

  res.json({ success: true, message: result.message, data: result.unit });
}
