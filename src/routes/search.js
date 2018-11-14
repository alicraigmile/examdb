import { Router } from 'express';
import { Op } from 'sequelize';
import _ from 'underscore';
import db from '../../models';

const todayRegex = /^today$/i;
const tomorrowRegex = /^tomorrow$/i;
const template = 'search';

// const addProgrammeOfStudyTag = (obj) => _(obj).extend({ isProgrammeOfStudy: true }).value();

const findProgrammesOfStudy = query => {
    return db.ProgrammeOfStudy.findAll({ where: { name: { [Op.like]: `%${query}%` } } });
};

const findQualifications = query => db.Qualification.findAll();
const findExamboards = query => db.ExamBoard.findAll();
const findCourses = query => db.Course.findAll();
const findExams = query => db.Exam.findAll();

const searchFor = async query => {
    if (!query) return;

    console.log('hello');

    const isToday = query.match(todayRegex);
    const isTomorrow = query.match(tomorrowRegex);

    // magic keyword show's today's exams
    if (isToday) {
        const date = new Date();
        query = date.toISOString().slice(0, 10);
    } else if (isTomorrow) {
        const date = new Date();
        date.setDate(date.getDate() + 1); // add 1 day
        query = date.toISOString().slice(0, 10);
    }

    return await Promise.all([
        findProgrammesOfStudy(query),
        findQualifications(query),
        findExamboards(query),
        findCourses(query),
        findExams(query)
    ]);
};

const router = Router({ mergeParams: true })
    .get('/search.json', async (req, res, next) => {
        let query = req.query.q;
        try {
            const results = searchFor(query);
            const output = { query, results };
            res.json(output);
        } catch (error) {
            res.error.json(500, `Could not complete search for ${query} - ${error}`);
        }
    })

    .get('/search', async (req, res, next) => {
        let query = req.query.q;
        try {
            const results = searchFor(query);
            const output = { query, results };
            res.render(template, output);
        } catch (error) {
            next();
        }
    });

export default router;
