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

    _datasetForTable(table) {
        var dataset;

        switch(table) {
            case 'exams':
                dataset = this.exams;
                break;
            case 'examboards':
                dataset = this.examboards;
                break;
            case 'courses':
                dataset = this.courses;
                break;
            case 'programmesOfStudy':
                dataset = this.programmesOfStudy;
                break;
            case 'providers':
                dataset = this.providers;
                break;
            case 'qualifications':
                dataset = this.qualifications;
                break;
            default:
                throw new Error('unknown or missing table name: ' + table)
        }
        return dataset;
    }

    // returns "I promise to return all objects from {table} matching {predicate}" 
    _all(table) {
        let resultSet = this._datasetForTable(table);

        return new Promise(function(resolve, reject) { resolve(resultSet) });
    }

    // returns "I promise to return all objects from {table} matching {predicate}" 
    _where(table, predicate) {
        let dataset = this._datasetForTable(table),
            resultSet = _.where(dataset, predicate);

        return new Promise(function(resolve, reject) {
            if (resultSet.length > 0) {
                resolve(resultSet);
            } else {
                reject(new Error(`not_found`))
            }
        });
    }

    // returns "I promise to return 1 object from {table} matching {predicate}" 
    _findWhere(table, predicate) {
        let dataset = this._datasetForTable(table),
            result =  _.findWhere(dataset, predicate);

        return new Promise(function(resolve, reject) {
            if (result) {
                resolve(result);
            } else {
                reject(new Error(`not_found`))
            }
        });
    }

    // returns "I promise to add {object} to {table}" 
    _add(table, object) {        
        let dataset = this._datasetForTable(table),
            insertObject = () => { return dataset.push(object) };

        return new Promise(function(resolve, reject) {
            resolve(insertObject());
        });
    }

    // returns "I promise to add {object} to {table} (so long as it's not in there already)" 
    add(table, object) {
        let predicate = {id:object.id},
            objectExists = () => { let exists = this._findWhere(table, predicate); return exists },
            insertObject = () => this._add(table, object);

        return new Promise(function (resolve, reject) {
            objectExists()
                .then(reject) // rejct if it already exists
                .catch(insertObject) // otherwise insert
                .then(resolve); // then return successfully
        });
    }

    addCourse(x) { return this.add('courses', x) }
    addExam(x) { return this.add('exams', x) }
    addExamboard(x) { return this.add('examboards', x) }
    addProgrammeOfStudy(x) { return this.add('programmesOfStudy', x) }
    addProvider(x) { return this.add('providers', x) }
    addQualification(x) { return this.add('qualifications', x) }

    // returns "I promise to return all of the data from {table}"
    all(table) {
        return this._all(table);
    }

    allCourses() { return this.all('courses') }
    allExams() { return this.all('exams') }
    allExamboards() { return this.all('examboards') }
    allProgrammesOfStudy() { return this.all('programmesOfStudy') }
    allProviders() { return this.all('providers') }
    allQualifications() { return this.all('qualifications') }

    coursesByProvider(providerId) {
        return this._where('courses', {provider:providerId});
    }


    coursesByProgrammeOfStudy(programmesOfStudyId) {
        return this._where('courses', {programmeofstudy: programmesOfStudyId});
    }

    afternoonExams(date) {
        const timeOfDay = 'Afternoon';
        return this._where('exams', {date:date, timeofday:timeOfDay});
    }

    morningExams(date) {
        const timeOfDay = 'Morning';
        return this._where('exams', {date:date, timeofday:timeOfDay});
    }

    examsForCourse(courseId) {
        return this._where('exams', {course:courseId});
    }

    examsForProgrammeOfStudy(programmesOfStudyId) {
        var courses = this.coursesByProgrammeOfStudy(programmesOfStudyId),
            exams = _.chain(courses)
                    .map(course => this.examsForCourse(course.id))
                    .flatten()
                    .value();

        return exams;
    }

    exam(id) { return this._findWhere('exams', {id:id}) }
    examboard(id) { return this._findWhere('examboards', {id:id}) }
    course(id) { return this._findWhere('courses', {id:id}) }
    programmeOfStudy(id) { return this._findWhere('programmesOfStudy', {id:id}) }
    provider(id) { return this._findWhere('providers', {id:id}) }
    qualification(id) { return this._findWhere('qualifications', {id:id}) }


    providerOfCourse(courseId) {
        var course = this.course(courseId),
            provider = this.provider(course.provider);
            
        return provider;
    }

    providersByExamboard(examboardId) {
        return this._where('providers', {examboard:examboardId});
    }

    providersOfQualification(qualificationId) {
        return this._where('providers', {qualification:qualificationId});
    }


    findProgrammesOfStudy(query) {
        var allProgrammesOfStudy = this._all('programmesOfStudy'),
            results = [];

        _.chain(allProgrammesOfStudy)
            .filter( function(item) { return item.name==query || item.bitesize==query } )
            .clone()
            .map(function(i){i.isProgrammeOfStudy=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

    findCourses(query) {
        var allCourses = this._all('courses'),
            results = [];

        _.chain(allCourses)
            .where({bitesize:query})
            .clone()
            .map(function(i){i.isCourse=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

    findQualifications(query) {
        var allQualifications = this._all('qualifications'),
            results = [];

        _.chain(allQualifications)
            .where({name:query})
            .clone()
            .map(function(i){i.isQualification=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

    findExamboards(query) {
        var allExamboards = this._all('examboards'),
            results = [];

        _.chain(allExamboards)
            .where({name:query})
            .clone()
            .map(function(i){i.isExamBoard=1; return i})
            .each(function(i){ results.push(i) });

        return results;
    }

    findExams(query) {
        var allExams = this._all('exams'),
            results = [];

        _.chain(allExams)
            .where({date:query})
            .clone()
            .map(function(i){i.isExam=1; return i})
            .each(function(i){ results.push(i) });
        return results;
    }

}

module.exports = MemoryStore;
