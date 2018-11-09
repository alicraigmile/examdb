import { name, version } from '../package';
import { Router } from 'express';

module.exports = Router({ mergeParams: true })
.get('/teapot', async (req, res, next) => {
    try {
        return res.status(418).send('418 I\'m a teapot');
    } catch (error) {
        next(error);
    }
});

