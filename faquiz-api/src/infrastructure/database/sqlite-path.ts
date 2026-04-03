import { join } from 'node:path';

export function resolveSqliteFilePath(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./dev.db';
  let p = raw.replace(/^file:/, '');
  if (!p.startsWith('/') && !/^[a-zA-Z]:[\\/]/.test(p)) {
    p = join(process.cwd(), p);
  }
  return p;
}
