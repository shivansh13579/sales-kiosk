import { Request, Response } from "express";
import { GalleryImage } from "../models";

export async function getGallery(req: Request, res: Response) {
  try {
    const images = await GalleryImage.findAll({ order: [["id", "ASC"]] });
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load gallery." });
  }
}
