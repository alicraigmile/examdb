import { Router } from 'express';
import { throwError, throwIf } from '../helpers';

const router = Router({ mergeParams: true })
    .get('/courses.json', async (req, res, next) => {
        const { Course } = req.db;
        try {
            res.json(await Course.findAll({ order: [['id', 'ASC']] }));
        } catch (error) {
            res.error.json(500, 'Cannot fetch courses data', error);
        }
        return next();
    })

    .get('/courses', (req, res) => res.redirect('/'))

    .get('/courses/:course.json', async (req, res, next) => {
        const { Course, Exam, ExamBoard, ProgrammeOfStudy, Qualification, WebResource, Sequelize } = req.db;
        const courseId = req.params.course;
        try {
            const course = await Course.findByPk(courseId, {
                include: [
                    { model: ProgrammeOfStudy, include: [{ model: Qualification }] },
                    { model: ExamBoard, include: [{ model: WebResource, as: 'Homepage' }] },
                    { model: Exam }
                ],
                order: [[Exam, 'date', 'ASC']]
            });
            if (!course) {
                throwError(404, `Course '${courseId}' was not found.`);
            }
            res.json({ course });
        } catch (error) {
            if (error.code) {
                res.error.json(error.code, error.message);
            } else {
                next(error);
            }
        }
    })

    .get('/courses/:course', async (req, res, next) => {
        const { Course, Exam, ExamBoard, ProgrammeOfStudy, Qualification, WebResource } = req.db;
        const courseId = req.params.course;
        try {
            const course = await Course.findByPk(courseId, {
                rejectOnEmpty: true,
                include: [
                    { model: ProgrammeOfStudy, include: [{ model: Qualification }] },
                    { model: ExamBoard, include: [{ model: WebResource, as: 'Homepage' }] },
                    { model: Exam }
                ],
                order: [[Exam, 'date', 'ASC']]
            }).then(
                throwIf(r => !r, 404, `Course '${courseId}' was not found.`),
                throwError(500, 'Course database error.')
            );
            res.render('course', { course });
        } catch (error) {
            if (error.code) {
                res.error.html(error.code, error.message);
            } else {
                next(error);
            }
        }
    });

export default router;
