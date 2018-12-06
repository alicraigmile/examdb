// import { Router } from 'express';
import _ from 'underscore';
import csvParser from 'csv-parse';
import Promise from 'bluebird';
import Router from 'express-promise-router';
import { throwError, throwIf, catchError, toISODate } from '../helpers';

const csvParse = Promise.promisify(csvParser);


// given a record
// returns the name of the qualification
const recordQualificationName = record => {
    const { Qualification: qualificationName } = record;
    return qualificationName;
};

// given a record
// returns the name of the programme of study
const recordProgrammeOfStudyName = record => {
    const { Course: courseName, Qualification: qualificationName } = record;

    const courseName2 = courseName.replace(/\n/g, ' ');
    return `${qualificationName} ${courseName2}`;
};

// given a record
// returns the name of the programme of study
const recordCourseName = record => {
    const {
        Course: courseName,
        // eslint-disable-next-line no-useless-computed-key
        ['Exam board']: examBoardName,
        Qualification: qualificationName
    } = record;

    const courseName2 = courseName.replace(/\n/g, ' ');
    return `${qualificationName} ${courseName2} ${examBoardName}`;
};

const makeExamAssociations = (course) => (exam) => {
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
// returns a function which promises to look up an course by name
// note: the function will create the course if it does not exist
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
const scanForExamboards = (db,cache) => (records) => {
    const uniqueExamBoardNames = 
        _.chain(records)
        .pluck('Exam board')
        .unique()
        .value();
        
    const examboards = _.object(uniqueExamBoardNames, _.map(uniqueExamBoardNames, fetchExamboardByName(db).));
    
    if (cache) {
        cache.examboards = examboards;
    }
    
    return examboards; 
}

// given a set of records, scan for qualifications
// then fetch (or create) entries for them in the db
// returns an object with promises for each, keyed by qualification name
// there is an option to cache the promises if request
const scanForQualifications = (db,cache) => (records) => {
    const uniqueQualificationNames = _.chain(records)
        .pluck('Qualification')
        .unique()
        .value();

    const qualifications = _.object(uniqueQualificationNames, _.map(uniqueQualificationNames, fetchQualificationByName(db)));
    cache.qualifications = qualifications;
    return qualifications; 
}


// given a set of records, scan for programmes of study
// then fetch (or create) entries for them in the db
// returns an object with promises for each, keyed by programmes of study name
// there is an option to cache the promises
const scanForProgrammesOfStudy = (db,cache) => (records) => {
    const uniqueProgrammeOfStudyNames = _.chain(records)
        .map(recordProgrammeOfStudyName)
        .unique()
        .value();

    const programmesOfStudy = _.object(uniqueProgrammeOfStudyNames, _.map(uniqueProgrammeOfStudyNames, fetchProgrammeOfStudyByName(db)));
    cache.programmesOfStudy = programmesOfStudy;
    return programmesOfStudy; 
}


// given a set of records, scan for programmes of study
// then fetch (or create) entries for them in the db
// returns an object with promises for each, keyed by programmes of study name
// there is an option to cache the promises
const scanForCourses = (db,cache) => (records) => {
    const uniqueCourseNames = _.chain(records)
        .map(recordCourseName)
        .unique()
        .value();

    const courses = _.object(uniqueCourseNames, _.map(uniqueCourseNames, fetchCourseByName(db)));
    cache.courses = courses;
    return courses; 
}


const saveExam = (db, cache) => async record => {
    const { Exam } = db;
    // this needs a try/catch as the replace will fail if data is missing. these will be more examples below.
    const {
        // eslint-disable-next-line no-useless-computed-key,no-unused-vars
        ['Exam board']: examBoardName,
        // eslint-disable-next-line no-unused-vars
        Qualification: qualificationName,
        Course: rawCourseName,
        Code: examCode,
        Notes: examNotes,
        Paper: examPaper,
        // eslint-disable-next-line no-useless-computed-key
        ['Morning/Afternoon']: examTimeOfDay,
        Duration: examDuration,
        Date: rawExamDate
    } = record;

    // eslint-disable-next-line no-unused-vars
    const examDate = toISODate(rawExamDate);

    /*
   const programmeOfStudyName = `${qualificationName} ${courseName2}`;
    const examBoard = examBoardsInDataset[examBoardName];
    const qualification = qualificationsInDataset[qualificationName];
    const programmeOfStudy = programmesOfStudyInDataset[programmeOfStudyName];
    */

    const courseName = rawCourseName.replace(/\n/g, ' ');
    const courseName3 = `${qualificationName} ${courseName} ${examBoardName}`;
    const course = await cache.courses[courseName3];
    
    // this is very hacky and doesn't belong here.
    /*
    await programmeOfStudy.setQualification(qualification);
    await course.setProgrammeOfStudy(programmeOfStudy);
    await course.setExamBoard(examBoard);
    */
    
    // exam
    const examDetails = {
        code: examCode,
        paper: examPaper,
        notes: examNotes,
        date: examDate,
        timeOfDay: examTimeOfDay,
        duration: examDuration
    };
    const exam = await Exam.create(examDetails).then(makeExamAssociations(course)); 
    
    // so that the async promise doesn't reject
    return Promise.resolve(exam);
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
        let records = [];
        try {
            const csvParserOptions = { columns: true };
            records = await csvParse(file.data, csvParserOptions);
        } catch (error) {
            res.error.html(422, error, template);
            return true; // errors here are fatal too, so we need to bug out here
        }

        // no records found 400 (Bad Request)
        if (records.length === 0) {
            res.error.html(400, `No records found`, template);
            return true; // no data, no need to continue. bug out.
        }

        const cache = {};
        
        // scan the dataset for examboards
        // then fetch (or create) entries for them in the db. 
        // we can then find them in the cache
        scanForExamboards(req.db,cache)(records);
        scanForQualifications(req.db,cache)(records);
        scanForProgrammesOfStudy(req.db,cache)(records);
        scanForCourses(req.db,cache)(records);

        // refactor? scanForExams(req.db, cache)(records)
        let examsInDataset = [];
        const examsPromises = _.map(
            records,
            saveExam(req.db, cache)
        );
        examsInDataset = await Promise.all(examsPromises);

        // eslint-disable-next-line no-console
        console.log(
            _.chain(examsInDataset)
                .values()
                .map(a =>
                    a.get({
                        plain: true
                    })
                )
                .value()
        );

        /*
        // eslint-disable-next-line no-console
        console.log(_.chain(qualificationsInDataset).values().map((a) => a.get({
            plain: true})).value());

        // eslint-disable-next-line no-console
        console.log(_.chain(examBoardsInDataset).values().map((a) => a.get({
            plain: true})).value());
        */

        /*
        // import each exam data record into the database
        let imported = [];
        try {
            const promises = _.map(records, importRecord(req.db, datasetId));
            imported = await Promise.each([promises]).then(
                () => console.log('all promised fulfilled!'),
                () => console.log('one or more promises failed')
            );
            // catch and ignore
            // eslint-disable-next-line no-empty
        } catch(error) {}
        */
        const imported = [];
        const totalRecordCount = records.length;
        const successCount = _.filter(imported, r => r).length;
        const successMessage = `Upload complete. Imported ${successCount} of ${totalRecordCount} exam records from '${
            file.name
        }'.`;
        res.error.html(200, successMessage, template); // not officially an error of course if 200 - OK.
        return true;
    });

export default router;
