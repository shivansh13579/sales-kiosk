import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface TowerAttributes {
  id: number;
  name: string;
}

type TowerCreationAttributes = Optional<TowerAttributes, "id">;

export class Tower
  extends Model<TowerAttributes, TowerCreationAttributes>
  implements TowerAttributes
{
  public id!: number;
  public name!: string;
}

Tower.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "towers",
    timestamps: true,
  }
);
