import { Router } from 'express';
import { name, version } from '../../package';

const router = Router({ mergeParams: true }).get('/status', async (req, res, next) => {
    try {
        return res.json({ app: name, version });
    } catch (error) {
        return next(error);
    }
});

export default router;
