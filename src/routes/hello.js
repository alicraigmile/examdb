import { Router } from 'express';

const router = Router({ mergeParams: true }).get('/hello', async (req, res, next) => {
    try {
        return res.send('hello world');
    } catch (error) {
        return next(error);
    }
});

export default router;
