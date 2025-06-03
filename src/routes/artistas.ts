import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const artistaSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    genero: z.string().min(3, 'Gênero deve ter pelo menos 3 caracteres'),
});

router.get('/', async (req, res) => {
    try {
        const artistas = await prisma.artista.findMany();
        res.json(artistas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar artistas' });
    }
});

router.post('/', async (req, res) => {
    try {
        const parsedData = artistaSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { nome, genero } = parsedData.data;
        const artista = await prisma.artista.create({
            data: { nome, genero },
        });
        res.status(201).json(artista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar artista' });
    }
});

router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const artistaExistente = await prisma.artista.findUnique({
            where: { id }
        });

        if (!artistaExistente) {
            return res.status(404).json({ error: 'Artista não encontrado' });
        }

        const parsedData = artistaSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { nome, genero } = parsedData.data;
        const artista = await prisma.artista.update({
            where: { id },
            data: { nome, genero },
        });
        res.json(artista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar artista' });
    }
});

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const artistaExistente = await prisma.artista.findUnique({
            where: { id }
        });

        if (!artistaExistente) {
            return res.status(404).json({ error: 'Artista não encontrado' });
        }

        await prisma.artista.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar artista' });
    }
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default router;