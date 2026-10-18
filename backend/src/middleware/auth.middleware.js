import { verifyAccessToken } from '../api/auth/auth.service.js';

export function requireAuthentication(req, res, next) {
    const authorization = req.get('authorization');
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
        req.user = { id: verifyAccessToken(match[1]) };
        return next();
    } catch (error) {
        if (error.status) {
            return next(error);
        }
        return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
    }
}
