import express from 'express';
import {
    currentUserController,
    loginController,
    registerController,
} from './auth.controller.js';
import { requireAuthentication } from '../../middleware/auth.middleware.js';

const authRoutes = express.Router();

authRoutes.post('/register', registerController);
authRoutes.post('/login', loginController);
authRoutes.get('/me', requireAuthentication, currentUserController);

export default authRoutes;
