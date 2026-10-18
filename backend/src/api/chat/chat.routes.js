import express from 'express'
import {
    createConversationsController,
    getConversationsController,
} from './controller/chat.controller.js'
import { requireAuthentication } from '../../middleware/auth.middleware.js';

const chatRoutes = express.Router();


chatRoutes.use(requireAuthentication);
chatRoutes.post('/conversations', createConversationsController);
chatRoutes.get('/conversations', getConversationsController);



export default chatRoutes;