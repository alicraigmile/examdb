import { Router } from 'express';

const router = Router({ mergeParams: true })
    .get('/qualifications.json', async (req, res) => {
        try {
            req.db.Qualification.findAll().then(qualifications => res.json(qualifications));
        } catch (error) {
            res.error.json(500, 'Cannot fetch qualifications data', error);
        }
    })

    .get('/qualifications', (req, res) => res.redirect('/'))

    .get('/qualifications/:qualificationId.json', (req, res) => {
        const { Qualification, ProgrammeOfStudy } = req.db;
        const { qualificationId } = req.params;
        try {
            Qualification.findByPk(qualificationId, {
                order: [[ProgrammeOfStudy, 'name', 'ASC']],
                include: [{ model: ProgrammeOfStudy }]
            }).then(qualification => {
                if (!qualification) {
                    return res.error.json(404, `Qualification '${qualificationId}' was not found.`);
                }
                const programmesofstudy = qualification.ProgrammeOfStudies;
                const output = { qualification, programmesofstudy };
                return res.json(output);
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch qualifications data.- ${error}`);
        }
    })

    .get('/qualifications/:qualificationId', (req, res) => {
        const { Qualification, ProgrammeOfStudy } = req.db;
        const { qualificationId } = req.params;
        try {
            Qualification.findByPk(qualificationId, {
                order: [[ProgrammeOfStudy, 'name', 'ASC']],
                include: [{ model: ProgrammeOfStudy }]
            }).then(qualification => {
                if (!qualification) {
                    return res.error.html(404, `Qualification '${qualificationId}' was not found.`);
                }
                const output = { qualification };
                return res.render('qualification', output);
            });
        } catch (error) {
            res.error.html(500, `Cannot fetch qualifications data.- ${error}`);
        }
    });

export default router;
