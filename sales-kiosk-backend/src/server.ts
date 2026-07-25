import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { sequelize } from "./config/database";
import "./models"; // ensures associations are registered before sync

import galleryRoutes from "./routes/gallery.routes";
import videoRoutes from "./routes/video.routes";
import inventoryRoutes from "./routes/inventory.routes";
import { postBooking } from "./controllers/inventory.controller";

import { registerSocketHandlers } from "./sockets";
import { setIO } from "./sockets/ioInstance";

dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// REST API — matches the suggested shape from the brief
app.use("/gallery", galleryRoutes);
app.use("/videos", videoRoutes);
app.use("/inventory", inventoryRoutes);
app.post("/book", postBooking);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN },
});
setIO(io);
registerSocketHandlers(io);

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // In a real project this would be migrations; sync() is fine for an
    // assignment-scale app.
    await sequelize.sync();
    console.log("Models synced.");

    server.listen(PORT, () => {
      console.log(`Sales Kiosk backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
