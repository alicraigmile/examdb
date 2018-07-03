'use strict';

var _ = require('underscore'),
    Promise = require('bluebird');

class MemoryStore {

    constructor() {
        this.qualifications = [];
        this.providers = [];
        this.examboards = [];
        this.programmesOfStudy = [];
        this.courses = [];
        this.exams = [];
    }

    _selectByID(objectType, id) {
        var table;

        switch(objectType) {
            case 'exams':
                table = this.exams;
                break;
            case 'examboards':
                table = this.examboards;
                break;
            case 'courses':
                table = this.courses;
                break;
            case 'programmesOfStudy':
                table = this.programmesOfStudy;
                break;
            case 'providers':
                table = this.providers;
                break;
            case 'qualifications':
                table = this.qualifications;
                break;
            default:
                throw new Error('unknown or missing objectType')
        }

        let result = _.findWhere(table, {id: id});
        return result;
    }

    _all(objectType) {
        var table;

        switch(objectType) {
            case 'exams':
                table = this.exams;
                break;
            case 'examboards':
                table = this.examboards;
                break;
            case 'courses':
                table = this.courses;
                break;
            case 'programmesOfStudy':
                table = this.programmesOfStudy;
                break;
            case 'providers':
                table = this.providers;
                break;
            case 'qualifications':
                table = this.qualifications;
                break;
            default:
                throw new Error('unknown or missing objectType')
        }

        return table;
    }

    addCourse(course) {
        if (! _.findWhere(this.courses, {id:course.id}))
            this.courses.push(course);        
    }

    addExam(exam) {
        if (! _.findWhere(this.exams, {id:exam.id}))
            this.exams.push(exam);
    }

    addExamboard(examboard) {
        if (! _.findWhere(this.examboards, {id:examboard.id}))
            this.examboards.push(examboard);
    }

    addProgrammeOfStudy(programmeOfStudy) {
        if (! _.findWhere(this.programmesOfStudy, {id:programmeOfStudy.id}))
            this.programmesOfStudy.push(programmeOfStudy);
    }

    addProvider(provider) {
        if (! _.findWhere(this.providers, {id:provider.id}))
            this.providers.push(provider);        
    }

    addQualification(qualification) {
        if (! _.findWhere(this.qualifications, {id:qualification.id}))
            this.qualifications.push(qualification);
    }

    allCourses() {
        return this._all('courses');
    }

    allExams() {
        return his._all('exams');
    }

    allExamboards() {
        return this._all('examboards');
    }

    allProgrammesOfStudy() {
        return this._all('programmesOfStudy');
    }

    allProviders() {
        return this._all('providers');
    }

    allQualifications() {
        return this._all('qualifications');
    }

    coursesByProvider(providerId) {
        return _.where(this.courses, {provider:providerId});
    }


    coursesByProgrammeOfStudy(programmesOfStudyId) {
        return _.where(this.courses, {programmeofstudy: programmesOfStudyId});
    }

    afternoonExams(date) {
        const timeOfDay = 'Afternoon';
        return _.where(this.exams, {date:date, timeofday:timeOfDay});
    }

    morningExams(date) {
        const timeOfDay = 'Morning';
        return _.where(this.exams, {date:date, timeofday:timeOfDay});
    }

    examsForCourse(courseId) {
        return _.where(this.exams, {course:courseId});
    }

    examsForProgrammeOfStudy(programmesOfStudyId) {
        var courses = this.coursesByProgrammeOfStudy(programmesOfStudyId),
            exams = _.chain(courses)
                    .map(course => this.examsForCourse(course.id))
                    .flatten()
                    .value();

        return exams;
    }

    exam(id) {  return this._selectByID('exams', id) }
    examboard(id) { return this._selectByID('examboards', id) }
    course(id) { return this._selectByID('courses', id) }
    programmeOfStudy(id) { return this._selectByID('programmesOfStudy', id) }
    provider(id) { return this._selectByID('providers', id) }
    qualification(id) { return this._selectByID('qualifications', id) }


    providerOfCourse(courseId) {
        var course = this.course(courseId),
            provider = this.provider(course.provider);
            
        console.log(course);
        console.log(provider);
        return provider;
    }

    providersByExamboard(examboardId) {
        return _.where(this.providers, {examboard:examboardId});
    }

    providersOfQualification(qualificationId) {
        return _.where(this.providers, {qualification:qualificationId});
    }


    findProgrammesOfStudy(query) {
        var results = [];
        _.chain(this.programmesOfStudy)
            .filter( function(item) { return item.name==query || item.bitesize==query } )
            .clone()
            .map(function(i){i.isProgrammeOfStudy=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

    findCourses(query) {
        var results = [];
        _.chain(this.courses)
            .where({bitesize:query})
            .clone()
            .map(function(i){i.isCourse=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

    findQualifications(query) {
        var results = [];
        _.chain(this.qualifications)
            .where({name:query})
            .clone()
            .map(function(i){i.isQualification=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

    findExamboards(query) {
        var results = [];
        _.chain(this.examboards)
            .where({name:query})
            .clone()
            .map(function(i){i.isExamBoard=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

    findExams(query) {
        var results = [];
        _.chain(this.exams)
            .where({date:query})
            .clone()
            .map(function(i){i.isExam=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

}

module.exports = MemoryStore;
