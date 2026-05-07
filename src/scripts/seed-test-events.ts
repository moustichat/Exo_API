import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cuid from 'cuid';
import { prisma } from '../lib/prisma';

type SeedEvent = {
  title: string;
  description: string;
  date: Date;
  duree: string;
  location: string;
  city: string;
  price: number;
  total_seats: number;
  seats_available: number;
  category: string;
  picture: number | null;
};

const organizerEmail = 'organizer.tests@example.com';
const organizerPassword = 'Test1234!';
const organizerId = cuid();
const legacyOrganizerId = 'cm-test-organizer';

const seedEvents: SeedEvent[] = [
  {
    title: 'Nuit Electro à Paris',
    description: 'Une soirée électronique en plein centre avec DJs invités et scénographie immersive.',
    date: new Date('2026-06-14T20:30:00.000Z'),
    duree: '05:00:00',
    location: 'Le Zenith',
    city: 'Paris',
    price: 28,
    total_seats: 240,
    seats_available: 240,
    category: 'Concert',
    picture: null,
  },
  {
    title: 'Conférence IA & Produits',
    description: 'Retours d’expérience sur l’IA générative, la qualité logicielle et la mise en production.',
    date: new Date('2026-06-20T08:45:00.000Z'),
    duree: '08:00:00',
    location: 'Palais des Congrès',
    city: 'Lyon',
    price: 42,
    total_seats: 180,
    seats_available: 180,
    category: 'Conference',
    picture: null,
  },
  {
    title: 'Festival des Lumières Urbaines',
    description: 'Parcours nocturne, installations visuelles et performances live dans plusieurs quartiers.',
    date: new Date('2026-07-05T18:00:00.000Z'),
    duree: '10:00:00',
    location: 'Parc des Expositions',
    city: 'Marseille',
    price: 19,
    total_seats: 400,
    seats_available: 400,
    category: 'Festival',
    picture: null,
  },
  {
    title: 'Match de Gala Basket',
    description: 'Rencontre de gala avec animations, musique et accès famille.',
    date: new Date('2026-07-12T16:00:00.000Z'),
    duree: '03:00:00',
    location: 'Arena Grand Est',
    city: 'Strasbourg',
    price: 25,
    total_seats: 300,
    seats_available: 300,
    category: 'Sport',
    picture: null,
  },
  {
    title: 'Comédie Classique du Vendredi',
    description: 'Une représentation théâtrale contemporaine inspirée des grands classiques.',
    date: new Date('2026-06-27T19:30:00.000Z'),
    duree: '02:10:00',
    location: 'Théâtre des Arts',
    city: 'Bordeaux',
    price: 31,
    total_seats: 160,
    seats_available: 160,
    category: 'Theatre',
    picture: null,
  },
  {
    title: 'Afterwork Startup & Networking',
    description: 'Rencontres entre fondateurs, freelances et recruteurs autour d’un format convivial.',
    date: new Date('2026-06-18T17:30:00.000Z'),
    duree: '04:00:00',
    location: 'Station F',
    city: 'Paris',
    price: 12,
    total_seats: 120,
    seats_available: 120,
    category: 'Conference',
    picture: null,
  },
  {
    title: 'Nuit du Cinéma en Plein Air',
    description: 'Projection de trois films sous les étoiles avec food trucks et espace détente.',
    date: new Date('2026-08-01T19:45:00.000Z'),
    duree: '06:30:00',
    location: 'Esplanade du Lac',
    city: 'Nantes',
    price: 16,
    total_seats: 260,
    seats_available: 260,
    category: 'Festival',
    picture: null,
  },
  {
    title: 'Concert Jazz au Lever du Jour',
    description: 'Matinée musicale avec trio jazz, brunch inclus et ambiance intimiste.',
    date: new Date('2026-07-19T08:00:00.000Z'),
    duree: '02:30:00',
    location: 'La Halle aux Grains',
    city: 'Toulouse',
    price: 22,
    total_seats: 140,
    seats_available: 140,
    category: 'Concert',
    picture: null,
  }
];

async function main() {
  const passwordHash = await bcrypt.hash(organizerPassword, 10);

  await prisma.event.deleteMany({
    where: {
      organizerId: legacyOrganizerId,
    },
  });

  const existingOrganizer = await prisma.user.findUnique({
    where: { email: organizerEmail },
    select: { id: true },
  });

  if (existingOrganizer) {
    await prisma.event.deleteMany({
      where: { organizerId: existingOrganizer.id },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId: existingOrganizer.id },
    });

    await prisma.user.delete({
      where: { email: organizerEmail },
    });
  }

  const organizer = await prisma.user.upsert({
    where: { email: organizerEmail },
    update: {
      name: 'Organisateur de test',
      role: 'ORGANIZER',
      passwordHash,
    },
    create: {
      id: organizerId,
      name: 'Organisateur de test',
      email: organizerEmail,
      passwordHash,
      role: 'ORGANIZER',
    },
  });

  for (const event of seedEvents) {
    const eventId = cuid();

    await prisma.event.upsert({
      where: { id: eventId },
      update: {
        title: event.title,
        description: event.description,
        date: event.date,
        duree: event.duree,
        location: event.location,
        city: event.city,
        price: event.price,
        total_seats: event.total_seats,
        seats_available: event.seats_available,
        category: event.category,
        organizerId: organizer.id,
        picture: event.picture,
      },
      create: {
        ...event,
        id: eventId,
        organizerId: organizer.id,
      },
    });
  }

  console.log(`Seeded ${seedEvents.length} test events for ${organizer.email}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed test events:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });