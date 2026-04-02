import { prisma } from "./lib/prisma";

async function main() {
  // Create a test event
  const event = await prisma.event.create({
    data: {
      title: "Soiree Tech & Innovation",
      description: "Conference sur les tendances IA et web avec networking.",
      date: new Date("2026-06-12T00:00:00.000Z"),
      duree: "1:30",
      lieu: "Palais des Congres",
      ville: "Lyon",
      prix_billet: 35,
      nombre_total_places: 300,
      categorie: "Technologie",
      image_couverture: 1,
    }
  });
  console.log("Created event:", event);

  // Fetch all events
  const allEvents = await prisma.event.findMany();
  console.log("All events:", JSON.stringify(allEvents, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });