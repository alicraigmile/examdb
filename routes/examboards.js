import { Router } from 'express';
import _ from 'underscore';

module.exports = Router({ mergeParams: true })
    .get('/examboards.json', async (req, res) => {
        try {
            req.db.ExamBoard.findAll().then(examboards => res.json(examboards));
        } catch (error) {
            res.error.json(500, 'Cannot fetch examboards data', error);
        }
    })

    .get('/examboards', (req, res) => res.redirect('/'))

    .get('/examboards/:examboard.json', async (req, res) => {
        const examboardId = req.params.examboard;
        try {
            req.db.ExamBoard.findByPk(examboardId, { include: [{ model: req.db.WebResource, as: 'Homepage' }] }).then(
                examboard => {
                    if (examboard) {
                        examboard.getCourses().then(courses => {
                            const output = { examboard, courses }; //debug providers -> courses
                            res.json(output);
                        });
                    } else {
                        res.error.json(404, `Exam board '${examboardId}' was not found.`);
                    }
                }
            );
        } catch (error) {
            res.error.json(500, `Cannot fetch examboards data.`);
        }
    })

    .get('/examboards/:examboard', async (req, res) => {
        const examboardId = req.params.examboard;
        try {
            req.db.ExamBoard.findByPk(examboardId, { include: [{ model: req.db.WebResource, as: 'Homepage' }] }).then(
                examboard => {
                    if (examboard) {
                        examboard.getCourses().then(courses => {
                            const output = { examboard, courses }; //debug providers -> courses
                            return res.render('examboard', output);
                        });
                    } else {
                        res.error.html(404, `Exam board '${examboardId}' was not found.`);
                    }
                }
            );
        } catch (error) {
            res.error.html(500, `Cannot fetch examboards data.`);
        }
    });
