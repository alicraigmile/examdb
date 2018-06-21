'use strict';

var _ = require('underscore'),
    Promise = require('bluebird');

var MemoryStore = function () {
    this.qualifications = [];
    this.providers = [];
    this.examboards = [];
    this.programmesOfStudy = [];
    this.courses = [];
    this.exams = [];
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
    var exams = this.exams;
    return new Promise(function (resolve, reject) {
        resolve(exams);
    });
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

MemoryStore.prototype.course = function(courseId) {
    return _.findWhere(this.courses, {id:courseId});
}

MemoryStore.prototype.coursesByProvider = function(providerId) {
    return _.where(this.courses, {provider:providerId});
}

MemoryStore.prototype.coursesByProgrammeOfStudy = function(programmesOfStudyId) {
    return _.where(this.courses, {programmeofstudy: programmesOfStudyId});
}

MemoryStore.prototype.exam = function(examId) {
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

MemoryStore.prototype.examsForProgrammeOfStudy = function(programmesOfStudyId) {
    var courses = this.coursesByProgrammeOfStudy(programmesOfStudyId),
        exams = _.chain(courses)
                .map(course => this.examsForCourse(course.id))
                .flatten()
                .value();

    return exams;
}

MemoryStore.prototype.examboard = function(examboardId) {
    return _.findWhere(this.examboards, {id:examboardId});
}

MemoryStore.prototype.provider = function(providerId) {
    return _.findWhere(this.providers, {id:providerId});
}

MemoryStore.prototype.providerOfCourse = function(courseId) {
    var course = this.course(courseId),
        provider = this.provider(course.provider);
        
    console.log(course);
    console.log(provider);
    return provider;
}

MemoryStore.prototype.providersByExamboard = function(examboardId) {
    return _.where(this.providers, {examboard:examboardId});
}

MemoryStore.prototype.providersOfQualification = function(qualificationId) {
    return _.where(this.providers, {qualification:qualificationId});
}

MemoryStore.prototype.programmeOfStudy = function(programmesOfStudyId) {
    return _.findWhere(this.programmesOfStudy, {id:programmesOfStudyId});
}

MemoryStore.prototype.qualification = function(qualificationId) {
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
