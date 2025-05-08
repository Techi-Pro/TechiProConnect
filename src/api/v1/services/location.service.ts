import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const upsertLocation = async ({ technicianId, latitude, longitude, address }) => {
    // Upsert location with PostGIS support using raw SQL
    return prisma.$executeRaw`
        INSERT INTO "Location" ("technicianId", "latitude", "longitude", "address", "coordinates")
        VALUES (${technicianId}, ${latitude}, ${longitude}, ${address}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
        ON CONFLICT ("technicianId")
        DO UPDATE SET "latitude" = ${latitude}, "longitude" = ${longitude}, "address" = ${address}, "coordinates" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326);
    `;
}; 