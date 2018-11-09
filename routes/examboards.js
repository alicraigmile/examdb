import { Router } from 'express';


module.exports = Router({ mergeParams: true })



.get('/examboards.json', (req, res) => res.json(req.store.allExamboards()))

.get('/examboards', (req, res) => res.redirect('/'))

.get('/examboards/:examboard.json', (req, res) => {
    const examboardId = req.params.examboard;
    const examboard = req.store.examboard(examboardId);

    if (!examboard) return res.error.json(404, `Exam board '${examboardId}' was not found.`);

    return res.json(examboard);
})

.get('/examboards/:examboard', (req, res) => {
    const examboardId = req.params.examboard;
    const examboard = req.store.examboard(examboardId);
    const inflateQualification = p => {
        p.q = req.store.qualification(p.qualification);
        return p;
    };

    if (!examboard) return res.error.html(404, `Exam board '${examboardId}' was not found.`);

    const examProviders = req.store.providersByExamboard(examboard.id);
    const providers = _.chain(examProviders)
        .map(inflateQualification)
        .value();
    const output = { examboard, providers };

    return res.render('examboard', output);
});