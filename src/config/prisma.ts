import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => console.log('🚀 Connected to Prisma'))
  .catch((err) => console.error('❌ Prisma connection error:', err));

export default prisma;
