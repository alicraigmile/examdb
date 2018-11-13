import { Router } from 'express';

const router = Router({ mergeParams: true }).get('/', (req, res) => res.redirect('/exams'));

export default router;
