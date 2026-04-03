#!/bin/sh
set -e
cd /app
npx prisma migrate deploy
npx tsx prisma/seed.ts
exec node dist/src/main.js
