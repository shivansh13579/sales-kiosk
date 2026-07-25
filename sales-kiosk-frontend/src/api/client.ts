const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message || `Request failed (${res.status})`);
  }

  return body;
}

export const api = {
  getGallery: () => request<{ success: boolean; data: import("../types").GalleryImage[] }>("/gallery"),
  getVideos: () => request<{ success: boolean; data: import("../types").Video[] }>("/videos"),
  getInventory: () => request<{ success: boolean; data: import("../types").Tower[] }>("/inventory"),
};

export { API_URL };
