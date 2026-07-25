import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { sendIntent } from "../../socket/socket";
import { KioskState } from "../../types";

const TABS: { key: KioskState["activeTab"]; label: string }[] = [
  { key: "gallery", label: "Gallery" },
  { key: "videos", label: "Videos" },
  { key: "inventory", label: "Inventory" },
];

export function TabBar() {
  const activeTab = useSelector((s: RootState) => s.kiosk.activeTab);
  const connected = useSelector((s: RootState) => s.kiosk.connected);

  return (
    <nav className="tab-bar">
      <div className="tab-bar__brand">Convrse Kiosk</div>
      <div className="tab-bar__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-bar__tab ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => sendIntent({ type: "set-active-tab", payload: { tab: tab.key } })}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={`tab-bar__status ${connected ? "is-live" : "is-offline"}`}>
        <span className="tab-bar__dot" />
        {connected ? "Live" : "Reconnecting…"}
      </div>
    </nav>
  );
}
