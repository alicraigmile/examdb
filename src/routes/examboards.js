import { Router } from 'express';

const router = Router({ mergeParams: true })
    .get('/examboards.json', async (req, res) => {
        const { ExamBoard, WebResource } = req.db;
        try {
            ExamBoard.findAll({ include: [{ model: WebResource, as: 'Homepage' }] }).then(examboards =>
                res.json(examboards)
            );
        } catch (error) {
            res.error.json(500, 'Cannot fetch examboards data', error);
        }
    })

    .get('/examboards', (req, res) => res.redirect('/'))

    .get('/examboards/:examboard.json', async (req, res) => {
        const { ExamBoard, WebResource } = req.db;
        const examboardId = req.params.examboard;
        try {
            ExamBoard.findByPk(examboardId, {
                include: [{ model: WebResource, as: 'Homepage' }]
            }).then(examboard => {
                if (examboard) {
                    examboard.getCourses().then(courses => {
                        const output = { examboard, courses };
                        res.json(output);
                    });
                } else {
                    res.error.json(404, `Exam board '${examboardId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.json(500, `Cannot fetch examboards data.`);
        }
    })

    .get('/examboards/:examboard', async (req, res) => {
        const { ExamBoard, WebResource } = req.db;
        const examboardId = req.params.examboard;
        try {
            ExamBoard.findByPk(examboardId, {
                include: [{ model: WebResource, as: 'Homepage' }]
            }).then(examboard => {
                if (examboard) {
                    examboard.getCourses().then(courses => {
                        const output = { examboard, courses };
                        return res.render('examboard', output);
                    });
                } else {
                    res.error.html(404, `Exam board '${examboardId}' was not found.`);
                }
            });
        } catch (error) {
            res.error.html(500, `Cannot fetch examboards data.`);
        }
    });

export default router;
