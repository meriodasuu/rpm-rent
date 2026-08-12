import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedCars, seedFaqs, seedServices } from "../src/data/seed";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

for (const car of seedCars) {
  const { images, ...data } = car;
  await prisma.car.upsert({ where: { id: car.id }, create: data, update: data });
  await prisma.carImage.deleteMany({ where: { carId: car.id } });
  await prisma.carImage.createMany({ data: images.map((image, sortOrder) => ({ ...image, carId: car.id, sortOrder })) });
}
for (const service of seedServices) await prisma.service.upsert({ where: { id: service.id }, create: service, update: service });
for (const faq of seedFaqs) await prisma.faq.upsert({ where: { id: faq.id }, create: faq, update: faq });
await prisma.$disconnect();
console.log("PostgreSQL seed completed");
