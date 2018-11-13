import _ from 'underscore';

export default class MemoryStore {
    constructor() {
        this.qualifications = [];
        this.providers = [];
        this.examboards = [];
        this.programmesOfStudy = [];
        this.courses = [];
        this.exams = [];
    }

    datasetForTable(table) {
        let dataset = null;

        switch (table) {
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
                throw new Error(`unknown or missing table name: ${table}`);
        }
        return dataset;
    }

    all(table) {
        return this.datasetForTable(table);
    }

    where(table, predicate) {
        const dataset = this.datasetForTable(table);
        const resultSet = _.where(dataset, predicate);

        return resultSet;
    }

    findWhere(table, predicate) {
        const dataset = this.datasetForTable(table);
        const result = _.findWhere(dataset, predicate);

        return result;
    }

    add(table, object) {
        const dataset = this.datasetForTable(table);
        const predicate = { id: object.id };

        if (this.findWhere(table, predicate)) return false;

        dataset.push(object);
        return true;
    }

    addCourse(x) {
        return this.add('courses', x);
    }

    addExam(x) {
        return this.add('exams', x);
    }

    addExamboard(x) {
        return this.add('examboards', x);
    }

    addProgrammeOfStudy(x) {
        return this.add('programmesOfStudy', x);
    }

    addProvider(x) {
        return this.add('providers', x);
    }

    addQualification(x) {
        return this.add('qualifications', x);
    }

    allCourses() {
        return this.all('courses');
    }

    allExams() {
        return this.all('exams');
    }

    allExamboards() {
        return this.all('examboards');
    }

    allProgrammesOfStudy() {
        return this.all('programmesOfStudy');
    }

    allProviders() {
        return this.all('providers');
    }

    allQualifications() {
        return this.all('qualifications');
    }

    coursesByProvider(providerId) {
        return this.where('courses', { provider: providerId });
    }

    coursesByProgrammeOfStudy(programmesOfStudyId) {
        return this.where('courses', { programmeofstudy: programmesOfStudyId });
    }

    afternoonExams(date) {
        const timeOfDay = 'Afternoon';
        return this.where('exams', { date, timeOfDay });
    }

    morningExams(date) {
        const timeOfDay = 'Morning';
        return this.where('exams', { date, timeOfDay });
    }

    examsForCourse(courseId) {
        return this.where('exams', { course: courseId });
    }

    examsForProgrammeOfStudy(programmesOfStudyId) {
        const courses = this.coursesByProgrammeOfStudy(programmesOfStudyId);
        const exams = _.chain(courses)
            .map(course => this.examsForCourse(course.id))
            .flatten()
            .value();

        return exams;
    }

    exam(id) {
        return this.findWhere('exams', { id });
    }

    examboard(id) {
        return this.findWhere('examboards', { id });
    }

    course(id) {
        return this.findWhere('courses', { id });
    }

    programmeOfStudy(id) {
        return this.findWhere('programmesOfStudy', { id });
    }

    provider(id) {
        return this.findWhere('providers', { id });
    }

    qualification(id) {
        return this.findWhere('qualifications', { id });
    }

    providerOfCourse(courseId) {
        const course = this.course(courseId);
        const provider = this.provider(course.provider);

        return provider;
    }

    providersByExamboard(examboardId) {
        return this.where('providers', { examboard: examboardId });
    }

    providersOfQualification(qualificationId) {
        return this.where('providers', { qualification: qualificationId });
    }

    findProgrammesOfStudy(query) {
        const allProgrammesOfStudy = this.all('programmesOfStudy');
        const results = [];

        _.chain(allProgrammesOfStudy)
            .filter(item => item.name === query || item.bitesize === query)
            .clone()
            .map(i => {
                i.isProgrammeOfStudy = 1;
                return i;
            })
            .each(i => {
                results.push(i);
            });
        return results;
    }

    findCourses(query) {
        const allCourses = this.all('courses');
        const results = [];

        _.chain(allCourses)
            .where({ bitesize: query })
            .clone()
            .map(i => {
                i.isCourse = 1;
                return i;
            })
            .each(i => {
                results.push(i);
            });
        return results;
    }

    findQualifications(query) {
        const allQualifications = this.all('qualifications');
        const results = [];

        _.chain(allQualifications)
            .where({ name: query })
            .clone()
            .map(i => {
                i.isQualification = 1;
                return i;
            })
            .each(i => {
                results.push(i);
            });
        return results;
    }

    findExamboards(query) {
        const allExamboards = this.all('examboards');
        const results = [];

        _.chain(allExamboards)
            .where({ name: query })
            .clone()
            .map(i => {
                i.isExamBoard = 1;
                return i;
            })
            .each(i => {
                results.push(i);
            });

        return results;
    }

    findExams(query) {
        const allExams = this.all('exams');
        const results = [];

        _.chain(allExams)
            .where({ date: query })
            .clone()
            .map(i => {
                i.isExam = 1;
                return i;
            })
            .each(i => {
                results.push(i);
            });
        return results;
    }
}
