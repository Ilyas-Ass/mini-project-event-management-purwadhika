import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
    const txns = await prisma.transaction.findMany();
    for (const txn of txns) {
        if (txn.paymentProofUrl && txn.paymentProofUrl.startsWith('/public/uploads')) {
            const newUrl = txn.paymentProofUrl.replace('/public/uploads', '/uploads');
            await prisma.transaction.update({
                where: { id: txn.id },
                data: { paymentProofUrl: newUrl }
            });
            console.log(`Updated transaction ${txn.id} URL to ${newUrl}`);
        }
    }
    console.log('Database fix complete.');
}

fix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
