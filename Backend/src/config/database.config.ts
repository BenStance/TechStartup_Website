export const DatabaseConfig = {
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './dev.db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
  logging: process.env.DB_LOGGING === 'true' || true,
};