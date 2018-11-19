import { Router } from 'express';

const throwError = (code, errorMessage) => error => {
    const defaultErrorMessage = 'Software error';
    const defaultErrorCode = 500;
    const e = error || new Error(errorMessage || defaultErrorMessage);
    e.code = code || defaultErrorCode;
    throw e;
};
const throwIf = (fn, code, errorMessage) => result => {
    if (fn(result)) {
        return throwError(code, errorMessage)();
    }
    return result;
};

const template = 'dataset';

const router = Router({ mergeParams: true })
    .get('/datasets.json', async (req, res) => {
        const { Dataset, User } = req.db;
        try {
            await Dataset.findAll({ include: [{ model: User, as: 'IngestUser' }] }).then(x => res.json(x));
        } catch (error) {
            res.error.json(500, 'Cannot fetch datasets data', error);
        }
    })

    .get('/datasets', (req, res) => res.redirect('/'))

    .get('/datasets/:dataset.json', async (req, res, next) => {
        const { Dataset, User } = req.db;
        const datasetId = req.params.dataset;
        try {
            const dataset = await Dataset.findByPk(datasetId, { include: [{ model: User, as: 'IngestUser' }] }).then(
                throwIf(r => !r, 404, `Dataset '${datasetId}'`),
                throwError(500, 'Dataset database error.')
            );
            res.json({ dataset });
        } catch (error) {
            if (error.code) {
                res.error.json(error.code, error.message);
            } else {
                next(error);
            }
        }
    })

    .get('/datasets/:dataset', async (req, res, next) => {
        const { Dataset, User } = req.db;
        const datasetId = req.params.dataset;
        try {
            const dataset = await Dataset.findByPk(datasetId, {
                rejectOnEmpty: true,
                include: [{ model: User, as: 'IngestUser' }]
            }).then(
                throwIf(r => !r, 404, `Dataset '${datasetId}' was not found.`),
                throwError(500, 'Dataset database error.')
            );

            res.render(template, { dataset });
        } catch (error) {
            if (error.code) {
                res.error.html(error.code, error.message);
            } else {
                next(error);
            }
        }
    });

export default router;
