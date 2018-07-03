'use strict';

const express = require('express'),
    fileUpload = require('express-fileupload'),
    parse = require('csv-parse'),
    uuidv1 = require('uuid/v1'),
    app = express(),
    path = require('path'),
    npmPackage = require('../package'),
    _ = require('underscore'),
    storageEngine = process.env.STORAGE_ENGINE || 'memory',
    Store = require('./' + storageEngine + 'store'), //memorystyore, postgresstore
    store = new Store(), //instance
    csv = require('csv-express'),
    ExamDbDate = require('./date'),
    expressError = require('./express-error');

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/,
    yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;

function loadSampleData (store) {
    _.each([
        {id:'gcse', name:'GCSE'},
        {id:'gce', name:'GCE'},
        {id:'national-5', name:'National 5'},
        {id:'higher', name:'Higher'},
        {id:'advanced-higher', name:'Advanced Higher'},
        {id:'N-iseanta-5', name:'Nàiseanta 5'}
    ], store.addQualification, store);

    _.each([
        {id:'gcse-aqa', qualification: 'gcse', examboard: 'aqa'},
        {id:'gcse-edexcel', qualification: 'gcse', examboard: 'edexcel'},
        {id:'gcse-ocr', qualification: 'gcse', examboard: 'ocr'},
        {id:'gcse-eduqas', qualification: 'gcse', examboard: 'eduqas'},
        {id:'gcse-wjec', qualification: 'gcse', examboard: 'wjec'},
        {id:'gcse-cea', qualification: 'gcse', examboard: 'cea'},
        {id:'gce-aqa', qualification: 'gce', examboard: 'aqa'},
        {id:'gce-cea', qualification: 'gce', examboard: 'cea'}
    ], store.addProvider, store);

    _.each([
        {id:'aqa', name: 'AQA'},
        {id:'edexcel', name: 'EDEXCEL'},
        {id:'eduqas', name: 'EDUQAS'},
        {id:'cea', name: 'CEA'},
        {id:'ocr', name: 'OCR'},
        {id:'wjec', name: 'WJEC'},
        {id:'sqa', name: 'SQA'}
    ], store.addExamboard, store);

    _.each([
        {id:'gce-mathematics', name:'Mathematics', qualification: 'gce'},
        {id:'gce-english-language', name:'English Language', qualification: 'gce'},
        {id:'gce-english-literature', name:'English Literature', qualification: 'gce'},
        {id:'gcse-mathematics', name:'Mathematics', qualification: 'gcse', bitesize:'z38pycw'},
        {id:'gcse-english-language', name:'English Language', qualification: 'gcse'},
        {id:'gcse-english-literature', name:'English Literature', qualification: 'gcse'},
        {id:'gcse-further-mathematics', name:'Further Mathematics', qualification: 'gcse'},
        {id:'gcse-history', name:'History', qualification: 'gcse'},
        {id:'gcse-music', name: 'Music', qualification: 'gcse'},
        {id:'gcse-french', name: 'French', qualification: 'gcse'},
        {id:'gcse-german', name: 'German', qualification: 'gcse'},
        {id:'gcse-home-economics', name: 'Home Economics', qualification: 'gcse'}
    ], store.addProgrammeOfStudy, store);

    _.each([
        {id:'gcse-aqa-mathematics', provider: 'gcse-aqa', programmeofstudy:'gcse-mathematics', bitesize:'z8sg6fr'},
        {id:'gcse-aqa-english-language', provider: 'gcse-aqa', programmeofstudy:'gcse-english-language'},
        {id:'gcse-aqa-english-literature', provider: 'gcse-aqa', programmeofstudy:'gcse-english-literature'},
        {id:'gcse-aqa-history', provider: 'gcse-aqa', programmeofstudy:'gcse-history'},
        {id:'gcse-aqa-home-economics', provider: 'gcse-aqa', programmeofstudy:'gcse-home-economics'},
        {id:'gce-aqa-mathematics', provider: 'gce-aqa', programmeofstudy:'gce-mathematics'},
        {id:'gce-aqa-english-language', provider: 'gce-aqa', programmeofstudy:'gce-english-language'},
        {id:'gce-aqa-english-literature', provider: 'gce-aqa', programmeofstudy:'gce-english-literature'}
    ], store.addCourse, store);

    _.each([
        {id:'gce-aqa-mathematics', course:'gce-aqa-mathematics', paper: 'Mathematics', code: 'ALEVELM', date: '2018-07-23', timeofday: 'Morning', duration: '2h 15m', notes: ''},
        {id:'gce-aqa-english-language', course:'gce-aqa-english-language', paper: 'English Lang paper 1', code: 'ALEVELE', date: '2018-07-23', timeofday: 'Afternoon', duration: '2h', notes: ''},
        {id:'gcse-aqa-mathematics-unit-1', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 1 (Foundation & Higher)', code: 'A61UF', date: '2018-05-23', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-2', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 2 (Foundation & Higher)', code: 'A62UF', date: '2018-05-24', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-3', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 3 (Foundation & Higher)', code: 'A63UF', date: '2018-05-24', timeofday: 'Afternoon', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-4', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 4 (Foundation & Higher)', code: 'A64UF', date: '2018-05-25', timeofday: 'Morning', duration: '1h 45m', notes: 'F & H'},
        {id:'gcse-aqa-home-economics-z1', course:'gcse-aqa-home-economics', paper: 'Home Economics', code: 'GHE101', date: '2018/06/04', timeofday: 'Morning', duration: '1h', notes: ''}
    ], store.addExam, store);
};

loadSampleData(store);

function importRecord(record) {

    var examboard_name = record['Exam board'],
        examboard_id = examboard_name.toLowerCase();
    store.addExamboard({id:examboard_id, name: examboard_name});
    
    var qualification_name = record['Qualification'],
        qualification_id = qualification_name.toLowerCase().replace(/[^a-z0-9]/ig, '-');
    store.addQualification({id:qualification_id, name:qualification_name});

    var provider_id = qualification_id + '-' + examboard_id;
    store.addProvider({id:provider_id, qualification:qualification_id, examboard:examboard_id});

    var course_name_raw = record['Course'],
        course_name = course_name_raw.replace(/\n/g, ' '),
        course_stub = course_name_raw.toLowerCase().replace(/[^a-z0-9]/ig, '-'),
        course_id = qualification_id + '-' + examboard_id + '-' + course_stub,
        programmeofstudy_id = qualification_id + '-' + course_stub,
        bitesize_pos_id = record['POS'],
        bitesize_examspec_id = record['Exam spec'];
    store.addProgrammeOfStudy({id:programmeofstudy_id, name:course_name, qualification:qualification_id, bitesize:bitesize_pos_id});
    store.addCourse({id:course_id, provider:provider_id, programmeofstudy:programmeofstudy_id, bitesize:bitesize_examspec_id});

    var exam_id = uuidv1(),
        exam_code = record['Code'],
        exam_paper = record['Paper'],
        exam_notes = record['Notes'],
        exam_date = record['Date'],
        exam_timeofday = record['Morning/Afternoon'],
        exam_duration = record['Duration'];

    if (exam_date.match(ddmmyyyy)) {
        exam_date = exam_date.split('/').reverse().join('-');
    }

    if (exam_date.match(yyyymmdd)) { 
        exam_date = exam_date.replace(/\//, '-');
    }

    store.addExam({id:exam_id, course:course_id, code:exam_code, paper:exam_paper, notes:exam_notes, date:exam_date, timeofday:exam_timeofday, duration:exam_duration});

    //err, success
    return (null, true);
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(fileUpload());
app.use(expressError());

app.get('/',function (req, res) {
	res.redirect('/exams');
});

app.get('/status',function (req, res) {
    res.json({ app: npmPackage.name, version: npmPackage.version });
});

app.get('/search',function (req, res) {
    const todayRegex = /^today$/i,
          tomorrowRegex = /^tomorrow$/i,
          template = 'search';

    // 'query' IS MIGHTY INSECURE!!!
    var query = req.query.q,
        results,
        output;

    //magic keyword show's today's exams
    if (query == 'today') {
        let date = new ExamDbDate();
        query = date.examDbShortDateString();
    } else if (query == 'tomorrow') {
        let date = new ExamDbDate();
        date.setDate(date.getDate() + 1); //add 1 day
        query = date.examDbShortDateString();
    }

    results = _.union(
        store.findProgrammesOfStudy(query),
        store.findQualifications(query),
        store.findExamboards(query),
        store.findCourses(query),
        store.findExams(query)
    );
    output = {
        query: query,
        results: results
    };
    res.render(template, output);
});

app.get('/qualifications.json',function (req, res) {
    res.json(store.allQualifications());
});

app.get('/qualifications',function (req, res) {
    res.redirect('/');
});

app.get('/qualifications/:qualification.json',function (req, res) {
    res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.');
});

app.get('/qualifications/:qualification',function (req, res) {
    var qualificationId = req.params.qualification,
        qual = store.qualification(qualificationId),
        providers,
        inflateExamboard = (p) => { p.e = store.examboard(p.examboard); return p }, //p = 'provider'
        output;

    if ( ! qual )
        return res.error.html(404, `Qualification '${qualificationId}' was not found.`);

	providers = store.providersOfQualification(qual.id);
    output = {
        qualification:qual,
        providers:_.chain(providers).clone().map(inflateExamboard).value()
    };
	res.render('qualification', output);
});

app.get('/pathways.json',function (req, res) {
    res.json(store.allProviders());
});

app.get('/pathways',function (req, res) {
    res.redirect('/');
});

app.get('/pat;ways/:provider.json',function (req, res) {
    res.error.json(501,'JSON format not yet available. Please contact the developer for more information.');
});

app.get('/pathways/:provider',function (req, res) {
    var providerId = req.params.provider,
        provider = store.provider(providerId),
        courses,
        output,
        orderByPosName = (c) => { return c.pos.name }, // c = 'course'
        inflateProgrammeOfStudy = (c) => {c.pos = store.programmeOfStudy(c.programmeofstudy); return c};

    if (! provider)
        return res.error.html(404, `Provider '${providerId}' was not found.`);

	courses = store.coursesByProvider(provider.id);
    output = {
        pathway: provider,
        courses: _.chain(courses).clone().map(inflateProgrammeOfStudy).sortBy(orderByPosName).value(),
        examboard: store.examboard(provider.examboard),
        qualification: store.qualification(provider.qualification)
    }

	res.render('pathway', output);

});

app.get('/pathways/:provider/calendar.json',function (req, res) {
    res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.');
});

app.get('/pathways/:provider/calendar.ics',function (req, res) {
    res.error.text(501, 'ICS format not yet available.  Please contact the developer for more information.');
});

app.get('/pathways/:provider/calendar',function (req, res) {
    res.redirect('/pathways/' + req.params.provider);
});

app.get('/pathways/:pathway/calendar/week.json',function (req, res) {
    res.error.json(501, 'JSON format not yet available. Please contact the developer for more information.');
});

app.get('/pathways/:provider/calendar/week',function (req, res) {
    var provider = store.provider(req.params.provider),
        query = req.query.date;


    if (! provider )
         return res.error.html(404, 'pathway not found');

    //show this week if no date is specified
    if (! query) {
        let today = new ExamDbDate();
        query = today.examDbShortDateString();
    }

    var queryDate = new ExamDbDate(query);


    var queryDayOfWeek = queryDate.getDay();

    // days 1..5 == Mon..Fri
    var weekDays = [1,2,3,4,5].map(offset => {
        let date = queryDate.clone();
        date.setDate(date.getDate() - queryDayOfWeek + offset); //offset compared to which day of the week today is
        return date;
    });

    var days = weekDays.map(date => {
        var dateString = date.examDbShortDateString(),
            morningExams = store.morningExams(dateString),
            afternoonExams = store.afternoonExams(dateString),
            active = (date.examDbShortDateString() == queryDate.examDbShortDateString());

        return {
            date:date.examDbLongDateString(),
            dateShort:date.examDbShortDateString(),
            active:active,
            morning_exams:morningExams,
            afternoon_exams:afternoonExams
        };
    });

    var monday = weekDays[0];

    var outParams = {};
    outParams.pathway = provider;
    outParams.examboard = store.examboard(provider.examboard);
    outParams.qualification = store.qualification(provider.qualification);
    outParams.days = days;
    outParams.weekCommencing = monday.examDbLongDateString();
    outParams.previousWeekCommencing = monday.thisDayLastWeek().examDbShortDateString();
    outParams.nextWeekCommencing = monday.thisDayNextWeek().examDbShortDateString();
    outParams.numberOfExamsThisWeek =
         _.chain(days)
        .map(function(day) { return day.morning_exams.length + day.afternoon_exams.length })
        .reduce(function(memo, num) { return memo + num }, 0)
        .value();

    res.render('week', outParams);
});

app.get('/courses.json',function (req, res) {
    res.json(store.allCourses());
});

app.get('/courses',function (req, res) {
    res.redirect('/');
});

app.get('/courses/:course.json',function (req, res) {
    var courseId = req.params.course,
        course = store.course(courseId);

    if ( ! course )
        return res.error.json(404, `Course '${courseId}' was not found.`);

    res.json(course);
});

app.get('/courses/:course',function (req, res) {
    var courseId = req.params.course,
        course = store.course(courseId),
        dateOrder = (exam) => { return exam.date.split('/').reverse().join('') }, //this is WRONG
        course_exams,
        provider,
        examboard,
        qualification,
        pos,
        output;

    if ( ! course )
        return res.error.html(404, `Course '${courseId}' was not found.`);

    course_exams = store.examsForCourse(course.id);
    provider = store.provider(course.provider);
    examboard = store.examboard(provider.examboard);
    qualification = store.qualification(provider.qualification);
    pos = store.programmeOfStudy(course.programmeofstudy);
    output = {
        course:course,
        exams:_.sortBy(course_exams, dateOrder),
        provider:provider,
        examboard:examboard,
        qualification:qualification,
        programmeofstudy:pos
    }
    res.render('course', output);
});

app.get('/programmesofstudy.json',function (req, res) {
    res.json(store.allProgrammesOfStudy());
});

app.get('/programmesofstudy',function (req, res) {
    res.redirect('/');
});

app.get('/programmesofstudy/:programmeofstudy.json',function (req, res) {
    var programmeofstudyId = req.params.programmeofstudy,
        programmeofstudy = store.programmeOfStudy(programmeofstudyId),
        exams;

    if (! programmeofstudy)
        return res.error.json(404, `Programme of study '${programmeofstudyId}' was not found.`);

    exams = store.examsForProgrammeOfStudy(programmeofstudy.id);
    _.map(exams, function(exam) {
            var course = store.course(exam.course),
                provider = store.provider(course.provider),
                examboard = store.examboard(provider.examboard);
            exam.c = course;
            exam.p = provider;
            exam.e = examboard;
            return exam;
        });

    res.json({
        programmeOfStudy:programmeofstudy,
        exams:exams
    });
});

app.get('/programmesofstudy/:programmeofstudy.csv',function (req, res) {
    var programmeofstudyId = req.params.programmeofstudy,
        programmeofstudy = store.programmeOfStudy(programmeofstudyId),
        exams;

    if (! programmeofstudy)
        return res.error.text(404, `Programme of study '${programmeofstudyId}' was not found.`);

    exams = store.examsForProgrammeOfStudy(programmeofstudy.id);
    res.csv(exams, true);
});

app.get('/programmesofstudy/:programmeofstudy',function (req, res) {
    var programmeofstudyId = req.params.programmeofstudy,
        programmeofstudy = store.programmeOfStudy(programmeofstudyId),
        courses,
        qualification,
        exams,
        output;

    if (! programmeofstudy)
        return res.error.html(404, `Programme of study '${programmeofstudyId}' was not found.`);

    courses = store.coursesByProgrammeOfStudy(programmeofstudy.id);
    qualification = store.qualification(programmeofstudy.qualification);

    _.map(courses, function(course) {
            var provider = store.provider(course.provider),
                examboard = store.examboard(provider.examboard);
            course.p = provider;
            course.e = examboard;
            return course;
        });

    exams = store.examsForProgrammeOfStudy(programmeofstudy.id);

    _.map(exams, function(exam) {
            var course = store.course(exam.course),
                provider = store.provider(course.provider),
                examboard = store.examboard(provider.examboard);
            exam.c = course;
            exam.p = provider;
            exam.e = examboard;
            return exam;
        });
    
    output = {
        programmeofstudy: programmeofstudy,
        qualification: qualification,
        courses: courses,
        exams: exams
    }
    res.render('programmeofstudy', output);
});

app.get('/exams.json',function (req, res) {
    const
        renderJSONObject = (exams) => { res.json(exams) },
        renderJsonErrorObject = () =>{ res.error.json(500, 'Cannot fetch exams data.') };

    let exams = store.allExams();

    Promise.resolve(exams)
        .then(renderJSONObject)
        .catch(renderJsonErrorObject);
});

app.get('/exams',function (req, res) {
    const
        template = 'examsindex',
        renderExamsIndexTemplate = (qualifications) => {
            let output = {qualifications:qualifications};
            res.render(template, output);
        },
        renderErrorTemplate = () =>{ res.render(template, {}); };

    let qualifications = store.allQualifications();

    Promise.resolve(qualifications)
        .then(renderExamsIndexTemplate)
        .catch(renderErrorTemplate);
});

app.get('/exams/import',function (req, res) {
    res.render('import');
});

app.post('/exams/upload',function (req, res) {
    const
        template = 'import',
        sumIfTrue = (memo, item) => { return item==true ? memo+1 : memo };

    var file;
    
    if (!req.files)
        return res.error.html(400, 'No files were uploaded.', template);

    // The name of the input field is "file"
    file = req.files.file;

    if (! file)
        return res.error.html(422, 'Did you remember to upload the file?', template);

    if (file.mimetype != 'text/csv')
        return res.error.html(422, 'Expected mimetype text/csv', template);

    if (file.truncated)
        return res.error.html(422, 'Too large', template);

    parse(file.data, {columns:true}, function(err, records) {
        var recordsImported,
            successMessage;

        if (err)
            return res.error.html(422, 'Can\'t read CSV data', template);
        
        recordsImported = _.chain(records).map(importRecord).reduce(sumIfTrue).value();
        successMessage = `Upload successful. Imported ${recordsImported} exam records from \'${file.name}\'.`;
        res.error.html(200, successMessage, template);

    });
});

app.get('/exams/:exam.json',function (req, res) {
    var examId = req.params.exam,
        exam = store.exam(examId);

    if ( ! exam )
        return res.error.json(404, 'The exam \''+examId+'\' was not found.');

    res.json(exam);
});

app.get('/exams/:exam',function (req, res) {
    var examId = req.params.exam,
        exam = store.exam(examId),
        course,
        provider,
        examboard,
        qualification,
        pos,
        output;

    if ( ! exam )
        return res.error.html(404, 'The exam \''+examId+'\' was not found.');

    course = store.course(exam.course);
    provider = store.provider(course.provider);
    examboard = store.examboard(provider.examboard);
    qualification = store.qualification(provider.qualification);
    pos = store.programmeOfStudy(course.programmeofstudy);
    output = {
        exam:exam,
        course:course,
        provider:provider,
        examboard:examboard,
        qualification:qualification,
        programmeofstudy:pos
    };

    res.render('exam', output);
});

app.get('/examboards.json',function (req, res) {
    res.json(store.allExamboards());
});

app.get('/examboards',function (req, res) {
    res.redirect('/');
});

app.get('/examboards/:examboard.json',function (req, res) {
    var examboardId = req.params.examboard,
        examboard = store.examboard(examboardId);

    if ( ! examboard )
        return res.error.json(404,`Exam board '${examboardId}' was not found.`);

    res.json(examboard);
});

app.get('/examboards/:examboard',function (req, res) {
    var examboardId = req.params.examboard,
        examboard = store.examboard(examboardId),
        exam_providers,
        exam_providers_inflated,
        output,
        inflateQualification = (p) => { p.q = store.qualification(p.qualification); return p };

    if ( ! examboard )
        return res.error.html(404, `Exam board '${examboardId}' was not found.`);

    exam_providers = store.providersByExamboard(examboard.id);
    exam_providers_inflated = _.chain(exam_providers).map(inflateQualification).value();
    output = {
        examboard:examboard,
        providers:exam_providers_inflated
    };

    res.render('examboard', output);
});

// Do logging and user-friendly error message display
app.use(function(err, req, res, next) {
  console.error(err);
  res.send('internal server error');
  next();
})

// See: .ebextensions for NGINX rules which mean AWS ELB ignores this
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/library/jquery',  express.static( path.join(__dirname, '..', '/node_modules/jquery/dist')));
app.use('/library/jquery-tablesort',  express.static( path.join(__dirname, '..', '/node_modules/jquery-tablesort')));

module.exports = app;

