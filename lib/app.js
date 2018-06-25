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
    ExamDbDate = require('./date');

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

app.get('/',function (req, res) {
	res.redirect('/exams');
});

app.get('/status',function (req, res) {
    res.json({ app: npmPackage.name, version: npmPackage.version });
});

app.get('/search',function (req, res) {
    const todayRegex = /^today$/i,
          tomorrowRegex = /^tomorrow$/i;

    // 'query' IS MIGHTY INSECURE!!!
    var query = req.query.q,
        outParams = {};

    //magic keyword show's today's exams
    if (query == 'today') {
        let date = new ExamDbDate();
        query = date.examDbShortDateString();
    } else if (query == 'tomorrow') {
        let date = new ExamDbDate();
        date.setDate(date.getDate() + 1); //add 1 day
        query = date.examDbShortDateString();
    }

    var results = _.union(
        store.findProgrammesOfStudy(query),
        store.findQualifications(query),
        store.findExamboards(query),
        store.findCourses(query),
        store.findExams(query)
    );

    outParams.query = query;
    outParams.results = results;
    res.render('search', outParams);
});

app.get('/qualifications.json',function (req, res) {
    res.json(store.allQualifications());
});

app.get('/qualifications',function (req, res) {
    res.redirect('/');
});

app.get('/qualifications/:qualification.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/qualifications/:qualification',function (req, res) {
    var qual = store.qualification(req.params.qualification),
        outParams = {};

    if ( ! qual )
	   return res.status('404').send('qualification not found');

	outParams.qualification = qual;
	var qual_providers = store.providersOfQualification(qual.id);
	_.map(qual_providers, function(provider) { provider.e= store.examboard(provider.examboard); return provider });
	outParams.providers = qual_providers;
	res.render('qualification', outParams);
});

app.get('/pathways.json',function (req, res) {
    res.json(store.allProviders());
});

app.get('/pathways',function (req, res) {
    res.redirect('/');
});

app.get('/pathways/:pathway.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway',function (req, res) {
    var pathway = store.provider(req.params.pathway),
        outParams = {};

    if (! pathway )
         return res.status('404').send('pathway not found');

	var pathway_courses = store.coursesByProvider(pathway.id);

    var x = [];
    _.each(pathway_courses, function(course) {
        var y = _.clone(course);
        y.pos = store.programmeOfStudy(y.programmeofstudy);
        x.push(y)
    });
    outParams.pathway = pathway;
    outParams.courses = _.sortBy(x, function(course) { return course.pos.name} );
    outParams.examboard = store.examboard(pathway.examboard);
    outParams.qualification = store.qualification(pathway.qualification);
	res.render('pathway', outParams);

});

app.get('/pathways/:pathway/calendar.json',function (req, res) {
    res.status(501).json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway/calendar.ics',function (req, res) {
    res.status(501).send("not implemented");
});

app.get('/pathways/:pathway/calendar',function (req, res) {
    res.redirect('/pathways/' + req.params.pathway);
});

app.get('/pathways/:pathway/calendar/week.json',function (req, res) {
    res.status(501).json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway/calendar/week',function (req, res) {
    var pathway = store.provider(req.params.pathway),
        query = req.query.date;


    if (! pathway )
         return res.status('404').send('pathway not found');

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
    outParams.pathway = pathway;
    outParams.examboard = store.examboard(pathway.examboard);
    outParams.qualification = store.qualification(pathway.qualification);
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
    var course = store.course(req.params.course);

    if ( ! course )
        return res.status('404').json({status:404, message: 'course not found'});

    res.json(course);
});

app.get('/courses/:course',function (req, res) {
    var outParams = {};
    var course = store.course(req.params.course)

    if ( ! course )
        res.status('404').send('course not found');

    var course_exams = store.examsForCourse(course.id),
        provider = store.provider(course.provider),
        examboard = store.examboard(provider.examboard),
        qualification = store.qualification(provider.qualification),
        pos = store.programmeOfStudy(course.programmeofstudy);

    outParams.course = course;
    //date order
    outParams.exams = _.sortBy(course_exams, function(exam) { return exam.date.split('/').reverse().join('') } );
    outParams.provider = provider;
    outParams.examboard = examboard;
    outParams.qualification = qualification;
    outParams.programmeofstudy = pos;
    res.render('course', outParams);
});

app.get('/programmesofstudy.json',function (req, res) {
    res.json(store.allProgrammesOfStudy());
});

app.get('/programmesofstudy',function (req, res) {
    res.redirect('/');
});

app.get('/programmesofstudy/:programmeofstudy.json',function (req, res) {
    var programmeofstudy = store.programmeOfStudy(req.params.programmeofstudy);

    if (! programmeofstudy)
        return res.status('404').json({status:404, message: 'programme of study not found'});

    var exams = store.examsForProgrammeOfStudy(programmeofstudy.id);

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
    var programmeofstudy = store.programmeOfStudy(req.params.programmeofstudy);

    if (! programmeofstudy)
        return res.status('404').json({status:404, message: 'programme of study not found'});

    var exams = store.examsForProgrammeOfStudy(programmeofstudy.id);

    res.csv(exams, true);
});

