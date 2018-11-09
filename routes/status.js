import { name, version } from '../package';
import { Router } from 'express';

module.exports = Router({ mergeParams: true }).get('/status', async (req, res, next) => {
    try {
        return res.json({ app: name, version });
    } catch (error) {
        next(error);
    }
});
