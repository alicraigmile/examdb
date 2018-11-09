import { name, version } from '../package';
import { Router } from 'express';

module.exports = Router({ mergeParams: true })
.get('/hello', async (req, res, next) => {
    try {
        return res.send('hello world');
    } catch (error) {
        next(error);
    }
});

