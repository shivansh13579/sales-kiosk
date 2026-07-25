export interface GalleryImage {
  id: number;
  title: string;
  imageUrl: string;
}

export interface Video {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export type UnitStatus = "available" | "booked";

export interface Unit {
  id: number;
  towerId: number;
  unitNumber: string;
  status: UnitStatus;
}

export interface Tower {
  id: number;
  name: string;
  units: Unit[];
}

// Mirrors backend KioskState exactly — this is the single shared "screen"
// every connected device renders from.
export interface KioskState {
  activeTab: "gallery" | "videos" | "inventory";
  openImageId: number | null;
  playingVideoId: number | null;
  selectedTowerId: number | null;
  selectedUnitId: number | null;
  openDialog: "booking" | null;
}

export type ClientIntent =
  | { type: "set-active-tab"; payload: { tab: KioskState["activeTab"] } }
  | { type: "open-image"; payload: { imageId: number } }
  | { type: "close-image" }
  | { type: "play-video"; payload: { videoId: number } }
  | { type: "select-tower"; payload: { towerId: number } }
  | { type: "select-unit"; payload: { unitId: number } }
  | { type: "close-dialog" };

export interface BookUnitPayload {
  unitId: number;
  customerName: string;
  phoneNumber: string;
}

export interface BookingResult {
  success: boolean;
  message: string;
  unit?: Unit;
}
