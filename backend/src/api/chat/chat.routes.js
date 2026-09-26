import express from 'express'
import { createConversationsController,getConversationsController } from './controller/chat.controller.js'

const chatRoutes = express.Router();


chatRoutes.post('/conversations', createConversationsController);
chatRoutes.get('/conversations', getConversationsController);



export default chatRoutes;