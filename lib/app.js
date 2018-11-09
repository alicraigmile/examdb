import express from 'express';
import fileUpload from 'express-fileupload';
import parse from 'csv-parse';
import uuidv1 from 'uuid/v1';
import path from 'path';
import 'csv-express';
import _ from 'underscore';
import ExamDbDate from './date';
import expressError from './express-error';
import npmPackage from '../package';
import Store from './memorystore'; // memorystore, postgresstore
// import models from '../models';

const app = express();
const store = new Store(); // instance

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;

function importRecord(record) {
    const examboardName = record['Exam board'];
    const examboardId = examboardName.toLowerCase();
    store.addExamboard({ id: examboardId, name: examboardName });

    const qualificationName = record.Qualification;
    const qualificationId = qualificationName.toLowerCase().replace(/[^a-z0-9]/gi, '-');
    store.addQualification({ id: qualificationId, name: qualificationName });

    const providerId = `${qualificationId}-${examboardId}`;
    store.addProvider({ id: providerId, qualification: qualificationId, examboard: examboardId });

    const courseNameRaw = record.Course;
    const courseName = courseNameRaw.replace(/\n/g, ' ');
    const courseStub = courseNameRaw.toLowerCase().replace(/[^a-z0-9]/gi, '-');
    const courseId = `${qualificationId}-${examboardId}-${courseStub}`;
    const programmeofstudyId = `${qualificationId}-${courseStub}`;
    const bitesizePosId = record.POS;
    const bitesizeExamspecId = record['Exam spec'];

    store.addProgrammeOfStudy({
        id: programmeofstudyId,
        name: courseName,
        qualification: qualificationId,
        bitesize: bitesizePosId
    });

    store.addCourse({
        id: courseId,
        provider: providerId,
        programmeofstudy: programmeofstudyId,
        bitesize: bitesizeExamspecId
    });

    const examId = uuidv1();
    const examCode = record.Code;
    const examPaper = record.Paper;
    const examNotes = record.Notes;
    let examDate = record.Date;
    const examTimeOfDay = record['Morning/Afternoon'];
    const examDuration = record.Duration;

    if (examDate.match(ddmmyyyy)) {
        examDate = examDate
            .split('/')
            .reverse()
            .join('-');
    }

    if (examDate.match(yyyymmdd)) {
        examDate = examDate.replace(/\//, '-');
    }

    store.addExam({
        id: examId,
        course: courseId,
        code: examCode,
        paper: examPaper,
        notes: examNotes,
        date: examDate,
        timeOfDay: examTimeOfDay,
        duration: examDuration
    });

    // err, success
    return [null, true];
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(fileUpload());
app.use(expressError());

app.get('/', (req, res) => res.redirect('/exams'));

app.get('/status', (req, res) => {
    const { name, version } = npmPackage;
    return res.json({ app: name, version });
});

app.get('/search', (req, res) => {
    // 'query' IS MIGHTY INSECURE!!!
    let query = req.query.q;

    const todayRegex = /^today$/i;
    const tomorrowRegex = /^tomorrow$/i;
    const template = 'search';

    const isToday = query.match(todayRegex);
    const isTomorrow = query.match(tomorrowRegex);

    // magic keyword show's today's exams
    if (isToday) {
        const date = new ExamDbDate();
        query = date.examDbShortDateString();
    } else if (isTomorrow) {
        const date = new ExamDbDate();
        date.setDate(date.getDate() + 1); // add 1 day
        query = date.examDbShortDateString();
    }

    const results = _.union(
        store.findProgrammesOfStudy(query),
        store.findQualifications(query),
        store.findExamboards(query),
        store.findCourses(query),
        store.findExams(query)
    );

    const output = { query, results };
    res.render(template, output);
});

app.get('/qualifications.json', (req, res) => res.json(store.allQualifications()));

app.get('/qualifications', (req, res) => res.redirect('/'));

app.get('/qualifications/:qualification.json', (req, res) =>
    res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
);

app.get('/qualifications/:qualification', (req, res) => {
    const qualificationId = req.params.qualification;
    const qualification = store.qualification(qualificationId);
    const inflateExamboard = p => {
        p.e = store.examboard(p.examboard);
        return p;
    }; // p = 'provider'

    if (!qualification) return res.error.html(404, `Qualification '${qualificationId}' was not found.`);

    const qualificationProviders = store.providersOfQualification(qualification.id);
    const providers = _.chain(qualificationProviders)
        .clone()
        .map(inflateExamboard)
        .value();

    const output = { qualification, providers };
    return res.render('qualification', output);
});

app.get('/pathways.json', (req, res) => res.json(store.allProviders()));

app.get('/pathways', (req, res) => res.redirect('/'));

app.get('/pathways/:provider.json', (req, res) =>
    res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
);

app.get('/pathways/:provider', (req, res) => {
    const providerId = req.params.provider;
    const provider = store.provider(providerId);
    const orderByPosName = c => c.pos.name; // c = 'course'
    const inflateProgrammeOfStudy = c => {
        c.pos = store.programmeOfStudy(c.programmeofstudy);
        return c;
    };

    if (!provider) return res.error.html(404, `Provider '${providerId}' was not found.`);

    const providerCourses = store.coursesByProvider(provider.id);
    const courses = _.chain(providerCourses)
        .clone()
        .map(inflateProgrammeOfStudy)
        .sortBy(orderByPosName)
        .value();
    const examboard = store.examboard(provider.examboard);
    const qualification = store.qualification(provider.qualification);

    return res.render('pathway', { pathway: provider, courses, examboard, qualification });
});

app.get('/pathways/:provider/calendar.json', (req, res) =>
    res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
);

app.get('/pathways/:provider/calendar.ics', (req, res) =>
    res.error.text(501, 'ICS format not yet available.  Please contact the developer for more information.')
);

app.get('/pathways/:provider/calendar', (req, res) => res.redirect(`/pathways/${req.params.provider}`));

app.get('/pathways/:pathway/calendar/week.json', (req, res) =>
    res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.')
);

app.get('/pathways/:provider/calendar/week', (req, res) => {
    const providerId = req.params.provider;
    const provider = store.provider(providerId);
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
        const morningExams = store.morningExams(dateString);
        const afternoonExams = store.afternoonExams(dateString);
        const active = date.examDbShortDateString() === queryDate.examDbShortDateString();

        return { date: dateString, dateShort, active, morningExams, afternoonExams };
    });

    const monday = weekDays[0];

    const examboard = store.examboard(provider.examboard);
    const qualification = store.qualification(provider.qualification);
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

app.get('/courses.json', (req, res) => res.json(store.allCourses()));

app.get('/courses', (req, res) => {
    res.redirect('/');
});

app.get('/courses/:course.json', (req, res) => {
    const courseId = req.params.course;
    const course = store.course(courseId);

    if (!course) return res.error.json(404, `Course '${courseId}' was not found.`);

    return res.json(course);
});

app.get('/courses/:course', (req, res) => {
    const courseId = req.params.course;
    const course = store.course(courseId);
    const dateOrder = exam =>
        exam.date
            .split('/')
            .reverse()
            .join(''); // this is WRONG

    if (!course) return res.error.html(404, `Course '${courseId}' was not found.`);

    const courseExams = store.examsForCourse(course.id);
    const provider = store.provider(course.provider);
    const examboard = store.examboard(provider.examboard);
    const qualification = store.qualification(provider.qualification);
    const programmeOfStudy = store.programmeOfStudy(course.programmeofstudy);
    const exams = _.sortBy(courseExams, dateOrder);
    const output = { course, exams, provider, examboard, qualification, programmeOfStudy };

    return res.render('course', output);
});

app.get('/programmesofstudy.json', (req, res) => res.json(store.allProgrammesOfStudy()));

app.get('/programmesofstudy', (req, res) => res.redirect('/'));

app.get('/programmesofstudy/:programmeofstudy.json', (req, res) => {
    const programmeOfStudyId = req.params.programmeofstudy;
    const programmeOfStudy = store.programmeOfStudy(programmeOfStudyId);

    if (!programmeOfStudy) return res.error.json(404, `Programme of study '${programmeOfStudyId}' was not found.`);

    const exams = store.examsForProgrammeOfStudy(programmeOfStudy.id);
    _.map(exams, exam => {
        const course = store.course(exam.course);
        const provider = store.provider(course.provider);
        const examboard = store.examboard(provider.examboard);
        exam.c = course;
        exam.p = provider;
        exam.e = examboard;
        return exam;
    });

    return res.json({ programmeOfStudy, exams });
});

app.get('/programmesofstudy/:programmeofstudy.csv', (req, res) => {
    const programmeofstudyId = req.params.programmeofstudy;
    const programmeofstudy = store.programmeOfStudy(programmeofstudyId);

    if (!programmeofstudy) return res.error.text(404, `Programme of study '${programmeofstudyId}' was not found.`);

    const exams = store.examsForProgrammeOfStudy(programmeofstudy.id);
    return res.csv(exams, true);
});

app.get('/programmesofstudy/:programmeofstudy', (req, res) => {
    const programmeOfStudyId = req.params.programmeofstudy;
    const programmeOfStudy = store.programmeOfStudy(programmeOfStudyId);

    if (!programmeOfStudy) return res.error.html(404, `Programme of study '${programmeOfStudyId}' was not found.`);

    const courses = store.coursesByProgrammeOfStudy(programmeOfStudy.id);
    const qualification = store.qualification(programmeOfStudy.qualification);

    _.map(courses, course => {
        const provider = store.provider(course.provider);
        const examboard = store.examboard(provider.examboard);
        course.p = provider;
        course.e = examboard;
        return course;
    });

    const exams = store.examsForProgrammeOfStudy(programmeOfStudy.id);

    _.map(exams, exam => {
        const course = store.course(exam.course);
        const provider = store.provider(course.provider);
        const examboard = store.examboard(provider.examboard);
        exam.c = course;
        exam.p = provider;
        exam.e = examboard;
        return exam;
    });

    return res.render('programmeofstudy', { programmeOfStudy, qualification, courses, exams });
});

app.get('/exams.json', (req, res) => {
    const renderJSONObject = exams => res.json(exams);
    const renderJsonErrorObject = () => res.error.json(500, 'Cannot fetch exams data.');

    const exams = store.allExams();

    Promise.resolve(exams)
        .then(renderJSONObject)
        .catch(renderJsonErrorObject);
});

app.get('/exams', (req, res, next) => {
    const template = 'examsindex';
    const renderExamsIndexTemplate = qualifications => res.render(template, { qualifications });
    const renderErrorTemplate = () => {
        res.render(template, {});
    };
    const qualifications = store.allQualifications();

    Promise.resolve(qualifications)
        .then(renderExamsIndexTemplate)
        .catch(renderErrorTemplate);

    return next();
});

app.get('/exams/import', (req, res) => res.render('import'));

app.post('/exams/upload', (req, res, next) => {
    const template = 'import';
    const sumIfTrue = (memo, item) => (item === true ? memo + 1 : memo);

    if (!req.files) return res.error.html(400, 'No files were uploaded.', template);

    // The name of the input field is "file"
    const { file } = req.files.file;

    if (!file) return res.error.html(422, 'Did you remember to upload the file?', template);

    if (file.mimetype !== 'text/csv') return res.error.html(422, 'Expected mimetype text/csv', template);

    if (file.truncated) return res.error.html(422, 'Too large', template);

    parse(file.data, { columns: true }, (err, records) => {
        if (err) return res.error.html(422, "Can't read CSV data", template);

        const recordsImported = _.chain(records)
            .map(importRecord)
            .reduce(sumIfTrue)
            .value();
        const successMessage = `Upload successful. Imported ${recordsImported} exam records from '${file.name}'.`;
        return res.error.html(200, successMessage, template);
    });
    return next();
});

app.get('/exams/:exam.json', (req, res) => {
    const examId = req.params.exam;
    const exam = store.exam(examId);

    if (!exam) return res.error.json(404, `The exam '${examId}' was not found.`);

    return res.json(exam);
});

app.get('/exams/:exam', (req, res) => {
    const examId = req.params.exam;
    const exam = store.exam(examId);

    if (!exam) return res.error.html(404, `The exam '${examId}' was not found.`);

    const course = store.course(exam.course);
    const provider = store.provider(course.provider);
    const examboard = store.examboard(provider.examboard);
    const qualification = store.qualification(provider.qualification);
    const programmeOfStudy = store.programmeOfStudy(course.programmeofstudy);
    const output = { exam, course, provider, examboard, qualification, programmeOfStudy };

    return res.render('exam', output);
});

app.get('/examboards.json', (req, res) => res.json(store.allExamboards()));

app.get('/examboards', (req, res) => res.redirect('/'));

app.get('/examboards/:examboard.json', (req, res) => {
    const examboardId = req.params.examboard;
    const examboard = store.examboard(examboardId);

    if (!examboard) return res.error.json(404, `Exam board '${examboardId}' was not found.`);

    return res.json(examboard);
});

app.get('/examboards/:examboard', (req, res) => {
    const examboardId = req.params.examboard;
    const examboard = store.examboard(examboardId);
    const inflateQualification = p => {
        p.q = store.qualification(p.qualification);
        return p;
    };

    if (!examboard) return res.error.html(404, `Exam board '${examboardId}' was not found.`);

    const examProviders = store.providersByExamboard(examboard.id);
    const providers = _.chain(examProviders)
        .map(inflateQualification)
        .value();
    const output = { examboard, providers };

    return res.render('examboard', output);
});

// Do logging and user-friendly error message display
app.use((err, req, res, next) => {
    // console.error(err);
    res.send('internal server error');
    next();
});

// See: .ebextensions for NGINX rules which mean AWS ELB ignores this
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/library/jquery', express.static(path.join(__dirname, '..', '/node_modules/jquery/dist')));
app.use('/library/jquery-tablesort', express.static(path.join(__dirname, '..', '/node_modules/jquery-tablesort')));

export default app;
