-- Adds the Tier enum and a nullable Customer.tier column to back the 3-tier
-- pricing rebuild (Essentials / Pro / Enterprise + LEGACY for grandfathered
-- subscribers). Default is STARTER, nullable so historical rows backfill
-- cleanly without an explicit UPDATE.
--
-- This is the first migration in the repo. The production database was
-- previously synced via `prisma db push`, so before running
-- `prisma migrate deploy` for the first time, baseline the existing schema:
--
--   prisma migrate resolve --applied 20260430120000_add_customer_tier
--
-- only AFTER manually verifying that the Tier enum + customers.tier column
-- are already present (i.e. someone ran `db push` against prod after the
-- schema change). If they are NOT present, skip the resolve and let
-- migrate deploy apply this file normally.

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('STARTER', 'GROWTH', 'SCALE', 'LEGACY');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN "tier" "Tier" DEFAULT 'STARTER';
