import express from 'express';
import chatRoutes from './chat/chat.routes.js';

const mainRoutes = express.Router();

mainRoutes.use('/chat', chatRoutes);

export default mainRoutes;