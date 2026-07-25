import { io, Socket } from "socket.io-client";
import { API_URL } from "../api/client";
import { ClientIntent, BookUnitPayload } from "../types";

// The sessionId is what links two devices into one mirrored kiosk. Pass
// ?session=kiosk-1 in the URL on both devices to pair them; devices that
// don't specify one share the "default" session, which is the easiest way
// to test with two browser tabs on one machine.
function getSessionId(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("session") || "default";
}

export const sessionId = getSessionId();

export const socket: Socket = io(API_URL, {
  query: { sessionId },
  autoConnect: true,
});

// Every user action becomes an "intent" sent to the server — the screen
// itself only updates when the server broadcasts the resulting state back
// (see kioskSlice's `state-update` listener in socket/listeners.ts).
export function sendIntent(intent: ClientIntent) {
  socket.emit("client-intent", intent);
}

export function sendBooking(payload: BookUnitPayload) {
  socket.emit("book-unit", payload);
}
