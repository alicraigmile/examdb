import { Router } from 'express';


module.exports = Router({ mergeParams: true })
.get('/search', async (req, res, next) => {
    try {
        // 'query' IS MIGHTY INSECURE!!!
        let query = req.query.q;

        const todayRegex = /^today$/i;
        const tomorrowRegex = /^tomorrow$/i;
        const template = 'search';

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

        const results = _.union(
            req.store.findProgrammesOfStudy(query),
            req.store.findQualifications(query),
            req.store.findExamboards(query),
            req.store.findCourses(query),
            req.store.findExams(query)
        );

        const output = { query, results };
        res.render(template, output);
    } catch(error) {
        next(error)
    }
});
