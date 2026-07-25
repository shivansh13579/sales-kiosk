import { Request, Response } from "express";
import { Video } from "../models";

export async function getVideos(req: Request, res: Response) {
  try {
    const videos = await Video.findAll({ order: [["id", "ASC"]] });
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load videos." });
  }
}
