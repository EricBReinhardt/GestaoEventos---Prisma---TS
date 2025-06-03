import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const artistaSchema = z.object({
    nome: z.string().min(3, 'Nome é obrigatório'),
    genero: z.string().min(3, 'Gênero é obrigatório'),
});