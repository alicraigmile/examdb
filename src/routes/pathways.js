import { Router } from 'express';
import _ from 'underscore';
import ExamDbDate from '../date';

const router = Router({ mergeParams: true })
    .get('/pathways.json', (req, res) => res.json(req.store.allProviders()))

    .get('/pathways', (req, res) => res.redirect('/'))

    .get('/pathways/:provider.json', (req, res) =>
        res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
    )

    .get('/pathways/:provider', (req, res) => {
        const providerId = req.params.provider;
        const provider = req.store.provider(providerId);
        const orderByPosName = c => c.pos.name; // c = 'course'
        const inflateProgrammeOfStudy = c => {
            c.pos = req.store.programmeOfStudy(c.programmeofstudy);
            return c;
        };

        if (!provider) return res.error.html(404, `Provider '${providerId}' was not found.`);

        const providerCourses = req.store.coursesByProvider(provider.id);
        const courses = _.chain(providerCourses)
            .clone()
            .map(inflateProgrammeOfStudy)
            .sortBy(orderByPosName)
            .value();
        const examboard = req.store.examboard(provider.examboard);
        const qualification = req.store.qualification(provider.qualification);

        return res.render('pathway', { pathway: provider, courses, examboard, qualification });
    })

    .get('/pathways/:provider/calendar.json', (req, res) =>
        res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
    )

    .get('/pathways/:provider/calendar.ics', (req, res) =>
        res.error.text(501, 'ICS format not yet available.  Please contact the developer for more information.')
    )

    .get('/pathways/:provider/calendar', (req, res) => res.redirect(`/pathways/${req.params.provider}`))

    .get('/pathways/:pathway/calendar/week.json', (req, res) =>
        res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
    )

    .get('/pathways/:provider/calendar/week', (req, res) => {
        const providerId = req.params.provider;
        const provider = req.store.provider(providerId);
        let query = req.query.date;

        if (!provider) return res.error.html(404, 'pathway not found');

        // show this week if no date is specified
        if (!query) {
            const today = new ExamDbDate();
            query = today.examDbShortDateString();
        }

        const queryDate = new ExamDbDate(query);

        const queryDayOfWeek = queryDate.getDay();

        // days 1..5 -> Mon..Fri
        const weekDays = [1, 2, 3, 4, 5].map(offset => {
            const date = queryDate.clone();
            date.setDate(date.getDate() - queryDayOfWeek + offset); // offset compared to which day of the week today is
            return date;
        });

        const days = weekDays.map(date => {
            const dateString = date.examDbLongDateString();
            const dateShort = date.examDbShortDateString();
            const morningExams = req.store.morningExams(dateString);
            const afternoonExams = req.store.afternoonExams(dateString);
            const active = date.examDbShortDateString() === queryDate.examDbShortDateString();

            return { date: dateString, dateShort, active, morningExams, afternoonExams };
        });

        const monday = weekDays[0];

        const examboard = req.store.examboard(provider.examboard);
        const qualification = req.store.qualification(provider.qualification);
        const weekCommencing = monday.examDbLongDateString();
        const previousWeekCommencing = monday.thisDayLastWeek().examDbShortDateString();
        const nextWeekCommencing = monday.thisDayNextWeek().examDbShortDateString();
        const numberOfExamsThisWeek = _.chain(days)
            .map(day => day.morningExams.length + day.afternoonExams.length)
            .reduce((memo, num) => memo + num, 0)
            .value();

        const output = {
            pathway: provider,
            examboard,
            qualification,
            days,
            weekCommencing,
            previousWeekCommencing,
            nextWeekCommencing,
            numberOfExamsThisWeek
        };

        return res.render('week', output);
    });

export default router;
