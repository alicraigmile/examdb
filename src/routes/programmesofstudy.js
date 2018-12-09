import { Router } from 'express';
import _ from 'underscore';

const router = Router({ mergeParams: true })
    .get('/programmesofstudy.json', async (req, res, next) => {
        const { ProgrammeOfStudy } = req.db;
        try {
            res.json(await ProgrammeOfStudy.findAll());
        } catch (error) {
            res.error.json(500, 'Cannot fetch programme of study data', error);
        }
        return next();
    })

    .get('/programmesofstudy', (req, res) => res.redirect('/'))

    .get('/programmesofstudy/:programmeOfStudyId.json', async (req, res) => {
        const { Course, Exam, Qualification, ProgrammeOfStudy } = req.db;
        const { programmeOfStudyId } = req.params;
        try {
            ProgrammeOfStudy.findByPk(programmeOfStudyId, {
                include: [{ model: Qualification }, { model: Course, include: [{ model: Exam }] }]
            }).then(programmeOfStudy => {
                if (programmeOfStudy) {
                    res.json({ programmeOfStudy });
                } else {
                    res.error.json(404, `Programme of study '${programmeOfStudyId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch programme of study data. - ${error}`);
        }
    })

    .get('/programmesofstudy/:programmeOfStudyId.csv', async (req, res) => {
        const { Course, Exam, Qualification, ProgrammeOfStudy } = req.db;
        const { programmeOfStudyId } = req.params;
        try {
            ProgrammeOfStudy.findByPk(programmeOfStudyId, {
                include: [{ model: Qualification }, { model: Course, include: [{ model: Exam }] }]
            }).then(programmeOfStudy => {
                if (!programmeOfStudy) {
                    return res.error.text(404, `Programme of study '${programmeOfStudyId}' was not found.`);
                }
                const exams = _.map(programmeOfStudy.Courses, course => course.Exams)
                    .flatten()
                    .map(exam => exam.get({ plain: true }));
                return res.csv(exams, true);
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch programme of study data.`);
        }
    })

    .get('/programmesofstudy/:programmeOfStudyId', async (req, res) => {
        const { Course, Exam, Qualification, ProgrammeOfStudy } = req.db;
        const { programmeOfStudyId } = req.params;
        try {
            ProgrammeOfStudy.findByPk(programmeOfStudyId, {
                include: [
                    { model: Qualification },
                    { model: Course, include: [{ model: Exam, include: [{ model: Course }] }] }
                ]
            }).then(programmeOfStudy => {
                if (!programmeOfStudy) {
                    return res.error.html(404, `Programme of study '${programmeOfStudyId}' was not found.`);
                }
                const exams = _.map(programmeOfStudy.Courses, course => course.Exams).flatten();
                const output = { programmeOfStudy, exams };
                res.render('programmeofstudy', output);
            });
        } catch (error) {
            res.error.html(500, `Cannot fetch programme of study data  ${error}.`);
        }
    });

export default router;
