import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initJobs = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            const expiredTxns = await prisma.transaction.findMany({
                where: {
                    status: 'waiting_payment',
                    paymentDeadline: { lt: new Date() }
                }
            });

            for (const txn of expiredTxns) {
                await prisma.$transaction(async (tx) => {
                    await tx.transaction.update({
                        where: { id: txn.id },
                        data: { status: 'expired' }
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
            }

            const canceledTxns = await prisma.transaction.findMany({
                where: {
                    status: 'waiting_confirmation',
                    confirmationDeadline: { lt: new Date() }
                }
            });

            for (const txn of canceledTxns) {
                await prisma.$transaction(async (tx) => {
                    await tx.transaction.update({
                        where: { id: txn.id },
                        data: { status: 'canceled' }
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
            }
        } catch (e) {
            console.error('Cron job error:', e);
        }
    });
};
