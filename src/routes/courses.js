import { Router } from 'express';

const throwError = (code, errorMessage) => error => {
    if (!error) error = new Error(errorMessage || 'Software error (no detail)');
    if (!code) code = 500;
    error.code = code;
    throw error;
};
const throwIf = (fn, code, errorMessage) => result => {
    if (fn(result)) {
        console.log('throwIf true');
        console.log(errorMessage);
        return throwError(code, errorMessage)();
    }
    return result;
};

const getExams = course => course.getExams();

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
        const courseId = req.params.course;
        try {
            const course = await req.db.Course.findByPk(courseId, {
                rejectOnEmpty: true,
                include: [{ model: req.db.ProgrammeOfStudy }, { model: req.db.ExamBoard }]
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
        const courseId = req.params.course;
        try {
            const course = await req.db.Course.findByPk(courseId, {
                rejectOnEmpty: true,
                include: [{ model: req.db.ProgrammeOfStudy }, { model: req.db.ExamBoard }]
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
