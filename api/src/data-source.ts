import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Try to load env from repo root and from api/.env for CLI usage
const repoRootEnv = path.resolve(__dirname, '../../.env');
if (fs.existsSync(repoRootEnv)) dotenv.config({ path: repoRootEnv });
const apiEnv = path.resolve(__dirname, './.env');
if (fs.existsSync(apiEnv)) dotenv.config({ path: apiEnv });

const rawHost = process.env.DATABASE_HOST ?? process.env.DB_HOST ?? 'localhost';
const isDocker =
  (process.env.DOCKERIZED ?? '').toLowerCase() === 'true' ||
  (process.env.CONTAINER ?? '').toLowerCase() === 'true' ||
  (process.env.RUNNING_IN_DOCKER ?? '').toLowerCase() === 'true';
// If using docker-compose env (DB_HOST=db) but running CLI locally, target localhost
const host = !isDocker && rawHost === 'db' ? 'localhost' : rawHost;
const port = Number(process.env.DATABASE_PORT ?? process.env.DB_PORT ?? '5432');
const username = process.env.DATABASE_USER ?? process.env.DB_USER ?? 'postgres';
const password =
  process.env.DATABASE_PASS ?? process.env.DB_PASSWORD ?? 'postgres';
const database = process.env.DATABASE_NAME ?? process.env.DB_NAME ?? 'postgres';

const dataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  // Use TS paths while running with ts-node; for compiled JS, change to dist/**/*.entity.js
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});

export default dataSource;
