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

    .get('/qualifications/:qualification.json', (req, res) => {
        const qualificationId = req.params.qualification;
        try {
            req.db.Qualification.findByPk(qualificationId).then(qualification => {
                if (qualification) {
                    qualification.getProgrammeOfStudies().then(programmesofstudy => {
                        const output = { qualification, programmesofstudy };
                        res.json(output);
                    });
                } else {
                    res.error.json(404, `Qualification '${qualificationId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch qualifications data.`);
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
                if (! qualification) {
                    return res.error.html(404, `Qualification '${qualificationId}' was not found.`);
                }
                const programmesofstudy = qualification.ProgrammeOfStudies;
                const output = { qualification, programmesofstudy };
                return res.render('qualification', output); ß               
            });
        } catch (error) {
            res.error.html(500, `Cannot fetch qualifications data.- ${error}`);
        }
    });

export default router;
