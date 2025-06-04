import { PrismaClient } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const eventoSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    dataHora: z.string().datetime('Data deve ser um datetime válido'),
    local: z.string().min(3, 'Local deve ter pelo menos 3 caracteres'),
    preco_base: z.number().positive('Preço base deve ser um número positivo'),
    descricao: z.string().optional() 
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const eventos = await prisma.eventos.findMany({
            include: {
                ArtistasEventos: {
                    include: {
                        artista: true,
                    },
                },
                Ingressos: true,
            },
        });
        res.json(eventos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const parsedData = eventoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { nome, dataHora, local, preco_base, descricao } = parsedData.data;
        
        const evento = await prisma.eventos.create({
            data: {
                nome,
                dataHora: new Date(dataHora),
                local,
                preco_base,
                descricao: descricao || '' // Fornece string vazia se undefined
            }
        });
        
        res.status(201).json(evento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const eventoExistente = await prisma.eventos.findUnique({ where: { id } });
        if (!eventoExistente) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const parsedData = eventoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { nome, dataHora, local, preco_base, descricao } = parsedData.data;
        const evento = await prisma.eventos.update({
            where: { id },
            data: { 
                nome, 
                dataHora: new Date(dataHora), 
                local, 
                preco_base,
                descricao
            },
        });
        res.json(evento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const eventoExistente = await prisma.eventos.findUnique({ where: { id } });
        if (!eventoExistente) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        await prisma.eventos.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar evento' });
    }
});

export default router;