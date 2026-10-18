import { getUserById, loginUser, registerUser } from './auth.service.js';

export async function registerController(req, res, next) {
    try {
        const { name, email, password } = req.body ?? {};
        if (typeof name !== 'string' || typeof email !== 'string' ||
            typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        const result = await registerUser({ name, email, password });
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return next(error);
    }
}

export async function loginController(req, res, next) {
    try {
        const { email, password } = req.body ?? {};
        if (typeof email !== 'string' || typeof password !== 'string' ||
            !email.trim() || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const result = await loginUser({ email, password });
        return res.json({ success: true, data: result });
    } catch (error) {
        return next(error);
    }
}

export async function currentUserController(req, res, next) {
    try {
        const user = await getUserById(req.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Account no longer exists' });
        }
        return res.json({ success: true, data: { user } });
    } catch (error) {
        return next(error);
    }
}
