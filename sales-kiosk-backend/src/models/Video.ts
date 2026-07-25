import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface VideoAttributes {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
}

type VideoCreationAttributes = Optional<VideoAttributes, "id">;

export class Video
  extends Model<VideoAttributes, VideoCreationAttributes>
  implements VideoAttributes
{
  public id!: number;
  public title!: string;
  public videoUrl!: string;
  public thumbnailUrl!: string;
}

Video.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "videos",
    timestamps: true,
  }
);
