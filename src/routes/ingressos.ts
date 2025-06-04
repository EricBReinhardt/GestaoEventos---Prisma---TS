import { PrismaClient } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const ingressoSchema = z.object({
    eventoId: z.number().int().positive('ID do evento deve ser positivo'),
    tipo: z.enum(['VIP', 'COMUM', 'MEIA']),
    preco: z.number().positive('Preço deve ser um número positivo'),
    quantidade: z.number().int().positive('Quantidade deve ser um número positivo'),
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const ingressos = await prisma.ingressos.findMany({
            include: {
                evento: true,
            },
        });
        res.json(ingressos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar ingressos' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const parsedData = ingressoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { eventoId, tipo, preco, quantidade } = parsedData.data;
        
        const evento = await prisma.eventos.findUnique({ 
            where: { id: eventoId } 
        });
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const ingresso = await prisma.ingressos.create({
            data: { eventoId, tipo, preco, quantidade },
            include: {
                evento: true,
            },
        });
        res.status(201).json(ingresso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar ingresso' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const ingressoExistente = await prisma.ingressos.findUnique({ 
            where: { id },
            include: {
                evento: true,
            },
        });
        if (!ingressoExistente) {
            return res.status(404).json({ error: 'Ingresso não encontrado' });
        }

        const parsedData = ingressoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { eventoId, tipo, preco, quantidade } = parsedData.data;
        
        if (eventoId !== ingressoExistente.eventoId) {
            const evento = await prisma.eventos.findUnique({ 
                where: { id: eventoId } 
            });
            if (!evento) {
                return res.status(404).json({ error: 'Evento não encontrado' });
            }
        }

        const ingresso = await prisma.ingressos.update({
            where: { id },
            data: { eventoId, tipo, preco, quantidade },
            include: {
                evento: true,
            },
        });
        res.json(ingresso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar ingresso' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const ingressoExistente = await prisma.ingressos.findUnique({ where: { id } });
        if (!ingressoExistente) {
            return res.status(404).json({ error: 'Ingresso não encontrado' });
        }

        await prisma.ingressos.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar ingresso' });
    }
});

export default router;