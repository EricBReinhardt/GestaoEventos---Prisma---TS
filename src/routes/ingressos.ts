import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const ingressoSchema = z.object({
    eventoId: z.number().int().positive('ID do evento deve ser positivo'),
    tipo: z.string().min(3, 'Tipo deve ter pelo menos 3 caracteres'),
    preco: z.number().positive('Preço deve ser um número positivo'),
    quantidade: z.number().int().positive('Quantidade deve ser um número positivo'),
});

// Listar todos os ingressos
router.get('/', async (req, res) => {
    try {
        const ingressos = await prisma.ingresso.findMany({
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

// Criar novo ingresso
router.post('/', async (req, res) => {
    try {
        const parsedData = ingressoSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ 
                error: parsedData.error.errors.map(e => e.message) 
            });
        }

        const { eventoId, tipo, preco, quantidade } = parsedData.data;
        
        // Verificar se o evento existe
        const evento = await prisma.evento.findUnique({ 
            where: { id: eventoId } 
        });
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const ingresso = await prisma.ingresso.create({
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

// Atualizar ingresso
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const ingressoExistente = await prisma.ingresso.findUnique({ 
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
        
        // Verificar se o novo evento existe (se mudou)
        if (eventoId !== ingressoExistente.eventoId) {
            const evento = await prisma.evento.findUnique({ 
                where: { id: eventoId } 
            });
            if (!evento) {
                return res.status(404).json({ error: 'Evento não encontrado' });
            }
        }

        const ingresso = await prisma.ingresso.update({
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

// Deletar ingresso
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const ingressoExistente = await prisma.ingresso.findUnique({ where: { id } });
        if (!ingressoExistente) {
            return res.status(404).json({ error: 'Ingresso não encontrado' });
        }

        await prisma.ingresso.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar ingresso' });
    }
});

export default router;