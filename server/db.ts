import "dotenv/config";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// 如果沒有設置 DATABASE_URL，使用默認值
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://heptareview:heptareview@localhost:5433/heptareview';
console.log("DATABASE_URL (from db.ts) is:", DATABASE_URL);

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema });