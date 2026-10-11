import { pgTable, serial, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const dashboardSync = pgTable(
  "dashboard_sync",
  {
    sync_code: varchar("sync_code", { length: 32 }).primaryKey(),
    content: jsonb("content").notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("dashboard_sync_updated_at_idx").on(table.updated_at),
  ]
);
