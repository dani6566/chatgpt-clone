import express from 'express';
import chatRoutes from './chat/chat.routes.js';
import authRoutes from './auth/auth.routes.js';

const mainRoutes = express.Router();

mainRoutes.use('/auth', authRoutes);
mainRoutes.use('/chat', chatRoutes);

export default mainRoutes;