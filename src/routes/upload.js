// import { Router } from 'express';
import _ from 'underscore';
import csvParser from 'csv-parse';
import Promise from 'bluebird';
import Router from 'express-promise-router';
import { throwIf, catchError } from '../helpers';
import Record from '../record';
import { isImportNamespaceSpecifier } from 'babel-types';

const csvParse = Promise.promisify(csvParser);

const makeExamAssociations = course => exam => {
    exam.setCourse(course);
    return exam;
};

// given a db connection,
// returns a function which promises to look up an examboard by name
// note: the function will create the examboard if it does not exist
const fetchExamboardByName = db => async examBoardName => {
    const { ExamBoard } = db;
    const [examBoard] = await ExamBoard.findOrCreate({
        where: { name: examBoardName }
    });
    return examBoard;
};

// given a db connection,
// returns a function which promises to look up a programme of study by name
// note: the function will create the  programme of study if it does not exist
const fetchProgrammeOfStudyByName = db => async programmeOfStudyName => {
    const { ProgrammeOfStudy } = db;
    const [programmeOfStudy] = await ProgrammeOfStudy.findOrCreate({
        where: { name: programmeOfStudyName }
    });
    return programmeOfStudy;
};

// given a db connection,
// returns a function which promises to look up an course by name
// note: the function will create the course if it does not exist
const fetchCourseByName = db => async courseName => {
    const { Course } = db;
    const [course] = await Course.findOrCreate({
        where: { name: courseName }
    });
    return course;
};

// given a db connection,
// returns a function which promises to look up a qualification by name
// note: the function will create the qualification if it does not exist
const fetchQualificationByName = db => async qualificationName => {
    const { Qualification } = db;
    const [qualification] = await Qualification.findOrCreate({
        where: { name: qualificationName }
    });
    return qualification;
};

// given a set of records, scan for examboards
// then fetch (or create) entries for them in the db
// returns an object with promises for each, keyed by examboard name
// there is an option to cache the promises if request
const scanForExamboards = (db, cache) => records => {
    const uniqueExamBoardNames = _.chain(records)
        .pluck('examBoardName')
        .unique()
        .value();

    const examboards = _.object(uniqueExamBoardNames, _.map(uniqueExamBoardNames, fetchExamboardByName(db)));
    cache.examboards = examboards;

    return examboards;
};

// given a set of records, scan for qualifications
// then fetch (or create) entries for them in the db
// returns an object with promises for each, keyed by qualification name
// there is an option to cache the promises if request
const scanForQualifications = (db, cache) => records => {
    const uniqueQualificationNames = _.chain(records)
        .pluck('qualificationName')
        .unique()
        .value();

    const qualifications = _.object(
        uniqueQualificationNames,
        _.map(uniqueQualificationNames, fetchQualificationByName(db))
    );
    cache.qualifications = qualifications;
    return qualifications;
};

// given a set of records, scan for programmes of study
// then fetch (or create) entries for them in the db
// returns an object with promises for each, keyed by programmes of study name
// there is an option to cache the promises

const scanForProgrammesOfStudy = (db, cache) => records => {
    const posName = record => record.programmeOfStudyName();
    // extract any relevant details of a programmes of study from a CSV record
    const extractDeets = record => ({
        name: record.programmeOfStudyName(),
        qualification: record.qualificationName
    });

    // given a stub, return the real programme of study
    const expandProgrammeOfStudy = stub => fetchProgrammeOfStudyByName(db, stub.qualification)(stub.name);
    
    const programmesOfStudyStubs = _.chain(records)
        .unique(posName)
        .map(extractDeets)
        .value();
        
    const names = _.pluck(programmesOfStudyStubs, 'name');
    const promises = _.map(programmesOfStudyStubs, expandProgrammeOfStudy);

    const programmesOfStudy = _.object(names, promises);
    cache.programmesOfStudy = programmesOfStudy;
    return Promise.all(promises);
};

