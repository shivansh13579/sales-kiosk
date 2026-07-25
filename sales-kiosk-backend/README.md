# Sales Kiosk — Backend

Node.js + TypeScript + Express + Sequelize (MySQL) + Socket.IO.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your MySQL credentials
```

Create the database once (Sequelize will create tables, not the database itself):

```sql
CREATE DATABASE sales_kiosk;
```

Seed sample data (towers, units, gallery, videos):

```bash
npm run seed
```

Run in dev mode:

```bash
npm run dev
```

Build + run for production:

```bash
npm run build
npm start
```

## REST API

| Method | Route              | Purpose                                   |
|--------|---------------------|--------------------------------------------|
| GET    | `/gallery`          | List gallery images                        |
| GET    | `/videos`           | List videos                                |
| GET    | `/inventory`        | List towers with their units               |
| POST   | `/book`             | Book a unit — `{ unitId, customerName, phoneNumber }` |
| GET    | `/health`           | Health check                               |

`POST /book` returns `409` with `{ success: false, message: "This unit has already been booked." }` if the unit is no longer available.

## Real-time (Socket.IO)

Connect with a `sessionId` query param — every device sharing a kiosk session (e.g. the executive's tablet and the customer's screen) should connect with the **same** `sessionId`:

```
io("http://localhost:4000", { query: { sessionId: "kiosk-1" } })
```

**Client emits:**
- `client-intent` — `{ type: "set-active-tab" | "open-image" | "close-image" | "play-video" | "select-tower" | "select-unit" | "close-dialog", payload }`
- `book-unit` — `{ unitId, customerName, phoneNumber }`

**Server emits (to the whole session room, including the sender):**
- `state-update` — the full mirrored UI state (active tab, open image, playing video, selected tower/unit, open dialog)
- `booking-result` — `{ success, message, unit? }`
- `inventory-update` — the fresh list of units, sent after any successful booking

The server never trusts a client to update its own screen — every device (including the one that acted) only renders in response to a `state-update`/`inventory-update` it receives back. This is what keeps every connected screen mirrored with a single code path instead of separate sync logic per feature.

## Atomic booking

`src/services/bookingService.ts` books a unit in a transaction with a row-level lock (`SELECT ... FOR UPDATE` via Sequelize's `lock`), then does a conditional `UPDATE ... WHERE status = 'available'`. If a second request loses the race, its update affects 0 rows and it's told the unit is already booked — no two devices can ever both succeed. A unique constraint on `bookings.unitId` is a second line of defense at the database level.

## Project structure

```
src/
  config/database.ts       Sequelize connection
  models/                  Tower, Unit, Booking, GalleryImage, Video
  services/bookingService.ts   Atomic booking logic
  sockets/                 Session rooms + mirrored state broadcasting
  controllers/, routes/    REST endpoints
  seed.ts                  Sample data
  server.ts                Entry point
```
