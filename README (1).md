# Sales Kiosk Application

A real-time, multi-device Sales Kiosk built for the Convrse Spaces full-stack assignment. It lets a real estate sales executive walk a customer through a project gallery, video walkthroughs, and live apartment inventory — with every connected screen (executive's device + customer's device) mirroring the session in real time, and bookings guaranteed to never double-sell a unit.

**Live Demo:** https://sales-kiosk-delta.vercel.app/
**Backend API:** https://sales-kiosk.onrender.com
**GitHub Repository:** https://github.com/shivansh13579/sales-kiosk

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Real-Time Synchronization](#real-time-synchronization)
- [Atomic Booking](#atomic-booking)
- [Cross-Device Screen Mirroring](#cross-device-screen-mirroring)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Beyond the Scope](#beyond-the-scope)

---

## Overview

The kiosk has three screens — **Gallery**, **Videos**, and **Inventory** — and is designed around one core idea: no device owns its own screen state. Every action a user takes (opening an image, playing a video, selecting a unit, opening the booking dialog) is sent to the backend as an intent; the backend is the single source of truth and broadcasts the resulting state to every connected device, including the one that triggered the action. This is what makes "cross-device mirroring" work uniformly across every feature instead of needing separate sync logic per screen.

The Inventory module is the primary evaluation area, so it received the most engineering attention: bookings are atomic at the database level, guaranteeing that when two devices try to book the same unit at the same instant, exactly one succeeds.

## Features

- **Gallery** — responsive image grid fetched from the backend, full-screen preview on click, mirrored open/close across devices
- **Videos** — video list with thumbnails, in-browser playback, mirrored play state across devices
- **Inventory** — towers and units shown as Available/Booked, tower/unit selection mirrored across devices, booking dialog mirrored across devices
- **Real-time sync** — a booking made on one device updates every connected device's inventory board instantly, no refresh
- **Atomic booking** — two simultaneous booking attempts on the same unit can never both succeed
- **Loading, error, and success states** across all three screens
- **Disabled submit button** while a booking request is in flight

## Tech Stack

| Layer      | Choice                                                   |
| ---------- | -------------------------------------------------------- |
| Frontend   | React, TypeScript, Redux Toolkit, Socket.IO client, Vite |
| Backend    | Node.js, Express, TypeScript, Socket.IO                  |
| Database   | MySQL (hosted on Aiven), Sequelize ORM                   |
| Deployment | Vercel (frontend), Render (backend)                      |

## Architecture

```
      React + Redux (frontend)
               │
       Socket.IO Client  ───────┐
               │                │  REST (GET /gallery, /videos, /inventory, POST /book)
       Socket.IO Server         │
               │                │
      Node.js + Express ────────┘
               │
         Sequelize ORM
               │
          MySQL (Aiven)
```

- **REST** is used for the initial load of each screen (gallery images, video list, inventory).
- **Socket.IO** carries everything that happens _after_ the initial load: intents (tab switches, image opens, video plays, tower/unit selection, dialog open/close) and booking attempts. The server holds one small in-memory state object per kiosk "session" and re-broadcasts it on every change.
- **MySQL** is the single source of truth for inventory status and bookings — the in-memory session state is only about what's currently on screen (UI state), never about booking data.

## Folder Structure

```
sales-kiosk/
├── sales-kiosk-backend/
│   ├── src/
│   │   ├── config/database.ts        Sequelize connection
│   │   ├── models/                   Tower, Unit, Booking, GalleryImage, Video
│   │   ├── services/bookingService.ts   Atomic booking logic
│   │   ├── sockets/                  Session rooms + mirrored state broadcasting
│   │   ├── controllers/, routes/     REST endpoints
│   │   ├── seed.ts                   Sample data
│   │   └── server.ts                 Entry point
│   └── package.json
└── sales-kiosk-frontend/
    ├── src/
    │   ├── api/client.ts             REST calls
    │   ├── socket/                   Socket.IO client + event listeners
    │   ├── store/slices/             kiosk (mirrored state), gallery, videos, inventory
    │   ├── components/               Layout, Gallery, Videos, Inventory, Common
    │   └── App.tsx
    └── package.json
```

## Setup Instructions

### Backend

```bash
cd sales-kiosk-backend
npm install
cp .env.example .env   # fill in your MySQL credentials
npm run seed            # populates sample towers, units, gallery images, videos
npm run dev              # runs on http://localhost:4000
```

### Frontend

```bash
cd sales-kiosk-frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev              # runs on http://localhost:5173
```

### Testing sync locally

Open two browser tabs to the frontend URL — they share a session automatically. Book a unit in one tab and watch the other update without a refresh.

## Environment Variables

### Backend (`.env`)

```dotenv
PORT=4000
CLIENT_ORIGIN=https://sales-kiosk-delta.vercel.app

DB_HOST=<your-aiven-mysql-host>
DB_PORT=<your-aiven-mysql-port>
DB_NAME=<your-database-name>
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>
```

### Frontend (`.env`)

```dotenv
VITE_API_URL=<your-render-backend-url>
```

> Real credentials are never committed — only `.env.example` files with placeholders are checked into the repository. Actual `.env` files are Render/Vercel environment variables set in each platform's dashboard.

## API Endpoints

| Method | Route        | Description                                                                                         |
| ------ | ------------ | --------------------------------------------------------------------------------------------------- |
| `GET`  | `/gallery`   | List gallery images                                                                                 |
| `GET`  | `/videos`    | List videos                                                                                         |
| `GET`  | `/inventory` | List towers with their units                                                                        |
| `POST` | `/book`      | Book a unit — `{ unitId, customerName, phoneNumber }`. Returns `409` if the unit is already booked. |
| `GET`  | `/health`    | Health check                                                                                        |

## Real-Time Synchronization

Every device connects to the backend over Socket.IO using a shared `sessionId` (all devices viewing the same kiosk session use the same value). The server keeps one small state object per session — active tab, open image, playing video, selected tower/unit, open dialog — and re-broadcasts the full object to every device in that session whenever it changes. Devices never mutate their own screen directly from a click; they send an intent and re-render only when the server's broadcast arrives. This means the acting device and every other connected device update through the exact same code path.

## Atomic Booking

Booking a unit runs inside a database transaction with two layers of protection:

1. A row-level lock (`SELECT ... FOR UPDATE`) on the unit, followed by a conditional `UPDATE ... WHERE status = 'available'`. If two booking attempts race, MySQL serializes the two updates against the same row — whichever commits first wins, and the second one affects zero rows.
2. A unique constraint on `bookings.unitId` as a backstop, so even if the first check were ever bypassed, a duplicate booking record could not be inserted.

The losing request is told, in both cases, "This unit has already been booked" — never a silent failure or a partial state.

## Cross-Device Screen Mirroring

The following mirror across every connected device in a session:

- Active tab (Gallery / Videos / Inventory)
- Open image preview
- Playing video
- Selected tower and unit
- Open modals, including the booking dialog

This is implemented as one shared state object per session, broadcast on every change — not as separate sync logic per feature (see [Real-Time Synchronization](#real-time-synchronization) above).

## Assumptions

- One kiosk session (one `sessionId`) represents one showroom pitch — all devices in that pitch share the same session.
- A device with no `sessionId` specified joins a `default` session, which is sufficient for local/demo testing with two browser tabs.
- Booking form fields (name, phone) are kept as local, per-device state rather than mirrored keystroke-by-keystroke, since broadcasting every keystroke would be noise rather than a useful mirror — only the submitted booking matters to other devices.
- Gallery and video data is seeded/static for this assignment rather than uploaded through an admin UI, since the brief scoped those sections as supporting context rather than the primary evaluation area.

## Known Limitations

- No conflict resolution for a device that goes offline mid-session and reconnects later — per the assignment's note, this was explicitly out of scope.
- No authentication/authorization — any device that knows (or guesses) a `sessionId` can join it. Fine for a kiosk demo, not production-ready as-is.
- Session UI state (active tab, selections, etc.) lives in server memory, not the database — a backend restart resets in-progress UI state (though inventory and booking data, which lives in MySQL, is unaffected).
- No automated test suite yet.

## Future Improvements

- Persist session state (e.g. in Redis) so it survives a backend restart or scales across multiple server instances.
- Add authentication for sales executives and per-project session management.
- Offline queueing for bookings with automatic retry on reconnect (flagged as optional in the assignment).
- Unit and integration tests around the booking service's concurrency handling.
- Docker Compose setup for one-command local spin-up of backend + MySQL.

## Beyond the Scope

**Proposed: Booking History Log.**

Beyond the required inventory sync, a sales executive realistically needs to answer "who booked what, and when" — both to reference during a follow-up call and to reassure a customer that their booking was actually recorded. The proposal: a lightweight, read-only panel (or a `GET /bookings` endpoint) listing each booking with unit number, tower, customer name, phone number, and timestamp, sorted most-recent first.

This wasn't built within the assignment window in favor of hardening the atomic booking and mirroring requirements first, since those carry the primary evaluation weight — but the data already exists (the `bookings` table records exactly this), so it would only require one new endpoint and a simple table view on the frontend. It's flagged here rather than shipped half-finished, in line with the assignment's own guidance to prefer a small, well-reasoned addition over a large, incomplete one.
