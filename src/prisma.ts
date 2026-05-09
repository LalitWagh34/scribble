import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});