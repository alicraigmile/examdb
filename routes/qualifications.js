import { Router } from 'express';
import _ from 'underscore';

module.exports = Router({ mergeParams: true })
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

    .get('/qualifications/:qualification', (req, res) => {
        const qualificationId = req.params.qualification;
        try {
            req.db.Qualification.findByPk(qualificationId).then(qualification => {
                if (qualification) {
                    qualification.getProgrammeOfStudies().then(programmesofstudy => {
                        const output = { qualification, programmesofstudy };
                        return res.render('qualification', output);
                    });
                } else {
                    res.error.html(404, `Qualification '${qualificationId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.html(500, `Cannot fetch qualifications data.`);
        }
    });
