import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes protégées - chat
router.post('/message', authMiddleware, ChatController.sendMessage);
router.get('/conversations', authMiddleware, ChatController.getConversations);
router.get('/conversations/:conversationId/messages', authMiddleware, ChatController.getConversationMessages);

export const chatRoutes = router;
