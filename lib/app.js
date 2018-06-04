var express = require('express'),
    app = express(),
    path = require('path'),
    package = require('../package'),
    _ = require('underscore');

const qualifications = [
    	{id:'gcse', label:'GCSE'},
    	{id:'gce', label:'GCE'},
    	{id:'national5', label:'National 5'},
    	{id:'higher', label:'Higher'},
    	{id:'advancedhigher', label:'Advanced Higher'}
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
    	{id:'gcse-mathematics', name:'Mathematics', qualification: 'gcse'},
        {id:'gce-mathematics', name:'Mathematics', qualification: 'gce'},
    	{id:'gcse-history', name:'History', qualification: 'gcse'},
    	{id:'gcse-music', name: 'Music', qualification: 'gcse'},
    	{id:'gcse-home-economics', name: 'Home Economics', qualification: 'gcse'},
    ],
    courses = [
        {id:'gcse-aqa-mathematics', provider: 'gcse-aqa', programmeofstudy:'gcse-mathematics'},
        {id:'gce-aqa-mathematics', provider: 'gce-aqa', programmeofstudy:'gce-mathematics'},
        {id:'gcse-aqa-history', provider: 'gcse-aqa', programmeofstudy:'gcse-history'},
        {id:'gcse-aqa-home-economics', provider: 'gcse-aqa', programmeofstudy:'gcse-home-economics'}
    ],
    exams = [
        {id:'gce-aqa-mathematics', course:'gce-aqa-mathematics', paper: 'Mathematics', code: 'ALEVELM', date: '2018-07-23', timeofday: 'Morning', duration: '2h 15m', notes: ''},
        {id:'gcse-aqa-mathematics-unit-1', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 1 (Foundation & Higher)', code: 'A61UF', date: '2018-05-23', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-2', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 2 (Foundation & Higher)', code: 'A62UF', date: '2018-05-24', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-3', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 3 (Foundation & Higher)', code: 'A63UF', date: '2018-05-24', timeofday: 'Afternoon', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-4', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 4 (Foundation & Higher)', code: 'A64UF', date: '2018-05-25', timeofday: 'Morning', duration: '1h 45m', notes: 'F & H'},
        {id:'gcse-aqa-home-economics-z1', course:'gcse-aqa-home-economics', paper: 'Home Economics', code: 'GHE101', date: '2018-06-04', timeofday: 'Morning', duration: '1h', notes: ''}
    ];

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/',function (req, res) {
	var outParams = { qualifications: qualifications};
	res.render('index', outParams);
});

app.get('/status',function (req, res) {
    res.json({ app: package.name, version: package.version });
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
    res.json({ status:501, message: "not implemented" });
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
        outParams.pathway = pathway;
	var pathway_courses = _.filter(courses, {provider: pathway.id});
	_.map(pathway_courses, function(course) { course.pos = _.findWhere(programmesofstudy, {id: course.programmeofstudy}); return course });
        outParams.courses = pathway_courses;
        outParams.examboard = _.findWhere(examboards, {id:pathway.examboard});
        outParams.qualification = _.findWhere(qualifications, {id:pathway.qualification});
    	res.render('pathway', outParams);
    }

});

app.get('/pathways/:pathway/calendar.json',function (req, res) {
    res.status(501).json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway/calendar',function (req, res) {
    res.redirect('/pathways/' + req.params.pathway);
});

app.get('/pathways/:pathway/calendar/:week/.json',function (req, res) {
    res.status(501).json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway/calendar/:week',function (req, res) {
    res.status(501).send('not implemented');
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
        outParams.exams = course_exams;
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
    res.status(501).json({ status:501, message: "not implemented" });
});

app.get('/exams',function (req, res) {
    res.redirect('/');
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
    res.status(501).send('not implemented');
});

app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send('internal server error');
})

// See: .ebextensions for NGINX rules which mean AWS ELB ignores this
app.use('/', express.static(path.join(__dirname, '..', 'public')));

module.exports = app;

