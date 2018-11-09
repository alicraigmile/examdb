import { Router } from 'express';
import _ from 'underscore';

module.exports = Router({ mergeParams: true })
    .get('/qualifications.json', async (req, res) => {
        try {
            req.db.Qualification.findAll().then(qualifications => res.json(qualifications));
        } catch (error) {
            res.error.json(500, 'Cannot fetch qualifications data.');
        }
    })

    .get('/qualifications', (req, res) => res.redirect('/'))

    .get('/qualifications/:qualification.json', (req, res) =>
        res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
    )

    .get('/qualifications/:qualification', (req, res) => {
        const qualificationId = req.params.qualification;
        const qualification = req.store.qualification(qualificationId);
        const inflateExamboard = p => {
            p.e = req.store.examboard(p.examboard);
            return p;
        }; // p = 'provider'

        if (!qualification) return res.error.html(404, `Qualification '${qualificationId}' was not found.`);

        const qualificationProviders = req.store.providersOfQualification(qualification.id);
        const providers = _.chain(qualificationProviders)
            .clone()
            .map(inflateExamboard)
            .value();

        const output = { qualification, providers };
        return res.render('qualification', output);
    });
