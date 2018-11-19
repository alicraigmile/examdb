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

    .get('/programmesofstudy/:programmeOfStudy.json', async (req, res) => {
        const { Course, Qualification, ProgrammeOfStudy } = req.db;
        const programmeOfStudyId = req.params.programmeOfStudy;
        try {
            ProgrammeOfStudy.findByPk(programmeOfStudyId, {
                include: [{ model: Qualification }]
            }).then(programmeOfStudy => {
                if (programmeOfStudy) {
                    programmeOfStudy.getCourses().then(courses => {
                        const exams = _.map(courses, async course => {
                            await Course.build(course).getExams();
                        }).flatten();
                        const output = { programmeOfStudy, courses, exams };
                        res.json(output);
                    });
                } else {
                    res.error.json(404, `Programme of study '${programmeOfStudyId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch programme of study data.`);
        }
    })

    .get('/programmesofstudy/:programmeOfStudy.csv', async (req, res) => {
        const { Course, Qualification, ProgrammeOfStudy } = req.db;
        const programmeOfStudyId = req.params.programmeOfStudy;
        try {
            ProgrammeOfStudy.findByPk(programmeOfStudyId, {
                include: [{ model: Qualification }]
            }).then(programmeOfStudy => {
                if (programmeOfStudy) {
                    programmeOfStudy.getCourses().then(courses => {
                        const exams = _.map(courses, async course => {
                            // this may be broken
                            await Course.build(course).getExams();
                        }).flatten();
                        return res.csv(exams, true);
                    });
                } else {
                    res.error.text(404, `Programme of study '${programmeOfStudyId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch programme of study data.`);
        }
    })

    .get('/programmesofstudy/:programmeOfStudy', (req, res) => {
        const { Course, Qualification, ProgrammeOfStudy } = req.db;
        const programmeOfStudyId = req.params.programmeOfStudy;
        try {
            ProgrammeOfStudy.findByPk(programmeOfStudyId, {
                include: [{ model: Qualification }]
            }).then(programmeOfStudy => {
                if (programmeOfStudy) {
                    programmeOfStudy.getCourses().then(courses => {
                        const exams = _.map(
                            courses,
                            async course => Course.build(course).getExams() // await
                        ).flatten();
                        const output = { programmeOfStudy, courses, exams };
                        return res.render('programmeofstudy', output);
                    });
                } else {
                    res.error.html(404, `Programme of study '${programmeOfStudyId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.html(500, `Cannot fetch programme of study data.`);
        }
    });

export default router;
