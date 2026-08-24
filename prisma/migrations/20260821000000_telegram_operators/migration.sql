DO $$ BEGIN
  CREATE TYPE "TelegramOperatorRole" AS ENUM ('ADMIN', 'OPERATOR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "TelegramOperator" (
  "id" TEXT NOT NULL,
  "telegramUserId" TEXT,
  "username" TEXT NOT NULL,
  "role" "TelegramOperatorRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TelegramOperator_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TelegramOperator_telegramUserId_key" ON "TelegramOperator"("telegramUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "TelegramOperator_username_key" ON "TelegramOperator"("username");
