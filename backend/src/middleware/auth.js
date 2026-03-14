import { verifyToken } from '@clerk/backend';

export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY
        });

        if (!payload) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = {
            id: payload.sub,
            ...payload
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};