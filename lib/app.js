var express = require('express'),
    fileUpload = require('express-fileupload'),
    parse = require('csv-parse'),
    uuidv1 = require('uuid/v1'),
    app = express(),
    path = require('path'),
    package = require('../package'),
    store = require('./memorystore'),
    _ = require('underscore');

store.loadSampleData();

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
        programmeofstudy_id = qualification_id + '-' + course_stub;
    store.addProgrammeOfStudy({id:programmeofstudy_id, name:course_name, qualification:qualification_id});
    store.addCourse({id:course_id, provider:provider_id, programmeofstudy:programmeofstudy_id});

    var exam_id = uuidv1(),
        exam_code = record['Code'],
        exam_paper = record['Paper'],
        exam_notes = record['Notes'],
        exam_date = record['Date'],
        exam_timeofday = record['Morning/Afternoon'],
        exam_duration = record['Duration'];
    store.addExam({id:exam_id, course:course_id, code:exam_code, paper:exam_paper, notes:exam_notes, date:exam_date, timeofday:exam_timeofday, duration:exam_duration});
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
        let date = new Date();
        date = date.toISOString().slice(0,10).replace(/-/g, '/');
        query = date;
    }

    var results = _.union(
        store.findProgrammesOfStudy(query),
        store.findQualifications(query),
        store.findExamboards(query),
        store.findExams(query)
    );

    console.log(results);

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
    var qual = store.qualificationById(req.params.qualification),
        outParams = {};

    if ( ! qual ) {
	   res.status('404').send('qualification not found');
    } else {
    	outParams.qualification = qual;
    	var qual_providers = store.providersOfQualification(qual.id);
    	_.map(qual_providers, function(provider) { provider.e= store.examboardById(provider.examboard); return provider });
    	outParams.providers = qual_providers;
    	res.render('qualification', outParams);
    }

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
    var pathway = store.providerById(req.params.pathway),
        outParams = {};

    if (! pathway ) {
         res.status('404').send('pathway not found');
    } else {
    	var pathway_courses = store.coursesByProvider(pathway.id);

        var x = [];
        _.each(pathway_courses, function(course) {
            var y = _.clone(course);
            y.pos = store.programmeOfStudyById(y.programmeofstudy);
            x.push(y)
        });
        outParams.pathway = pathway;
        outParams.courses = _.sortBy(x, function(course) { return course.pos.name} );
        outParams.examboard = store.examboardById(pathway.examboard);
        outParams.qualification = store.qualificationById(pathway.qualification);
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
    var pathway = store.providerById(req.params.pathway),
        outParams = {};

    if (! pathway ) {
         res.status('404').send('pathway not found');
    } else {
        var pathway_courses = store.coursesByProvider(pathway.id);

        outParams.pathway = pathway;
        outParams.examboard = store.examboardById(pathway.examboard);
        outParams.qualification = store.qualificationById(pathway.qualification);


        var dates = ['2018-05-23', '2018-05-24', '2018-05-25', '2018-05-26', '2018-05-27'];
        var days = _.map(dates, function(date) {
            var morningExams = store.morningExams(date),
                afternoonExams = store.afternoonExams(date);

            return {date:date, morning_exams:morningExams, afternoon_exams: afternoonExams};
        });
        outParams.days = days;
        res.render('week', outParams);
    }
});

app.get('/courses.json',function (req, res) {
    res.json(store.allCourses());
});

app.get('/courses',function (req, res) {
    res.redirect('/');
});

app.get('/courses/:course.json',function (req, res) {
    var course = store.courseById(req.params.course)
    if ( ! course ) {
        res.status('404').json({status:404, message: 'course not found'});
    } else {
        res.json(course);
    }
});

app.get('/courses/:course',function (req, res) {
    var outParams = {};
    var course = store.courseById(req.params.course)
    if ( ! course ) {
        res.status('404').send('course not found');
    } else {
        var course_exams = store.examsForCourse(course.id),
            provider = store.providerById(course.provider),
            examboard = store.examboardById(provider.examboard),
            qualification = store.qualificationById(provider.qualification),
            pos = store.programmeOfStudyById(course.programmeofstudy);

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
    res.json(store.allProgrammesOfStudy());
});

app.get('/programmesofstudy',function (req, res) {
    res.redirect('/');
});

app.get('/programmesofstudy/:programmeofstudy.json',function (req, res) {
    var programmeofstudy = store.programmeOfStudyById(req.params.programmeofstudy);
    if (! programmeofstudy ) {
        res.status('404').json({status:404, message: 'programme of study not found'});
    } else {
        res.json(programmeofstudy);
    }
});

app.get('/programmesofstudy/:programmeofstudy',function (req, res) {
    var programmeofstudy = store.programmeOfStudyById(req.params.programmeofstudy),
        outParams = {};
    
    if (! programmeofstudy ) {
        res.status('404').send('programme of study not found');
    } else {
        var pos_courses = store.coursesByProgrammeOfStudy(programmeofstudy.id),
            qualification = store.qualificationById(programmeofstudy.qualification);

        _.map(pos_courses, function(course) {
                var provider = store.providerById(course.provider);
                course.p = provider;
                course.e = store.examboardById(provider.examboard);
                return course;
            });

        outParams.programmeofstudy = programmeofstudy;
        outParams.qualification = qualification;
        outParams.courses = pos_courses;
        res.render('programmeofstudy', outParams);
    }
});

app.get('/exams.json',function (req, res) {
    res.json(store.allExams());
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
    var exam = store.examById(req.params.exam);
    if ( ! exam ) {
        res.status('404').json({status:404, message: 'exam not found'});
    } else {
        res.json(exam);
    }
});

app.get('/exams/:exam',function (req, res) {
    var exam = store.examById(req.params.exam),
        outParams = {};

    if ( ! exam ) {
        res.status('404').send('exam not found');
    } else {
        var course = store.courseById(exam.course),
            provider = store.providerById(course.provider),
            examboard = store.examboardById(provider.examboard),
            qualification = store.qualificationById(provider.qualification),
            pos = store.programmeOfStudyById(course.programmeofstudy);

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
    res.json(store.allExamboards());
});

app.get('/examboards',function (req, res) {
    res.redirect('/');
});

app.get('/examboards/:examboard.json',function (req, res) {
    var examboard = store.examboardById(req.params.examboard)
    if ( ! examboard ) {
        res.status('404').json({status:404, message: 'examboard not found'});
    } else {
        res.json(examboard);
    }
});

app.get('/examboards/:examboard',function (req, res) {
    var examboard = store.examboardById(req.params.examboard),
        outParams = {};

    if ( ! examboard ) {
       res.status('404').send('examboard not found');
    } else {
        var exam_providers = store.providersByExamboard(examboard.id);

        _.map(exam_providers, function(provider) { provider.q = store.qualificationById(provider.qualification); return provider });
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

