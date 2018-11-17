import { Router } from 'express';

const throwError = (code, errorMessage) => error => {
    const defaultErrorMessage = 'Software error';
    const defaultErrorCode = 500;
    const e = error || new Error(errorMessage || defaultErrorMessage);
    e.code = code || defaultErrorCode;
    throw e;
};
const throwIf = (fn, code, errorMessage) => result => {
    if (fn(result)) {
        return throwError(code, errorMessage)();
    }
    return result;
};

const router = Router({ mergeParams: true })
    .get('/courses.json', async (req, res, next) => {
        try {
            req.db.Course.findAll().then(courses => res.json(courses));
        } catch (error) {
            res.error.json(500, 'Cannot fetch courses data', error);
        }
        return next();
    })

    .get('/courses', (req, res) => res.redirect('/'))

    .get('/courses/:course.json', async (req, res, next) => {
        const { Course, ExamBoard, ProgrammeOfStudy, Qualification, WebResource } = req.db;
        const courseId = req.params.course;
        try {
            const course = await Course.findByPk(courseId, {
                rejectOnEmpty: true,
                include: [
                    { model: ProgrammeOfStudy, include: [{ model: Qualification }] },
                    { model: ExamBoard, include: [{ model: WebResource, as: 'Homepage' }] }
                ]
            }).then(
                throwIf(r => !r, 404, `Course '${courseId}' was not found.`),
                throwError(500, 'Course database error.')
            );

            const exams = await course.getExams().catch(throwError(400, 'Exam database error.'));

            const output = { course, exams };
            res.json(output);
        } catch (error) {
            if (error.code) {
                res.error.json(error.code, error.message);
            } else {
                next(error);
            }
        }
    })

    .get('/courses/:course', async (req, res, next) => {
        const { Course, ExamBoard, ProgrammeOfStudy, Qualification, WebResource } = req.db;
        const courseId = req.params.course;
        try {
            const course = await Course.findByPk(courseId, {
                rejectOnEmpty: true,
                include: [
                    { model: ProgrammeOfStudy, include: [{ model: Qualification }] },
                    { model: ExamBoard, include: [{ model: WebResource, as: 'Homepage' }] }
                ]
            }).then(
                throwIf(r => !r, 404, `Course '${courseId}' was not found.`),
                throwError(500, 'Course database error.')
            );

            const exams = await course.getExams().catch(throwError(400, 'Exam database error.'));

            const output = { course, exams };
            res.render('course', output);
        } catch (error) {
            if (error.code) {
                res.error.html(error.code, error.message);
            } else {
                next(error);
            }
        }
    });

export default router;
