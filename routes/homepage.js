import { Router } from 'express';

module.exports = Router({ mergeParams: true }).get('/', (req, res) => {
    return res.redirect('/exams');
});
