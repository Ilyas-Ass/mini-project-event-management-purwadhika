import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const getEvents = async (req: Request, res: Response) => {
    try {
        const { q, category, location, isFree } = req.query;

        const where: any = { status: 'published' };

        if (q) {
            where.OR = [
                { title: { contains: String(q) } },
                { description: { contains: String(q) } },
            ];
        }
        if (category) where.category = String(category);
        if (location) where.location = String(location);
        if (isFree !== undefined) where.isFree = isFree === 'true';

        const events = await prisma.event.findMany({
            where,
            include: {
                ticketTypes: true,
                organizer: { select: { name: true } }
            },
            orderBy: { startDate: 'asc' }
        });

        res.json(events);
    } catch (error) {
        console.error('GetEvents error', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({
            where: { id },
            include: { ticketTypes: true, organizer: { select: { name: true } } }
        });

        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, startDate, endDate, location, category, totalSeats, isFree, ticketTypes } = req.body;
        const organizerId = req.user!.id;
        let thumbnailUrl = null;

        if (req.file) {
            thumbnailUrl = `/uploads/${req.file.filename}`;
        }

        const tickets = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;

        const event = await prisma.event.create({
            data: {
                organizerId,
                title,
                description,
                status: 'published',
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                category,
                totalSeats: parseInt(totalSeats),
                availableSeats: parseInt(totalSeats),
                isFree: isFree === 'true',
                thumbnailUrl,
                ticketTypes: {
                    create: tickets?.map((t: any) => ({
                        name: t.name,
                        price: parseInt(t.price),
                        availableSeats: parseInt(t.availableSeats)
                    })) || []
                }
            },
            include: { ticketTypes: true }
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('CreateEvent error', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const organizerId = req.user!.id;

        const event = await prisma.event.findUnique({ where: { id } });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.organizerId !== organizerId) return res.status(403).json({ message: 'Forbidden' });

        // Ensure no complete transactions exist if we are editing
        const transactions = await prisma.transaction.findMany({ where: { eventId: id, status: 'done' } });
        if (transactions.length > 0) {
            return res.status(400).json({ message: 'Cannot edit event with completed transactions' });
        }

        const { title, description, category, location, status } = req.body;
        let thumbnailUrl = event.thumbnailUrl;

        if (req.file) {
            thumbnailUrl = `/uploads/${req.file.filename}`;
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: { title, description, category, location, status, thumbnailUrl }
        });

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const organizerId = req.user!.id;

        const event = await prisma.event.findUnique({ where: { id } });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.organizerId !== organizerId) return res.status(403).json({ message: 'Forbidden' });

        await prisma.event.delete({ where: { id } });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
