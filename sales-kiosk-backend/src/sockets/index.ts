import { Server, Socket } from "socket.io";
import { Unit, Tower } from "../models";
import { bookUnit } from "../services/bookingService";
import { ClientIntent, BookUnitPayload, KioskState, defaultKioskState } from "../types";

// In-memory state per kiosk session. A "session" is one showroom kiosk —
// the executive's device and the customer's device both join the same
// sessionId. This does not need to survive a server restart, so it does
// not live in the database.
const sessions = new Map<string, KioskState>();

function getOrCreateSession(sessionId: string): KioskState {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, defaultKioskState());
  }
  return sessions.get(sessionId)!;
}

function applyIntent(state: KioskState, intent: ClientIntent): KioskState {
  switch (intent.type) {
    case "set-active-tab":
      return { ...state, activeTab: intent.payload.tab };
    case "open-image":
      return { ...state, openImageId: intent.payload.imageId };
    case "close-image":
      return { ...state, openImageId: null };
    case "play-video":
      return { ...state, playingVideoId: intent.payload.videoId };
    case "select-tower":
      return { ...state, selectedTowerId: intent.payload.towerId, selectedUnitId: null };
    case "select-unit":
      return { ...state, selectedUnitId: intent.payload.unitId, openDialog: "booking" };
    case "close-dialog":
      return { ...state, openDialog: null, selectedUnitId: null };
    default:
      return state;
  }
}

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    const sessionId = (socket.handshake.query.sessionId as string) || "default";
    socket.join(sessionId);

    // A newly connected device (e.g. the customer's screen turning on
    // mid-pitch) immediately gets caught up to whatever is currently on
    // the executive's screen.
    socket.emit("state-update", getOrCreateSession(sessionId));

    socket.on("client-intent", (intent: ClientIntent) => {
      const current = getOrCreateSession(sessionId);
      const next = applyIntent(current, intent);
      sessions.set(sessionId, next);

      // Broadcast to everyone in the room, including the sender — the
      // sender should only render once the server confirms the change too,
      // so there is exactly one source of truth for every screen.
      io.to(sessionId).emit("state-update", next);
    });

    socket.on("book-unit", async (payload: BookUnitPayload) => {
      const result = await bookUnit(payload);

      // Tell every device the outcome of this specific attempt (used to
      // show a success/error toast on the device that submitted it, and
      // to close the dialog on all mirrored screens).
      io.to(sessionId).emit("booking-result", result);

      if (result.success) {
        // Push the fresh inventory list so every board updates instantly.
        const units = await Unit.findAll({ include: [{ model: Tower, as: "tower" }] });
        io.to(sessionId).emit("inventory-update", units);

        const current = getOrCreateSession(sessionId);
        const next = applyIntent(current, { type: "close-dialog" });
        sessions.set(sessionId, next);
        io.to(sessionId).emit("state-update", next);
      }
    });

    socket.on("disconnect", () => {
      // Sessions are intentionally not cleaned up here — the next device
      // that joins the same sessionId should still see the last known
      // state, not a reset kiosk.
    });
  });
}
