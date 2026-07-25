import { Router } from "express";
import { getGallery } from "../controllers/gallery.controller";

const router = Router();

router.get("/", getGallery);

export default router;
