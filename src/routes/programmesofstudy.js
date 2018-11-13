import { Router } from 'express';
import _ from 'underscore';

const router = Router({ mergeParams: true })
    .get('/programmesofstudy.json', async (req, res, next) => {
        try {
            req.db.ProgrammeOfStudy.findAll().then(programmesofstudy => res.json(programmesofstudy));
        } catch (error) {
            res.error.json(500, 'Cannot fetch programme of study data', error);
        }
        return next();
    })

    .get('/programmesofstudy', (req, res) => res.redirect('/'))

    .get('/programmesofstudy/:programmeofstudy.json', async (req, res) => {
        const programmeofstudyId = req.params.programmeofstudy;
        try {
            req.db.ProgrammeOfStudy.findByPk(programmeofstudyId, {
                include: [{ model: req.db.Qualification }]
            }).then(programmeofstudy => {
                if (programmeofstudy) {
                    programmeofstudy.getCourses().then(courses => {
                        const exams = _.map(courses, async course => {
                            await req.db.Course.build(course).getExams();
                        }).flatten();
                        const output = { programmeofstudy, courses, exams };
                        res.json(output);
                    });
                } else {
                    res.error.json(404, `Programme of study '${programmeofstudyId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch programme of study data.`);
        }
    })

    .get('/programmesofstudy/:programmeofstudy.csv', async (req, res) => {
        const programmeofstudyId = req.params.programmeofstudy;
        try {
            req.db.ProgrammeOfStudy.findByPk(programmeofstudyId, {
                include: [{ model: req.db.Qualification }]
            }).then(programmeofstudy => {
                if (programmeofstudy) {
                    programmeofstudy.getCourses().then(courses => {
                        const exams = _.map(courses, async course => {
                            // this may be broken
                            await req.db.Course.build(course).getExams();
                        }).flatten();
                        return res.csv(exams, true);
                    });
                } else {
                    res.error.text(404, `Programme of study '${programmeofstudyId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch programme of study data.`);
        }
    })

    .get('/programmesofstudy/:programmeofstudy', (req, res) => {
        const programmeofstudyId = req.params.programmeofstudy;
        try {
            req.db.ProgrammeOfStudy.findByPk(programmeofstudyId, {
                include: [{ model: req.db.Qualification }]
            }).then(programmeofstudy => {
                if (programmeofstudy) {
                    programmeofstudy.getCourses().then(courses => {
                        const exams = _.map(
                            courses,
                            async course => req.db.Course.build(course).getExams() // await
                        ).flatten();
                        const output = { programmeofstudy, courses, exams };
                        return res.render('programmeofstudy', output);
                    });
                } else {
                    res.error.html(404, `Programme of study '${programmeofstudyId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.html(500, `Cannot fetch programme of study data.`);
        }
    });

/*
    .get('/programmesofstudy/:programmeofstudy.json', (req, res) => {
        const programmeOfStudyId = req.params.programmeofstudy;
        const programmeOfStudy = req.store.programmeOfStudy(programmeOfStudyId);

        if (!programmeOfStudy) return res.error.json(404, `Programme of study '${programmeOfStudyId}' was not found.`);

        const exams = req.store.examsForProgrammeOfStudy(programmeOfStudy.id);
        _.map(exams, exam => {
            const course = req.store.course(exam.course);
            const provider = req.store.provider(course.provider);
            const examboard = req.store.examboard(provider.examboard);
            exam.c = course;
            exam.p = provider;
            exam.e = examboard;
            return exam;
        });

        return res.json({ programmeOfStudy, exams });
    })

    .get('/programmesofstudy/:programmeofstudy.csv', (req, res) => {
        const programmeofstudyId = req.params.programmeofstudy;
        const programmeofstudy = req.store.programmeOfStudy(programmeofstudyId);

        if (!programmeofstudy) return res.error.text(404, `Programme of study '${programmeofstudyId}' was not found.`);

        const exams = req.store.examsForProgrammeOfStudy(programmeofstudy.id);
        return res.csv(exams, true);
    })

    .get('/programmesofstudy/:programmeofstudy', (req, res) => {
        const programmeOfStudyId = req.params.programmeofstudy;
        const programmeOfStudy = req.store.programmeOfStudy(programmeOfStudyId);

        if (!programmeOfStudy) return res.error.html(404, `Programme of study '${programmeOfStudyId}' was not found.`);

        const courses = req.store.coursesByProgrammeOfStudy(programmeOfStudy.id);
        const qualification = req.store.qualification(programmeOfStudy.qualification);

        _.map(courses, course => {
            const provider = req.store.provider(course.provider);
            const examboard = req.store.examboard(provider.examboard);
            course.p = provider;
            course.e = examboard;
            return course;
        });

        const exams = req.store.examsForProgrammeOfStudy(programmeOfStudy.id);

        _.map(exams, exam => {
            const course = req.store.course(exam.course);
            const provider = req.store.provider(course.provider);
            const examboard = req.store.examboard(provider.examboard);
            exam.c = course;
            exam.p = provider;
            exam.e = examboard;
            return exam;
        });

        return res.render('programmeofstudy', { programmeOfStudy, qualification, courses, exams });
    });

    */
export default router;
