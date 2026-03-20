import { pgTable, integer } from "drizzle-orm/pg-core";

export const siteStats = pgTable("site_stats", {
  id: integer("id").primaryKey(),
  visitorCount: integer("visitor_count").notNull().default(0),
});
