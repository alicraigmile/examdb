var express = require('express'),
    fileUpload = require('express-fileupload'),
    parse = require('csv-parse'),
    uuidv1 = require('uuid/v1'),
    app = express(),
    path = require('path'),
    package = require('../package'),
    _ = require('underscore');

var qualifications = [
    	{id:'gcse', name:'GCSE'},
    	{id:'gce', name:'GCE'},
    	{id:'national-5', name:'National 5'},
    	{id:'higher', name:'Higher'},
    	{id:'advanced-higher', name:'Advanced Higher'}
    ],
    providers = [
    	{id:'gcse-aqa', qualification: 'gcse', examboard: 'aqa'},
    	{id:'gcse-edexcel', qualification: 'gcse', examboard: 'edexcel'},
    	{id:'gcse-ocr', qualification: 'gcse', examboard: 'ocr'},
    	{id:'gcse-eduqas', qualification: 'gcse', examboard: 'eduqas'},
    	{id:'gcse-wjec', qualification: 'gcse', examboard: 'wjec'},
    	{id:'gcse-cea', qualification: 'gcse', examboard: 'cea'},
    	{id:'gce-aqa', qualification: 'gce', examboard: 'aqa'},
    	{id:'gce-cea', qualification: 'gce', examboard: 'cea'}
    ],
    examboards = [
    	{id:'aqa', name: 'AQA'},
    	{id:'edexcel', name: 'EDEXCEL'},
    	{id:'eduqas', name: 'EDUQAS'},
    	{id:'cea', name: 'CEA'},
    	{id:'ocr', name: 'OCR'},
    	{id:'wjec', name: 'WJEC'},
    	{id:'sqa', name: 'SQA'}
    ],
    programmesofstudy = [
    	{id:'gce-mathematics', name:'Mathematics', qualification: 'gce'},
    	{id:'gce-english-language', name:'English Language', qualification: 'gce'},
    	{id:'gce-english-literature', name:'English Literature', qualification: 'gce'},
    	{id:'gcse-mathematics', name:'Mathematics', qualification: 'gcse'},
    	{id:'gcse-english-language', name:'English Language', qualification: 'gcse'},
    	{id:'gcse-english-literature', name:'English Literature', qualification: 'gcse'},
    	{id:'gcse-further-mathematics', name:'Further Mathematics', qualification: 'gcse'},
    	{id:'gcse-history', name:'History', qualification: 'gcse'},
    	{id:'gcse-music', name: 'Music', qualification: 'gcse'},
    	{id:'gcse-french', name: 'French', qualification: 'gcse'},
    	{id:'gcse-german', name: 'German', qualification: 'gcse'},
    	{id:'gcse-home-economics', name: 'Home Economics', qualification: 'gcse'}
    ],
    courses = [
        {id:'gcse-aqa-mathematics', provider: 'gcse-aqa', programmeofstudy:'gcse-mathematics'},
        {id:'gcse-aqa-english-language', provider: 'gcse-aqa', programmeofstudy:'gcse-english-language'},
        {id:'gcse-aqa-english-literature', provider: 'gcse-aqa', programmeofstudy:'gcse-english-literature'},
        {id:'gcse-aqa-history', provider: 'gcse-aqa', programmeofstudy:'gcse-history'},
        {id:'gcse-aqa-home-economics', provider: 'gcse-aqa', programmeofstudy:'gcse-home-economics'},
        {id:'gce-aqa-mathematics', provider: 'gce-aqa', programmeofstudy:'gce-mathematics'},
        {id:'gce-aqa-english-language', provider: 'gce-aqa', programmeofstudy:'gce-english-language'},
        {id:'gce-aqa-english-literature', provider: 'gce-aqa', programmeofstudy:'gce-english-literature'}
    ],
    exams = [
        {id:'gce-aqa-mathematics', course:'gce-aqa-mathematics', paper: 'Mathematics', code: 'ALEVELM', date: '2018-07-23', timeofday: 'Morning', duration: '2h 15m', notes: ''},
        {id:'gce-aqa-english-language', course:'gce-aqa-english-language', paper: 'English Lang paper 1', code: 'ALEVELE', date: '2018-07-23', timeofday: 'Afternoon', duration: '2h', notes: ''},
        {id:'gcse-aqa-mathematics-unit-1', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 1 (Foundation & Higher)', code: 'A61UF', date: '2018-05-23', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-2', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 2 (Foundation & Higher)', code: 'A62UF', date: '2018-05-24', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-3', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 3 (Foundation & Higher)', code: 'A63UF', date: '2018-05-24', timeofday: 'Afternoon', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-4', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 4 (Foundation & Higher)', code: 'A64UF', date: '2018-05-25', timeofday: 'Morning', duration: '1h 45m', notes: 'F & H'},
        {id:'gcse-aqa-home-economics-z1', course:'gcse-aqa-home-economics', paper: 'Home Economics', code: 'GHE101', date: '2018-06-04', timeofday: 'Morning', duration: '1h', notes: ''}
    ];

function importRecord(record) {

    var examboard_name = record['Exam board'],
        examboard_id = examboard_name.toLowerCase();
    addExamboard({id:examboard_id, name: examboard_name});
    
    var qualification_name = record['Qualification'],
        qualification_id = qualification_name.toLowerCase().replace(/[^a-z0-9]/ig, '-');
    addQualification({id:qualification_id, name:qualification_name});

    var provider_id = qualification_id + '-' + examboard_id;
    addProvider({id:provider_id, qualification:qualification_id, examboard:examboard_id});

    var course_name_raw = record['Course'],
        course_name = course_name_raw.replace(/\n/g, ' '),
        course_stub = course_name_raw.toLowerCase().replace(/[^a-z0-9]/ig, '-'),
        course_id = qualification_id + '-' + examboard_id + '-' + course_stub,
        programmeofstudy_id = qualification_id + '-' + course_stub;
    addProgrammeOfStudy({id:programmeofstudy_id, name:course_name, qualification:qualification_id});
    addCourse({id:course_id, provider:provider_id, programmeofstudy:programmeofstudy_id});

    var exam_id = uuidv1(),
        exam_code = record['Code'],
        exam_paper = record['Paper'],
        exam_notes = record['Notes'],
        exam_date = record['Date'],
        exam_timeofday = record['Morning/Afternoon'],
        exam_duration = record['Duration'];
    addExam({id:exam_id, course:course_id, code:exam_code, paper:exam_paper, notes:exam_notes, date:exam_date, timeofday:exam_timeofday, duration:exam_duration});
}


const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

class ExamDbDate extends Date {
    constructor(dateString) {
        if (dateString) {
            return super(dateString);
        } else {
            return super();
        }
    }

    clone() { 
        let date = this;
        return new ExamDbDate(date);
    }

    examDbShortDateString() { 
        let date = this,
        dateString = date.toISOString().slice(0,10);
        return dateString;
    }

    examDbLongDateString() {
        let date = this,
            dateString = [
            date.nameOfDayOfWeek(),
            date.getDate(),
            date.nameOfMonth()
        ].join(' ');
        return dateString;
    }

    nameOfDayOfWeek() {
        let date = this,
            dayOfWeek = date.getDay();    
        return isNaN(dayOfWeek) ? null : dayNames[dayOfWeek];
    }

    nameOfMonth() {
        let date = this,
            month = date.getMonth();    
        return isNaN(month) ? null : monthNames[month];
    }

    thisDayLastWeek() {
        let date = this.clone();
        date.setDate(this.getDate() - 7);
        return date;
    }

    thisDayNextWeek() {
        let date = this.clone();
        date.setDate(this.getDate() + 7);
        return date;
    }

}

function addExamboard(examboard) {
    if (! _.findWhere(examboards, {id:examboard.id}))
        examboards.push(examboard);
}

function addQualification(qualification) {
    if (! _.findWhere(qualifications, {id:qualification.id}))
        qualifications.push(qualification);
}

function addProvider(provider) {
    if (! _.findWhere(providers, {id:provider.id}))
        providers.push(provider);
}

function addProgrammeOfStudy(pos) {
    if (! _.findWhere(programmesofstudy, {id:pos.id}))
        programmesofstudy.push(pos);
}

function addCourse(course) {
    if (! _.findWhere(courses, {id:course.id}))
        courses.push(course);
}

function addExam(exam) {
    if (! _.findWhere(exams, {id:exam.id}))
        exams.push(exam);
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(fileUpload());

app.get('/',function (req, res) {
	res.redirect('/exams');
});

app.get('/status',function (req, res) {
    res.json({ app: package.name, version: package.version });
});

app.get('/search',function (req, res) {
    // 'query' IS MIGHTY INSECURE!!!
    var query = req.query.q,
        outParams = {};

    //magic keyword show's today's exams
    if (query == 'today') {
        let date = new ExamDbDate();
        date = date.examDbShortDateString();
        query = date;
    }

    var results = [];

    _.chain(programmesofstudy)
        .where({name:query})
        .clone()
        .map(function(i){i.isProgrammeOfStudy=1; return i})
        .each(function(i){ results.push(i) });

    _.chain(qualifications)
        .where({name:query})
        .clone()
        .map(function(i){i.isQualification=1; return i})
        .each(function(i){ results.push(i) });

    _.chain(examboards)
        .where({name:query})
        .clone()
        .map(function(i){i.isExamBoard=1; return i})
        .each(function(i){ results.push(i) });

    _.chain(exams)
        .where({date:query})
        .clone()
        .map(function(i){i.isExam=1; return i})
        .each(function(i){ results.push(i) });


    outParams.query = query;
    outParams.results = results;
    res.render('search', outParams);
});

app.get('/qualifications.json',function (req, res) {
    res.json(qualifications);
});

app.get('/qualifications',function (req, res) {
    res.redirect('/');
});

app.get('/qualifications/:qualification.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/qualifications/:qualification',function (req, res) {
    var qual = _.findWhere(qualifications, {id: req.params.qualification}),
        outParams = {};

    if ( ! qual ) {
	   res.status('404').send('qualification not found');
    } else {
    	outParams.qualification = qual;
    	var qual_providers = _.filter(providers, {qualification: qual.id});
    	_.map(qual_providers, function(provider) { provider.e= _.findWhere(examboards, {id: provider.examboard}); return provider });
    	outParams.providers = qual_providers;
    	res.render('qualification', outParams);
    }

});

app.get('/pathways.json',function (req, res) {
    res.json(providers);
});

app.get('/pathways',function (req, res) {
    res.redirect('/');
});

app.get('/pathways/:pathway.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway',function (req, res) {
    var pathway = _.findWhere(providers, {id: req.params.pathway}),
        outParams = {};

    if (! pathway ) {
         res.status('404').send('pathway not found');
    } else {
    	var pathway_courses = _.filter(courses, {provider: pathway.id});

        var x = [];
        _.each(pathway_courses, function(course) {
            var y = _.clone(course);
            var results = _.where(programmesofstudy, {id: y.programmeofstudy});
            y.pos = _.findWhere(programmesofstudy, {id: y.programmeofstudy});
            x.push(y)
        });
        outParams.pathway = pathway;
        outParams.courses = _.sortBy(x, function(course) { return course.pos.name} );
        outParams.examboard = _.findWhere(examboards, {id:pathway.examboard});
        outParams.qualification = _.findWhere(qualifications, {id:pathway.qualification});
    	res.render('pathway', outParams);
    }

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

app.get('/pathways/:pathway/calendar/:week.json',function (req, res) {
    res.status(501).json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway/calendar/:week',function (req, res) {
    var pathway = _.findWhere(providers, {id: req.params.pathway}),
        query = req.query.date;


    if (! pathway ) {
         return res.status('404').send('pathway not found');
    }

    //show this week if no date is specified
    if (! query ) {
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
        var dateString = date.examDbShortDateString();
            morningExams = _.filter(exams, {date:dateString, timeofday:'Morning'}),
            afternoonExams = _.filter(exams, {date:dateString, timeofday:'Afternoon'}),
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
    outParams.examboard = _.findWhere(examboards, {id:pathway.examboard});
    outParams.qualification = _.findWhere(qualifications, {id:pathway.qualification});
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
    res.json(courses);
});

app.get('/courses',function (req, res) {
    res.redirect('/');
});

app.get('/courses/:course.json',function (req, res) {
    var course = _.findWhere(courses, {id: req.params.course})
    if ( ! course ) {
        res.status('404').json({status:404, message: 'course not found'});
    } else {
        res.json(course);
    }
});

app.get('/courses/:course',function (req, res) {
    var outParams = {};
    var course = _.findWhere(courses, {id: req.params.course})
    if ( ! course ) {
        res.status('404').send('course not found');
    } else {
        var course_exams = _.filter(exams, {course: course.id}),
            provider = _.findWhere(providers, {id:course.provider}),
            examboard = _.findWhere(examboards, {id:provider.examboard}),
            qualification = _.findWhere(qualifications, {id:provider.qualification}),
            pos = _.findWhere(programmesofstudy, {id:course.programmeofstudy});

        outParams.course = course;
        //date order
        outParams.exams = _.sortBy(course_exams, function(exam) { return exam.date.split('/').reverse().join('') } );
        outParams.provider = provider;
        outParams.examboard = examboard;
        outParams.qualification = qualification;
        outParams.programmeofstudy = pos;
        res.render('course', outParams);
    }
});

app.get('/programmesofstudy.json',function (req, res) {
    res.json(programmesofstudy);
});

app.get('/programmesofstudy',function (req, res) {
    res.redirect('/');
});

app.get('/programmesofstudy/:programmeofstudy.json',function (req, res) {
    var programmeofstudy = _.findWhere(programmesofstudy, {id: req.params.programmeofstudy});
    if (! programmeofstudy ) {
        res.status('404').json({status:404, message: 'programme of study not found'});
    } else {
        res.json(programmeofstudy);
    }
});

app.get('/programmesofstudy/:programmeofstudy',function (req, res) {
    var programmeofstudy = _.findWhere(programmesofstudy, {id: req.params.programmeofstudy}),
        outParams = {};
    
    if (! programmeofstudy ) {
        res.status('404').send('programme of study not found');
    } else {
        var pos_courses = _.filter(courses, {programmeofstudy: programmeofstudy.id}),
            qualification = _.findWhere(qualifications, {id:programmeofstudy.qualification});

        _.map(pos_courses, function(course) {
                var provider = _.findWhere(providers, {id: course.provider});
                course.p = provider;
                course.e = _.findWhere(examboards, {id: provider.examboard});
                return course;
            });

        outParams.programmeofstudy = programmeofstudy;
        outParams.qualification = qualification;
        outParams.courses = pos_courses;
        res.render('programmeofstudy', outParams);
    }
});

app.get('/exams.json',function (req, res) {
    res.json(exams);
});

app.get('/exams',function (req, res) {
    var outParams = { qualifications: qualifications};
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
        return res.status(422).json({status: 422, message: 'unprocessable entity; did you remember to upload the file?'});

    if (file.mimetype != 'text/csv')
        return res.status(422).json({status: 422, message: 'unprocessable entity; expected mimetype text/csv'});

    if (file.truncated)
        return res.status(422).json({status: 422, message: 'unprocessable entity; too large'});

    var records = parse(file.data, {columns:true}, function(err, records) {

        if (err) {
            res.status(422).json({status: 422, message: 'unprocessable entity; can\'t read CSV data'});
        } else {
            _.each(records, importRecord);
            res.json({status: 200, message: 'uploaded'});
        }

    });
});

app.get('/exams/:exam.json',function (req, res) {
    var exam = _.findWhere(exams, {id: req.params.exam})
    if ( ! exam ) {
        res.status('404').json({status:404, message: 'exam not found'});
    } else {
        res.json(exam);
    }
});

app.get('/exams/:exam',function (req, res) {
    var exam = _.findWhere(exams, {id: req.params.exam}),
        outParams = {};

    if ( ! exam ) {
        res.status('404').send('exam not found');
    } else {
        var course = _.findWhere(courses, {id:exam.course}),
            provider = _.findWhere(providers, {id:course.provider}),
            examboard = _.findWhere(examboards, {id:provider.examboard}),
            qualification = _.findWhere(qualifications, {id:provider.qualification}),
            pos = _.findWhere(programmesofstudy, {id:course.programmeofstudy});

        outParams.exam = exam;
        outParams.course = course;
        outParams.provider = provider;
        outParams.examboard = examboard;
        outParams.qualification = qualification;
        outParams.programmeofstudy = pos;

        res.render('exam', outParams);
    }
});

app.get('/examboards.json',function (req, res) {
    res.json(examboards);
});

app.get('/examboards',function (req, res) {
    res.redirect('/');
});

app.get('/examboards/:examboard.json',function (req, res) {
    var examboard = _.findWhere(examboards, {id: req.params.examboard})
    if ( ! examboard ) {
        res.status('404').json({status:404, message: 'examboard not found'});
    } else {
        res.json(examboard);
    }
});

app.get('/examboards/:examboard',function (req, res) {
    var examboard = _.findWhere(examboards, {id: req.params.examboard}),
        outParams = {};

    if ( ! examboard ) {
       res.status('404').send('examboard not found');
    } else {
        var exam_providers = _.filter(providers, {examboard: examboard.id});

        _.map(exam_providers, function(provider) { provider.q = _.findWhere(qualifications, {id: provider.qualification}); return provider });
        outParams.examboard = examboard;
        outParams.providers = exam_providers;
        res.render('examboard', outParams);
    }
});

app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send('internal server error');
})

// See: .ebextensions for NGINX rules which mean AWS ELB ignores this
app.use('/', express.static(path.join(__dirname, '..', 'public')));

module.exports = app;

