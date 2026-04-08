import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import transactionRoutes from './routes/transaction.routes';
import promotionRoutes from './routes/promotion.routes';
import pointRoutes from './routes/point.routes';
import { errorHandler } from './middlewares/errorHandler';
import { initJobs } from './jobs';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/points', pointRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', server: 'EventMU API' });
});

app.use(errorHandler);

initJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
