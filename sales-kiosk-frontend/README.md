# Sales Kiosk — Frontend

React + TypeScript + Redux Toolkit + Socket.IO client.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL if your backend isn't on localhost:4000
npm run dev
```

Opens on `http://localhost:5173`.

## Testing screen mirroring locally

Open two browser tabs:

```
http://localhost:5173
http://localhost:5173
```

Both connect to the same `default` session automatically, so they mirror each other. To test multiple *separate* kiosks side by side without them interfering, add `?session=<anything>` to the URL — tabs sharing the same value mirror each other; different values are independent sessions.

To test on a second physical device, use your machine's LAN IP instead of localhost for both `VITE_API_URL` (backend) and the URL you open on the second device, e.g. `http://192.168.1.20:5173`.

## How the mirroring works

Nothing renders directly from a click. Every interaction — opening an image, playing a video, selecting a tower or unit, opening the booking dialog — calls `sendIntent(...)` in `src/socket/socket.ts`, which just tells the server what happened. The actual screen state (`src/store/slices/kioskSlice.ts`) only changes when the server broadcasts `state-update` back (wired up in `src/socket/listeners.ts`). Every connected device, including the one that clicked, updates from that same broadcast — so there's one code path for "mirroring," not a special case per feature.

The booking form's text inputs are the one thing kept as local component state — broadcasting every keystroke would be noise, not a useful mirror. Only the submit action goes over the socket.

## Project structure

```
src/
  api/client.ts          REST calls (gallery, videos, inventory)
  socket/
    socket.ts            Socket.IO client + sendIntent/sendBooking helpers
    listeners.ts         Wires server broadcasts into Redux
  store/
    slices/kioskSlice.ts     Mirrored screen state (server-driven only)
    slices/gallerySlice.ts
    slices/videoSlice.ts
    slices/inventorySlice.ts
  components/
    Layout/TabBar.tsx
    Gallery/, Videos/, Inventory/
    Common/                  Loader, ErrorMessage, Toast
```

## Known limitations

- No offline queueing for bookings yet (see backend README's note on this).
- The booking dialog's phone validation is a simple regex, not a full international phone number library.
