import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const eventoSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    data: z.string().datetime('Data deve ser um datetime válido'),
    local: z.string().min(3, 'Local deve ter pelo menos 3 caracteres'),
    capacidade: z.number().int().positive('Capacidade deve ser um número positivo'),
});

router.get('/', async (req, res) => {
    try {
        const eventos = await prisma.evento.findMany({
            include: {
                artistas: {
                    include: {
                        artista: true,
                    },
                },
                ingressos: true,
            },
        });
        res.json(eventos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const parsedData = eventoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { nome, data, local, capacidade } = parsedData.data;
        const evento = await prisma.evento.create({
            data: { 
                nome, 
                data: new Date(data), 
                local, 
                capacidade 
            },
        });
        res.status(201).json(evento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
});

router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const eventoExistente = await prisma.evento.findUnique({ where: { id } });
        if (!eventoExistente) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const parsedData = eventoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { nome, data, local, capacidade } = parsedData.data;
        const evento = await prisma.evento.update({
            where: { id },
            data: { 
                nome, 
                data: new Date(data), 
                local, 
                capacidade 
            },
        });
        res.json(evento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
});

// Deletar evento
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const eventoExistente = await prisma.evento.findUnique({ where: { id } });
        if (!eventoExistente) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        await prisma.evento.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar evento' });
    }
});

export default router;