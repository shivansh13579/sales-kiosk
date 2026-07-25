import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchInventory } from "../../store/slices/inventorySlice";
import { sendIntent } from "../../socket/socket";
import { Loader } from "../Common/Loader";
import { ErrorMessage } from "../Common/ErrorMessage";
import { BookingDialog } from "./BookingDialog";

export function InventoryBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const { towers, loading, error } = useSelector((s: RootState) => s.inventory);
  const { selectedTowerId, selectedUnitId, openDialog } = useSelector((s: RootState) => s.kiosk);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  if (loading) return <Loader label="Loading inventory…" />;
  if (error) return <ErrorMessage message={error} />;

  const activeTower = towers.find((t) => t.id === selectedTowerId) ?? towers[0] ?? null;
  const selectedUnit = activeTower?.units.find((u) => u.id === selectedUnitId) ?? null;

  return (
    <div className="screen">
      <h1 className="screen__title">Inventory</h1>

      <div className="tower-tabs">
        {towers.map((tower) => (
          <button
            key={tower.id}
            className={`tower-tabs__item ${activeTower?.id === tower.id ? "is-active" : ""}`}
            onClick={() => sendIntent({ type: "select-tower", payload: { towerId: tower.id } })}
          >
            {tower.name}
          </button>
        ))}
      </div>

      {activeTower && (
        <div className="unit-grid">
          {activeTower.units.map((unit) => (
            <button
              key={unit.id}
              disabled={unit.status === "booked"}
              className={`unit-grid__item unit-grid__item--${unit.status}`}
              onClick={() => sendIntent({ type: "select-unit", payload: { unitId: unit.id } })}
            >
              <span className="unit-grid__number">{unit.unitNumber}</span>
              <span className="unit-grid__status">
                {unit.status === "available" ? "Available" : "Booked"}
              </span>
            </button>
          ))}
        </div>
      )}

      {openDialog === "booking" && selectedUnit && (
        <BookingDialog
          unit={selectedUnit}
          towerName={activeTower?.name ?? ""}
          onClose={() => sendIntent({ type: "close-dialog" })}
        />
      )}
    </div>
  );
}