app.get('/programmesofstudy/:programmeofstudy',function (req, res) {
    var programmeofstudy = store.programmeOfStudy(req.params.programmeofstudy),
        outParams = {};
    
    if (! programmeofstudy)
        return res.status('404').send('programme of study not found');

    var pos_courses = store.coursesByProgrammeOfStudy(programmeofstudy.id),
        qualification = store.qualification(programmeofstudy.qualification);

    _.map(pos_courses, function(course) {
            var provider = store.provider(course.provider);
            course.p = provider;
            course.e = store.examboard(provider.examboard);
            return course;
        });

    var exams = store.examsForProgrammeOfStudy(programmeofstudy.id);

    _.map(exams, function(exam) {
            var course = store.course(exam.course),
                provider = store.provider(course.provider),
                examboard = store.examboard(provider.examboard);
            exam.c = course;
            exam.p = provider;
            exam.e = examboard;
            return exam;
        });
    
    outParams.programmeofstudy = programmeofstudy;
    outParams.qualification = qualification;
    outParams.courses = pos_courses;
    outParams.exams = exams;
    res.render('programmeofstudy', outParams);
});

app.get('/exams.json',function (req, res) {
    store.allExams()
        .then(function(exams) {
            res.json(exams);
        })
        .catch(function() {
            res.status('500').json({status:500, message: 'error fetching exams data'});
        });
});

app.get('/exams',function (req, res) {
    var outParams = { qualifications: store.allQualifications() };
    res.render('examsindex', outParams);
});

app.get('/exams/import',function (req, res) {
    res.render('import');
});

app.post('/exams/upload',function (req, res) {

    if (!req.files)
        return res.status(400).json({status:400, message:'No files were uploaded.'});

    // The name of the input field is "file"
    let file = req.files.file;

    if (! file)
        return res.status(422).render('import',{status: 422, message: 'unprocessable entity; did you remember to upload the file?'});
//        return res.status(422).json({status: 422, message: 'unprocessable entity; did you remember to upload the file?'});

    if (file.mimetype != 'text/csv') {
        var errMessage = 'unprocessable entity; expected mimetype text/csv';
        return res.status(422).render('import', {status: 422, message: errMessage});
        //return res.status(422).json({status: 422, message: message});
    }

    if (file.truncated)
        return res.status(422).json({status: 422, message: 'unprocessable entity; too large'});

    var records = parse(file.data, {columns:true}, function(err, records) {

        if (err)
            return res.status(422).json({status: 422, message: 'unprocessable entity; can\'t read CSV data'});
        
        var recordsImported = _.chain(records)
                                .map(importRecord)
                                .reduce(function(memo, item) { return item==true ? memo+1 : memo }),
            successMessage = 'Upload successful. Imported '+recordsImported+' exam records from \''+ file.name+'\'.';

        res.status(200).render('import', {status: 200, message: successMessage});
        //res.json({status: 200, message: succcessMessage});

    });
});

app.get('/exams/:exam.json',function (req, res) {
    var exam = store.exam(req.params.exam);

    if ( ! exam )
        return res.status('404').json({status:404, message: 'exam not found'});

    res.json(exam);
});

app.get('/exams/:exam',function (req, res) {
    var exam = store.exam(req.params.exam),
        outParams = {};

    if ( ! exam )
        return res.status('404').send('exam not found');

    var course = store.course(exam.course),
        provider = store.provider(course.provider),
        examboard = store.examboard(provider.examboard),
        qualification = store.qualification(provider.qualification),
        pos = store.programmeOfStudy(course.programmeofstudy);

    outParams.exam = exam;
    outParams.course = course;
    outParams.provider = provider;
    outParams.examboard = examboard;
    outParams.qualification = qualification;
    outParams.programmeofstudy = pos;

    res.render('exam', outParams);
});

app.get('/examboards.json',function (req, res) {
    res.json(store.allExamboards());
});

app.get('/examboards',function (req, res) {
    res.redirect('/');
});

app.get('/examboards/:examboard.json',function (req, res) {
    var examboard = store.examboard(req.params.examboard)
    if ( ! examboard )
        return res.status('404').json({status:404, message: 'examboard not found'});

    res.json(examboard);
});

app.get('/examboards/:examboard',function (req, res) {
    var examboard = store.examboard(req.params.examboard),
        outParams = {};

    if ( ! examboard )
       return res.status('404').send('examboard not found');

    var exam_providers = store.providersByExamboard(examboard.id);

    _.map(exam_providers, function(provider) { provider.q = store.qualification(provider.qualification); return provider });
    outParams.examboard = examboard;
    outParams.providers = exam_providers;
    res.render('examboard', outParams);
});

app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send('internal server error');
})

// See: .ebextensions for NGINX rules which mean AWS ELB ignores this
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/library/jquery',  express.static( path.join(__dirname, '..', '/node_modules/jquery/dist')));
app.use('/library/jquery-tablesort',  express.static( path.join(__dirname, '..', '/node_modules/jquery-tablesort')));

module.exports = app;

