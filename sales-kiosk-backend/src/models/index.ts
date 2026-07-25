import { Tower } from "./Tower";
import { Unit } from "./Unit";
import { Booking } from "./Booking";
import { GalleryImage } from "./GalleryImage";
import { Video } from "./Video";

// A tower has many units; a unit belongs to one tower
Tower.hasMany(Unit, { foreignKey: "towerId", as: "units" });
Unit.belongsTo(Tower, { foreignKey: "towerId", as: "tower" });

// A unit has at most one booking (enforced by the unique constraint on Booking.unitId)
Unit.hasOne(Booking, { foreignKey: "unitId", as: "booking" });
Booking.belongsTo(Unit, { foreignKey: "unitId", as: "unit" });

export { Tower, Unit, Booking, GalleryImage, Video };
