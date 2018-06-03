var express = require('express'),
    app = express(),
    path = require('path'),
    package = require('../package'),
    _ = require('underscore');

var qualifications = [
	{id:'gcse', label:'GCSE'},
	{id:'gce', label:'GCE'}
];

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/',function (req, res) {
	res.render('index');
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
    res.render('qualification');
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

