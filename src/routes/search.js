import { Router } from 'express';
import { Op } from 'sequelize';
import _ from 'underscore';
import db from '../../models';

const todayRegex = /^today$/i;
const tomorrowRegex = /^tomorrow$/i;
const template = 'search';

// Tag('ProgrammeOfStudy')
// Promise to add e.g. isProgrammeOfStudy=true to each object in turn
const tag = tagName => objects =>
    Promise.resolve(
        _.map(objects, obj => {
            obj[`is${tagName}`] = true;
            return obj;
        })
    );

const findProgrammesOfStudy = query =>
    db.ProgrammeOfStudy.findAll({ raw: true, where: { name: { [Op.like]: `%${query}%` } } }).then(
        tag('ProgrammeOfStudy')
    );
const findQualifications = query =>
    db.Qualification.findAll({ raw: true, where: { name: { [Op.like]: `%${query}%` } } }).then(tag('Qualification'));
const findExamboards = query =>
    db.ExamBoard.findAll({ raw: true, where: { name: { [Op.like]: `%${query}%` } } }).then(tag('ExamBoard'));
const findCourses = query =>
    db.Course.findAll({ raw: true, where: { name: { [Op.like]: `%${query}%` } } }).then(tag('Course'));
const findExams = query =>
    db.Exam.findAll({ raw: true, where: { paper: { [Op.like]: `%${query}%` } } }).then(tag('Exam'));
const searchFor = rawQuery => {
    let query = rawQuery;
    if (!query) return Promise.reject(new Error('no-query'));

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

    return Promise.all([
        findProgrammesOfStudy(query),
        findQualifications(query),
        findExamboards(query),
        findCourses(query),
        findExams(query)
    ]).then(_.flatten);
};

const router = Router({ mergeParams: true })
    .get('/search.json', async (req, res) => {
        const query = req.query.q;
        try {
            const results = await searchFor(query);
            console.log(results);
            const output = { query, results };
            res.json(output);
        } catch (error) {
            res.error.json(500, `Could not complete search for ${query} - ${error}`);
        }
    })

    .get('/search', async (req, res, next) => {
        const query = req.query.q;
        try {
            const results = await searchFor(query);
            const output = { query, results };
            res.render(template, output);
        } catch (error) {
            next();
        }
    });

export default router;
