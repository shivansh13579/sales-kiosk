import { sequelize } from "./config/database";
import { Tower, Unit, GalleryImage, Video, Booking } from "./models";

async function seed() {
  await sequelize.sync({ force: true });

  const towerA = await Tower.create({ name: "Tower A" });
  const towerB = await Tower.create({ name: "Tower B" });

  await Unit.bulkCreate([
    { towerId: towerA.id, unitNumber: "101", status: "available" },
    { towerId: towerA.id, unitNumber: "102", status: "available" },
    { towerId: towerA.id, unitNumber: "103", status: "booked" },
    { towerId: towerA.id, unitNumber: "104", status: "available" },
    { towerId: towerB.id, unitNumber: "201", status: "available" },
    { towerId: towerB.id, unitNumber: "202", status: "available" },
  ]);

  await GalleryImage.bulkCreate([
    { title: "Clubhouse", imageUrl: "https://picsum.photos/id/1015/800/600" },
    { title: "Lobby", imageUrl: "https://picsum.photos/id/1016/800/600" },
    { title: "Swimming Pool", imageUrl: "https://picsum.photos/id/1018/800/600" },
    { title: "Garden", imageUrl: "https://picsum.photos/id/1019/800/600" },
  ]);

  await Video.bulkCreate([
    {
      title: "Project Walkthrough",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/id/1021/400/225",
    },
    {
      title: "Amenities Tour",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      thumbnailUrl: "https://picsum.photos/id/1022/400/225",
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
