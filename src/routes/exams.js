import { Router } from 'express';
import { catchError, throwError, throwIf } from '../helpers';

const router = Router({ mergeParams: true })
    .get('/exams.json', async (req, res) => {
        try {
            const exams = await req.db.Exam.findAll();
            res.json(exams);
        } catch (error) {
            catchError(error, () => res.error.json(error.code, error.message));
        }
    })

    .get('/exams', async (req, res) => {
        const { Qualification } = req.db;
        const template = 'examsindex';
        try {
            const qualifications = await Qualification.findAll({ order: [['name', 'ASC']] });
            res.render(template, { qualifications });
        } catch (error) {
            catchError(error, () => res.render(template, {}));
        }
    })

    .get('/exams/:exam.json', async (req, res) => {
        const { Course, Exam } = req.db;
        const examId = req.params.exam;
        const options = { include: [{ model: Course }] };
        const onSuccess = throwIf(r => !r, 404, `Exam '${examId}' not found.`);
        const onError = throwError(500, 'Exam database error');

        try {
            const exam = await Exam.findByPk(examId, options).then(onSuccess, onError);
            res.json(exam);
        } catch (error) {
            catchError(error, () => res.error.json(error.code, error.message));
        }
    })

    .get('/exams/:exam', async (req, res) => {
        const examId = req.params.exam;
        const template = 'exam';

        try {
            const exam = await req.db.Exam.findByPk(examId, {
                include: [{ model: req.db.Course }]
            }).then(throwIf(r => !r, 404, `Exam '${examId}' not found.`), throwError(500, 'Exam database error'));

            res.render(template, { exam });
        } catch (error) {
            catchError(error, () => res.error.html(error.code, error.message));
        }
    });

export default router;
