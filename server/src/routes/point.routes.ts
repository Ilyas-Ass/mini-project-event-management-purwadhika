import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticate, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        res.json({ points: user?.points || 0 });
    } catch (e) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
