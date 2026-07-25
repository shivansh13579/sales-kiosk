import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type UnitStatus = "available" | "booked";

interface UnitAttributes {
  id: number;
  towerId: number;
  unitNumber: string;
  status: UnitStatus;
}

type UnitCreationAttributes = Optional<UnitAttributes, "id" | "status">;

export class Unit
  extends Model<UnitAttributes, UnitCreationAttributes>
  implements UnitAttributes
{
  public id!: number;
  public towerId!: number;
  public unitNumber!: string;
  public status!: UnitStatus;
}

Unit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    towerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "booked"),
      allowNull: false,
      defaultValue: "available",
    },
  },
  {
    sequelize,
    tableName: "units",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["towerId", "unitNumber"],
      },
    ],
  }
);
