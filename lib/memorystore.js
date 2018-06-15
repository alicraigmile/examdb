'use strict';

var _ = require('underscore');

var MemoryStore = function () {
    this.qualifications = [];
    this.providers = [];
    this.examboards = [];
    this.programmesOfStudy = [];
    this.courses = [];
    this.exams = [];
};

MemoryStore.prototype.loadSampleData = function() {
    _.each([
        {id:'gcse', name:'GCSE'},
        {id:'gce', name:'GCE'},
        {id:'national-5', name:'National 5'},
        {id:'higher', name:'Higher'},
        {id:'advanced-higher', name:'Advanced Higher'}
    ], this.addQualification, this);

    _.each([
        {id:'gcse-aqa', qualification: 'gcse', examboard: 'aqa'},
        {id:'gcse-edexcel', qualification: 'gcse', examboard: 'edexcel'},
        {id:'gcse-ocr', qualification: 'gcse', examboard: 'ocr'},
        {id:'gcse-eduqas', qualification: 'gcse', examboard: 'eduqas'},
        {id:'gcse-wjec', qualification: 'gcse', examboard: 'wjec'},
        {id:'gcse-cea', qualification: 'gcse', examboard: 'cea'},
        {id:'gce-aqa', qualification: 'gce', examboard: 'aqa'},
        {id:'gce-cea', qualification: 'gce', examboard: 'cea'}
    ], this.addProvider, this);

    _.each([
        {id:'aqa', name: 'AQA'},
        {id:'edexcel', name: 'EDEXCEL'},
        {id:'eduqas', name: 'EDUQAS'},
        {id:'cea', name: 'CEA'},
        {id:'ocr', name: 'OCR'},
        {id:'wjec', name: 'WJEC'},
        {id:'sqa', name: 'SQA'}
    ], this.addExamboard, this);

    _.each([
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
    ], this.addProgrammeOfStudy, this);

    _.each([
        {id:'gcse-aqa-mathematics', provider: 'gcse-aqa', programmeofstudy:'gcse-mathematics'},
        {id:'gcse-aqa-english-language', provider: 'gcse-aqa', programmeofstudy:'gcse-english-language'},
        {id:'gcse-aqa-english-literature', provider: 'gcse-aqa', programmeofstudy:'gcse-english-literature'},
        {id:'gcse-aqa-history', provider: 'gcse-aqa', programmeofstudy:'gcse-history'},
        {id:'gcse-aqa-home-economics', provider: 'gcse-aqa', programmeofstudy:'gcse-home-economics'},
        {id:'gce-aqa-mathematics', provider: 'gce-aqa', programmeofstudy:'gce-mathematics'},
        {id:'gce-aqa-english-language', provider: 'gce-aqa', programmeofstudy:'gce-english-language'},
        {id:'gce-aqa-english-literature', provider: 'gce-aqa', programmeofstudy:'gce-english-literature'}
    ], this.addCourse, this);

    _.each([
        {id:'gce-aqa-mathematics', course:'gce-aqa-mathematics', paper: 'Mathematics', code: 'ALEVELM', date: '2018-07-23', timeofday: 'Morning', duration: '2h 15m', notes: ''},
        {id:'gce-aqa-english-language', course:'gce-aqa-english-language', paper: 'English Lang paper 1', code: 'ALEVELE', date: '2018-07-23', timeofday: 'Afternoon', duration: '2h', notes: ''},
        {id:'gcse-aqa-mathematics-unit-1', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 1 (Foundation & Higher)', code: 'A61UF', date: '2018-05-23', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-2', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 2 (Foundation & Higher)', code: 'A62UF', date: '2018-05-24', timeofday: 'Morning', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-3', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 3 (Foundation & Higher)', code: 'A63UF', date: '2018-05-24', timeofday: 'Afternoon', duration: '1h 30m', notes: 'F & H'},
        {id:'gcse-aqa-mathematics-unit-4', course:'gcse-aqa-mathematics', paper: 'Mathematics Unit 4 (Foundation & Higher)', code: 'A64UF', date: '2018-05-25', timeofday: 'Morning', duration: '1h 45m', notes: 'F & H'},
        {id:'gcse-aqa-home-economics-z1', course:'gcse-aqa-home-economics', paper: 'Home Economics', code: 'GHE101', date: '2018-06-04', timeofday: 'Morning', duration: '1h', notes: ''}
    ], this.addExam, this);
};

MemoryStore.prototype.addExamboard = function(examboard) {
    if (! _.findWhere(this.examboards, {id:examboard.id}))
        this.examboards.push(examboard);
}

MemoryStore.prototype.addQualification = function(qualification) {
    if (! _.findWhere(this.qualifications, {id:qualification.id}))
        this.qualifications.push(qualification);
}

MemoryStore.prototype.addProvider = function(provider) {
    if (! _.findWhere(this.providers, {id:provider.id}))
        this.providers.push(provider);
}

MemoryStore.prototype.addProgrammeOfStudy = function(pos) {
    if (! _.findWhere(this.programmesOfStudy, {id:pos.id}))
        this.programmesOfStudy.push(pos);
}

MemoryStore.prototype.addCourse = function(course) {
    if (! _.findWhere(this.courses, {id:course.id}))
        this.courses.push(course);
}

MemoryStore.prototype.addExam = function(exam) {
    if (! _.findWhere(this.exams, {id:exam.id}))
        this.exams.push(exam);
}

MemoryStore.prototype.allCourses = function() {
    return this.courses;
}

MemoryStore.prototype.allExams = function() {
    return this.exams;
}

MemoryStore.prototype.allExamboards = function() {
    return this.examboards;
}

MemoryStore.prototype.allProviders = function() {
    return this.providers;
}

MemoryStore.prototype.allProgrammesOfStudy = function() {
    return this.programmesOfStudy;
}

MemoryStore.prototype.allQualifications = function() {
    return this.qualifications;
}

MemoryStore.prototype.courseById = function(courseId) {
    return _.findWhere(this.courses, {id:courseId});
}

MemoryStore.prototype.coursesByProvider = function(providerId) {
    return _.where(this.courses, {provider:providerId});
}

MemoryStore.prototype.coursesByProgrammeOfStudy = function(programmesOfStudyId) {
    return _.where(this.courses, {programmeofstudy: programmesOfStudyId});
}

MemoryStore.prototype.examById = function(examId) {
    return _.findWhere(this.exams, {id: examId});
}

MemoryStore.prototype.afternoonExams = function(date) {
    const timeOfDay = 'Afternoon';
    return _.where(this.exams, {date:date, timeofday:timeOfDay});
}

MemoryStore.prototype.morningExams = function(date) {
    const timeOfDay = 'Morning';
    return _.where(this.exams, {date:date, timeofday:timeOfDay});
}

MemoryStore.prototype.examsForCourse = function(courseId) {
    return _.where(this.exams, {course:courseId});
}

MemoryStore.prototype.examboardById = function(examboardId) {
    return _.findWhere(this.examboards, {id:examboardId});
}

MemoryStore.prototype.providerById = function(providerId) {
    return _.findWhere(this.providers, {id:providerId});
}

MemoryStore.prototype.providersByExamboard = function(examboardId) {
    return _.where(this.providers, {examboard:examboardId});
}

MemoryStore.prototype.providersOfQualification = function(qualificationId) {
    return _.where(this.providers, {qualification:qualificationId});
}

MemoryStore.prototype.programmeOfStudyById = function(programmesOfStudyId) {
    return _.findWhere(this.programmesOfStudy, {id:programmesOfStudyId});
}

MemoryStore.prototype.qualificationById = function(qualificationId) {
    return _.findWhere(this.qualifications, {id:qualificationId});
}

MemoryStore.prototype.findProgrammesOfStudy = function(query) {
    var results = [];
    _.chain(this.programmesOfStudy)
        .where({name:query})
        .clone()
        .map(function(i){i.isProgrammeOfStudy=1; return i})
        .each(function(i){ results.push(i) });
    return results;
}

MemoryStore.prototype.findQualifications = function(query) {
    var results = [];
    _.chain(this.qualifications)
        .where({name:query})
        .clone()
        .map(function(i){i.isQualification=1; return i})
        .each(function(i){ results.push(i) });
    return results;
}

MemoryStore.prototype.findExamboards = function(query) {
    var results = [];
    _.chain(this.examboards)
        .where({name:query})
        .clone()
        .map(function(i){i.isExamBoard=1; return i})
        .each(function(i){ results.push(i) });
    return results;
}

MemoryStore.prototype.findExams = function(query) {
    var results = [];
    _.chain(this.exams)
        .where({date:query})
        .clone()
        .map(function(i){i.isExam=1; return i})
        .each(function(i){ results.push(i) });
    return results;
}



module.exports = new MemoryStore();
