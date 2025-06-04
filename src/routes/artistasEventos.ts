import { PrismaClient } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const artistaEventoSchema = z.object({
    artistaId: z.number().int().positive('ID do artista deve ser positivo'),
    eventoId: z.number().int().positive('ID do evento deve ser positivo'),
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const artistasEventos = await prisma.artistasEventos.findMany({
            include: {
                artista: true,
                evento: true,
            },
        });
        res.json(artistasEventos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar associações artista-evento' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const parsedData = artistaEventoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { artistaId, eventoId } = parsedData.data;
        
        const [artista, evento] = await Promise.all([
            prisma.artistas.findUnique({ where: { id: artistaId } }),
            prisma.eventos.findUnique({ where: { id: eventoId } }),
        ]);

        if (!artista || !evento) {
            return res.status(404).json({ 
                error: 'Artista ou Evento não encontrado' 
            });
        }

        const artistaEvento = await prisma.artistasEventos.create({
            data: { artistaId, eventoId },
            include: {
                artista: true,
                evento: true,
            },
        });
        res.status(201).json(artistaEvento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao associar artista ao evento' });
    }
});

router.delete('/:artistaId/:eventoId', async (req: Request, res: Response) => {
    const artistaId = parseInt(req.params.artistaId);
    const eventoId = parseInt(req.params.eventoId);

    if (isNaN(artistaId) || isNaN(eventoId)) {
        return res.status(400).json({ error: 'IDs inválidos' });
    }

    try {
        const artistaEvento = await prisma.artistasEventos.findUnique({
            where: {
                artistaId_eventoId: {
                    artistaId,
                    eventoId,
                },
            },
        });

        if (!artistaEvento) {
            return res.status(404).json({ error: 'Associação não encontrada' });
        }

        await prisma.artistasEventos.delete({
            where: {
                artistaId_eventoId: {
                    artistaId,
                    eventoId,
                },
            },
        });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover associação' });
    }
});

export default router;