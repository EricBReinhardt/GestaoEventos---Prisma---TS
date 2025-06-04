import { PrismaClient } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

interface ArtistaRequestBody {
    nome: string;
    genero: string;
}

const artistaSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    genero: z.string().min(3, 'Gênero deve ter pelo menos 3 caracteres'),
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const artistas = await prisma.artistas.findMany();
        res.json(artistas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar artistas' });
    }
});

router.post('/', async (req: Request<{}, {}, ArtistaRequestBody>, res: Response) => {
    try {
        const parsedData = artistaSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { nome, genero } = parsedData.data;
        const artista = await prisma.artistas.create({
            data: { nome, genero },
        });
        res.status(201).json(artista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar artista' });
    }
});

router.put('/:id', async (req: Request<{id: string}, {}, ArtistaRequestBody>, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const artistaExistente = await prisma.artistas.findUnique({
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
        const artista = await prisma.artistas.update({
            where: { id },
            data: { nome, genero },
        });
        res.json(artista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar artista' });
    }
});

router.delete('/:id', async (req: Request<{id: string}>, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const artistaExistente = await prisma.artistas.findUnique({
            where: { id }
        });

        if (!artistaExistente) {
            return res.status(404).json({ error: 'Artista não encontrado' });
        }

        await prisma.artistas.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar artista' });
    }
});

export default router;