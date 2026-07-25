import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { TabBar } from "./components/Layout/TabBar";
import { GalleryGrid } from "./components/Gallery/GalleryGrid";
import { VideoList } from "./components/Videos/VideoList";
import { InventoryBoard } from "./components/Inventory/InventoryBoard";
import { Toast } from "./components/Common/Toast";

export default function App() {
  const activeTab = useSelector((s: RootState) => s.kiosk.activeTab);

  return (
    <div className="app">
      <TabBar />
      <main className="app__content">
        {activeTab === "gallery" && <GalleryGrid />}
        {activeTab === "videos" && <VideoList />}
        {activeTab === "inventory" && <InventoryBoard />}
      </main>
      <Toast />
    </div>
  );
}
