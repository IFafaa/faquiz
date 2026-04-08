-- Remove integração Google: usuários só com senha; apaga contas só-OAuth

DELETE FROM "User" WHERE "password" IS NULL;

DROP INDEX IF EXISTS "User_googleId_key";

ALTER TABLE "User" DROP COLUMN IF EXISTS "googleId";

ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
