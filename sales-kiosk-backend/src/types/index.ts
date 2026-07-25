// Everything a mirrored kiosk screen needs to render itself.
// The server is the only thing allowed to mutate this — clients only ever
// send "intents" and re-render from whatever the server broadcasts back.
export interface KioskState {
  activeTab: "gallery" | "videos" | "inventory";
  openImageId: number | null;
  playingVideoId: number | null;
  selectedTowerId: number | null;
  selectedUnitId: number | null;
  openDialog: "booking" | null;
}

export const defaultKioskState = (): KioskState => ({
  activeTab: "gallery",
  openImageId: null,
  playingVideoId: null,
  selectedTowerId: null,
  selectedUnitId: null,
  openDialog: null,
});

// Client -> Server: "I'd like the session to change like this"
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
