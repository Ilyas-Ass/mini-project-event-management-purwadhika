import { Router } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller';
import { authenticate, authorizeEO } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorizeEO, upload.single('thumbnail'), createEvent);
router.put('/:id', authenticate, authorizeEO, upload.single('thumbnail'), updateEvent);
router.delete('/:id', authenticate, authorizeEO, deleteEvent);

export default router;
