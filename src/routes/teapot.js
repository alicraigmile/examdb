import { Router } from 'express';

const router = Router({ mergeParams: true }).get('/teapot', async (req, res, next) => {
    try {
        return res.status(418).send("418 I'm a teapot");
    } catch (error) {
        return next(error);
    }
});

export default router;
