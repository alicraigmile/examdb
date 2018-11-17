import { Router } from 'express';

const router = Router({ mergeParams: true })
    .get('/teapot.json', async (req, res) => res.status(418).json({ status: 418, message: "I'm a teapot" }))
    .get('/teapot', async (req, res) => res.status(418).send("418 I'm a teapot"));

export default router;