// given a set of records, scan for programmes of study
// then fetch (or create) entries for them in the db
// returns an object with promises for each, keyed by programmes of study name
// there is an option to cache the promises
const scanForCourses = (db, cache) => records => {

    const getCourseName = record => record.courseNameLong();

    const uniqueCourseNames = _.chain(records)
        .map(getCourseName)
        .unique()
        .value();

    const courses = _.object(uniqueCourseNames, _.map(uniqueCourseNames, fetchCourseByName(db)));
    cache.courses = courses;
    return courses;
};

const saveExam = (db, cache) => async record => {
    const { Exam } = db;
    // this needs a try/catch as the replace will fail if data is missing. these will be more examples below.

    const course = await cache.courses[record.courseNameLong()];

    // this is very hacky and doesn't belong here.
    /*
    await programmeOfStudy.setQualification(qualification);
    await course.setProgrammeOfStudy(programmeOfStudy);
    await course.setExamBoard(examBoard);
    */

    // exam
    const examDetails = {
        code: record.examCode,
        paper: record.examPaper,
        notes: record.examNotes,
        date: record.examDate,
        timeOfDay: record.examTimeOfDay,
        duration: record.examDuration
    };
    const exam = await Exam.create(examDetails).then(makeExamAssociations(course));

    // so that the async promise doesn't reject
    return Promise.resolve(exam);
};

// we are assuming each record represents one exam
const scanForExams = (db, cache) => records => {
    const examsPromises = _.map(records, saveExam(db, cache));
    cache.exams = examsPromises;
    return Promise.all(cache.exams);

};

const router = Router({ mergeParams: true })
    .get('/exams/import', (req, res) => res.render('import'))
    .get('/exams/upload', (req, res) => res.redirect('/exams/import'))
    .post('/exams/upload', async (req, res) => {
        const template = 'import';

        // check that we have an acceptable file to work with
        let file;
        try {
            ({ file } = req.files);
            throwIf(f => !f, 422, 'Did you remember to upload the file?')(file);
            throwIf(f => f.mimetype !== 'text/csv', 415, 'Upload your exam data in text/csv format')(file);
            throwIf(f => f.truncated, 413, 'Try splitting the records across several smaller files')(file);
        } catch (error) {
            catchError(error, () => res.error.html(error.code, error.message, template));
            return true; // as 'file' is required for next step, we need to bug out here
        }

        // parse csv file to extract a set of exam data records
        let csvRecords = [];
        try {
            const csvParserOptions = { columns: true };
            csvRecords = await csvParse(file.data, csvParserOptions);
        } catch (error) {
            res.error.html(422, error, template);
            return true; // errors here are fatal too, so we need to bug out here
        }

        // no records found 400 (Bad Request)
        if (csvRecords.length === 0) {
            res.error.html(400, `No records found`, template);
            return true; // no data, no need to continue. bug out.
        }

        // parse the CSV records into a format examdb can understand.
        // make sure they match the schema too, or they're no good to us!
        let records = [];
        let errors = [];
        _.each(csvRecords, data => {
            try {
                const record = new Record(data);
                records.push(record);
            } catch (err) {
                errors.push(err);
            }
        });

        const cache = {
            courses: [],
            exams: [],
            examBoards: [],
            programmesOfStudy: [],
            qualifications: []
        };

        // scan the dataset for examboards
        // then fetch (or create) entries for them in the db.
        // we can then find them in the cache
        scanForQualifications(req.db, cache)(records);
        scanForExamboards(req.db, cache)(records);
        scanForProgrammesOfStudy(req.db, cache)(records);
        scanForCourses(req.db, cache)(records);
        scanForExams(req.db, cache)(records);

        // we'll need to wait for them to complete importing before contining
        await Promise.all(cache.exams);

        const imported = _.filter(cache.exams, (promise) => promise.isFulfilled);

        const totalRecordCount = csvRecords.length;
        const successCount = imported.length;
        const successMessage = `Upload complete. Imported ${successCount} of ${totalRecordCount} exam records from '${
            file.name
        }'.`;
        res.error.html(200, successMessage, template); // not officially an error of course if 200 - OK.
        return true;
    });

export default router;
