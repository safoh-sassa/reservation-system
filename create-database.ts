import { PrismaClient } from "@prisma/client";

// Create a Prisma client that connects to MySQL server without specifying a database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_ROOT || "mysql://root@localhost:3306/mysql",
    },
  },
});

// Create painting_scheduler_db if not exist
async function createDatabaseIfNotExists() {
  await prisma.$executeRawUnsafe(
    `CREATE DATABASE IF NOT EXISTS painting_scheduler_db`
  );
  console.log("Database created or already exists");
}

async function main() {
  await createDatabaseIfNotExists();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
