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
	res.status('404').send('not found');
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
    res.status(501).send('not implemented');
});

app.get('/pathways/:pathway/calendar.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway/calendar',function (req, res) {
    res.redirect('/pathways/' + req.params.pathway);
});

app.get('/pathways/:pathway/calendar/:week/.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/pathways/:pathway/calendar/:week',function (req, res) {
    res.status(501).send('not implemented');
});


app.get('/courses.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/courses',function (req, res) {
    res.redirect('/');
});

app.get('/course/:course.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/courses/:course',function (req, res) {
    res.status(501).send('not implemented');
}
);

app.get('/programmesofstudy.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/programmesofstudy',function (req, res) {
    res.redirect('/');
});

app.get('/programmesofstudy/:programmeofstudy.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/programmesofstudy/:programmeofstudy',function (req, res) {
    res.status(501).send('not implemented');
});

app.get('/exams.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/exams',function (req, res) {
    res.redirect('/');
});

app.get('/exams/:exam.json',function (req, res) {
    res.json({ status:501, message: "not implemented" });
});

app.get('/exams/:exam',function (req, res) {
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

