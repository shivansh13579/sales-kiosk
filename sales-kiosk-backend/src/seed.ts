import { sequelize } from "./config/database";
import { Tower, Unit, GalleryImage, Video } from "./models";

export async function seedDatabase() {
  const towerA = await Tower.create({ name: "Tower A" });
  const towerB = await Tower.create({ name: "Tower B" });
  const towerC = await Tower.create({ name: "Tower C" });
  const towerD = await Tower.create({ name: "Tower D" });

  await Unit.bulkCreate([
    // Tower A
    { towerId: towerA.id, unitNumber: "101", status: "available" },
    { towerId: towerA.id, unitNumber: "102", status: "available" },
    { towerId: towerA.id, unitNumber: "103", status: "booked" },
    { towerId: towerA.id, unitNumber: "104", status: "available" },
    { towerId: towerA.id, unitNumber: "105", status: "available" },
    { towerId: towerA.id, unitNumber: "106", status: "booked" },

    // Tower B
    { towerId: towerB.id, unitNumber: "201", status: "available" },
    { towerId: towerB.id, unitNumber: "202", status: "booked" },
    { towerId: towerB.id, unitNumber: "203", status: "available" },
    { towerId: towerB.id, unitNumber: "204", status: "available" },
    { towerId: towerB.id, unitNumber: "205", status: "available" },
    { towerId: towerB.id, unitNumber: "206", status: "booked" },

    // Tower C
    { towerId: towerC.id, unitNumber: "301", status: "available" },
    { towerId: towerC.id, unitNumber: "302", status: "available" },
    { towerId: towerC.id, unitNumber: "303", status: "booked" },
    { towerId: towerC.id, unitNumber: "304", status: "available" },
    { towerId: towerC.id, unitNumber: "305", status: "available" },
    { towerId: towerC.id, unitNumber: "306", status: "available" },

    // Tower D
    { towerId: towerD.id, unitNumber: "401", status: "booked" },
    { towerId: towerD.id, unitNumber: "402", status: "available" },
    { towerId: towerD.id, unitNumber: "403", status: "available" },
    { towerId: towerD.id, unitNumber: "404", status: "available" },
    { towerId: towerD.id, unitNumber: "405", status: "booked" },
    { towerId: towerD.id, unitNumber: "406", status: "available" },
  ]);

  await GalleryImage.bulkCreate([
    {
      title: "Clubhouse",
      imageUrl: "https://picsum.photos/id/1015/800/600",
    },
    {
      title: "Lobby",
      imageUrl: "https://picsum.photos/id/1016/800/600",
    },
    {
      title: "Swimming Pool",
      imageUrl: "https://picsum.photos/id/1018/800/600",
    },
    {
      title: "Garden",
      imageUrl: "https://picsum.photos/id/1019/800/600",
    },
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

  console.log("Database seeded.");
}

// Run only when executing: npm run seed
if (require.main === module) {
  (async () => {
    try {
      await sequelize.sync({ force: true });
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
