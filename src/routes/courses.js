import { Router } from 'express';
import isUrl from 'is-url';
import { throwError, throwIf} from '../helpers';

class RequiredFieldMissingError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RequiredFieldMissingError';
    }
}

class InvalidFieldError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidFieldError';
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}


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
        const { Course, Exam, ExamBoard, ProgrammeOfStudy, Qualification, WebResource } = req.db;
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


    .get('/courses/:courseId/webresources/add', async (req, res, next) => {
        const { Course, Exam, ExamBoard, ProgrammeOfStudy, Qualification, WebResource } = req.db;
        const { courseId } = req.params;
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
            res.render('course-add-webresource', { course, defaults: {} });
        } catch (error) {
            if (error.code) {
                res.error.html(error.code, error.message);
            } else {
                next(error);
            }
        }
    })

    .post('/courses/:courseId/webresources/add', async (req, res, next) => {
        const { Course, Exam, ExamBoard, ProgrammeOfStudy, Qualification, WebResource } = req.db;
        const { courseId }  = req.params;
        const { title, url } = req.body;

        let course;
        try {
            course = await Course.findByPk(courseId, {
                include: [
                    { model: ProgrammeOfStudy, include: [{ model: Qualification }] },
                    { model: ExamBoard, include: [{ model: WebResource, as: 'Homepage' }] },
                    { model: Exam }
                ],
                order: [[Exam, 'date', 'ASC']]
            });
            if (!course) {
                throw(new NotFoundError(`Course '${courseId}' was not found.`));
               
            }

            if (! title) throw(new RequiredFieldMissingError('title'));
            if (! url) throw(new RequiredFieldMissingError('url'));
            if (! isUrl(url)) throw(new InvalidFieldError('url'));
            await WebResource.create({title, url}).then(link => link.addCourse(courseId));
            res.redirect(`/courses/${courseId}#WebResources`);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.error.html(404, error.message);
            } else if (error instanceof RequiredFieldMissingError || error instanceof InvalidFieldError) {
                res.render('course-add-webresource', { course, headline: error.name, message: error.message, defaults: {title, url} });
            } else if (error.code) {
                res.error.html(error.code, error.message);
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
                    { model: Exam },
                    { model: WebResource }
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
