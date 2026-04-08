import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const createPromotion = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId, code, discountType, discountValue, startDate, endDate } = req.body;
        const organizerId = req.user!.id;

        const exists = await prisma.promotion.findUnique({ where: { code } });
        if (exists) return res.status(400).json({ message: 'Code already exists' });

        if (eventId) {
            const event = await prisma.event.findUnique({ where: { id: eventId } });
            if (!event || event.organizerId !== organizerId) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        }

        const promo = await prisma.promotion.create({
            data: {
                organizerId,
                eventId: eventId || null,
                code,
                discountType,
                discountValue: parseInt(discountValue),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            }
        });
        res.status(201).json(promo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getPromotions = async (req: AuthRequest, res: Response) => {
    try {
        const promos = await prisma.promotion.findMany({
            where: { organizerId: req.user!.id },
            include: { event: { select: { title: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deletePromotion = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const promo = await prisma.promotion.findUnique({ where: { id } });
        if (!promo || promo.organizerId !== req.user!.id) return res.status(403).json({ message: 'Forbidden' });

        await prisma.promotion.delete({ where: { id } });
        res.json({ message: 'Promotion deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const validatePromotion = async (req: Request, res: Response) => {
    try {
        const { code, eventId } = req.body;
        const promo = await prisma.promotion.findUnique({ where: { code } });

        if (!promo || !promo.isActive) return res.status(400).json({ valid: false, message: 'Invalid code' });
        if (new Date() < promo.startDate || new Date() > promo.endDate) {
            return res.status(400).json({ valid: false, message: 'Code expired or not started' });
        }
        if (promo.eventId && promo.eventId !== eventId) {
            return res.status(400).json({ valid: false, message: 'Code not applicable to this event' });
        }

        res.json({ valid: true, promotion: promo });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
