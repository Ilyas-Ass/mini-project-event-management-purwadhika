import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const createTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId, ticketTypeId, quantity, pointsUsed, voucherCode } = req.body;
        const attendeeId = req.user!.id;

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        const ticket = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
        if (!event || !ticket) return res.status(404).json({ message: 'Event or Ticket not found' });
        if (ticket.availableSeats < quantity) return res.status(400).json({ message: 'Not enough seats available' });

        let discount = 0;
        if (voucherCode) {
            const promo = await prisma.promotion.findUnique({ where: { code: voucherCode } });
            if (promo && promo.isActive && new Date() >= promo.startDate && new Date() <= promo.endDate) {
                if (!promo.eventId || promo.eventId === eventId) {
                    discount = promo.discountType === 'percent' ? (ticket.price * quantity * promo.discountValue) / 100 : promo.discountValue;
                }
            } else {
                return res.status(400).json({ message: 'Invalid or expired voucher' });
            }
        }

        let total = (ticket.price * quantity) - discount;
        if (total < 0) total = 0;

        const authUser = await prisma.user.findUnique({ where: { id: attendeeId } });
        const usePoints = pointsUsed ? parseInt(pointsUsed) : 0;
        if (authUser!.points < usePoints) return res.status(400).json({ message: 'Not enough points' });

        total = total - usePoints;
        if (total < 0) total = 0;

        // Execute transaction safely
        const result = await prisma.$transaction(async (tx) => {
            // deduct seats
            await tx.ticketType.update({
                where: { id: ticketTypeId },
                data: { availableSeats: { decrement: quantity } }
            });
            await tx.event.update({
                where: { id: eventId },
                data: { availableSeats: { decrement: quantity } }
            });

            // deduct points
            if (usePoints > 0) {
                await tx.user.update({
                    where: { id: attendeeId },
                    data: { points: { decrement: usePoints } }
                });
            }

            // create transaction
            const isFree = total === 0;
            const status = isFree ? 'done' : 'waiting_payment';
            const paymentDeadline = isFree ? null : new Date(Date.now() + 2 * 60 * 60 * 1000);

            const txn = await tx.transaction.create({
                data: {
                    attendeeId,
                    eventId,
                    ticketTypeId,
                    quantity,
                    totalPrice: total,
                    pointsUsed: usePoints,
                    voucherCode,
                    status,
                    paymentDeadline,
                }
            });
            return txn;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getAttendeeTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { attendeeId: req.user!.id },
            include: { event: { select: { title: true, thumbnailUrl: true } }, ticketType: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getEoTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { event: { organizerId: req.user!.id } },
            include: { event: { select: { title: true } }, ticketType: { select: { name: true } }, attendee: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const txn = await prisma.transaction.findUnique({
            where: { id },
            include: { event: true, ticketType: true, attendee: { select: { name: true, email: true } } }
        });
        if (!txn) return res.status(404).json({ message: 'Not found' });
        res.json(txn);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const uploadPaymentProof = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        const txn = await prisma.transaction.findUnique({ where: { id } });
        if (!txn || txn.attendeeId !== req.user!.id) return res.status(404).json({ message: 'Transaction not found' });
        if (txn.status !== 'waiting_payment') return res.status(400).json({ message: 'Invalid status' });

        const proofUrl = `/uploads/${req.file.filename}`;
        const updated = await prisma.transaction.update({
            where: { id },
            data: {
                paymentProofUrl: proofUrl,
                status: 'waiting_confirmation',
                confirmationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const confirmTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const txn = await prisma.transaction.findUnique({ where: { id }, include: { event: true } });
        if (!txn) return res.status(404).json({ message: 'Not found' });
        if (txn.event.organizerId !== req.user!.id) return res.status(403).json({ message: 'Forbidden' });
        if (txn.status !== 'waiting_confirmation') return res.status(400).json({ message: 'Invalid status' });

        const earnedPoints = Math.floor(txn.totalPrice * 0.1);

        const updated = await prisma.$transaction(async (tx) => {
            const updatedTxn = await tx.transaction.update({
                where: { id },
                data: { status: 'done', confirmationDeadline: null }
            });

            if (earnedPoints > 0) {
                await tx.user.update({
                    where: { id: txn.attendeeId },
                    data: { points: { increment: earnedPoints } }
                });
            }

            return updatedTxn;
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const rejectTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const txn = await prisma.transaction.findUnique({ where: { id }, include: { event: true } });
        if (!txn) return res.status(404).json({ message: 'Not found' });
        if (txn.event.organizerId !== req.user!.id) return res.status(403).json({ message: 'Forbidden' });
        if (txn.status !== 'waiting_confirmation') return res.status(400).json({ message: 'Invalid status' });

        // restore points & seats
        await prisma.$transaction(async (tx) => {
            await tx.transaction.update({
                where: { id },
                data: { status: 'rejected', confirmationDeadline: null }
            });
            if (txn.pointsUsed > 0) {
                await tx.user.update({
                    where: { id: txn.attendeeId },
                    data: { points: { increment: txn.pointsUsed } }
                });
            }
            await tx.ticketType.update({
                where: { id: txn.ticketTypeId },
                data: { availableSeats: { increment: txn.quantity } }
            });
            await tx.event.update({
                where: { id: txn.eventId },
                data: { availableSeats: { increment: txn.quantity } }
            });
        });

        res.json({ message: 'Transaction rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
