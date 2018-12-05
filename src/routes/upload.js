// import { Router } from 'express';
import _ from 'underscore';
import csvParser from 'csv-parse';
import Promise from 'bluebird';
import Router from 'express-promise-router';

const csvParse = Promise.promisify(csvParser);

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;

const throwError = (code, errorMessage) => () => {
    const error = Error(); // debug
    error.code = code;
    error.message = errorMessage;
    throw error;
};
const throwIf = (fn, code, errorMessage) => result => {
    if (fn(result)) {
        return throwError(code, errorMessage)();
    }
    return result;
};

const catchError = (error, fn) => {
    const canCatch = e => e instanceof Error && e.code;
    if (canCatch(error)) {
        fn();
    } else {
        throw error;
    }
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
// returns a function which promises to look up a qualification by name
// note: the function will create the qualification if it does not exist
const fetchQualificationByName = db => async qualificationName => {
    const { Qualification } = db;
    const [qualification] = await Qualification.findOrCreate({
        where: { name: qualificationName }
    });
    return qualification;
};

const saveExam = (
    db,
    examBoardsInDataset,
    qualificationsInDataset,
    programmesOfStudyInDataset,
    // eslint-disable-next-line no-unused-vars
    coursesInDataset
) => async record => {
    const { Exam } = db;

    // this needs a try/catch as the replace will fail if data is missing. these will be more examples below.
    const {
        // eslint-disable-next-line no-useless-computed-key,no-unused-vars
        ['Exam board']: examBoardName,
        // eslint-disable-next-line no-unused-vars
        Qualification: qualificationName,
        Course: courseName,
        Code: examCode,
        Notes: examNotes,
        Paper: examPaper,
        // eslint-disable-next-line no-useless-computed-key
        ['Morning/Afternoon']: examTimeOfDay,
        Duration: examDuration,
        Date: examDate
    } = record;

    // eslint-disable-next-line no-unused-vars
    const courseName2 = courseName.replace(/\n/g, ' ');

    let examDate2 = examDate;
    if (examDate2.match(ddmmyyyy)) {
        examDate2 = examDate2
            .split('/')
            .reverse()
            .join('-');
    }
    if (examDate2.match(yyyymmdd)) {
        examDate2 = examDate2.replace(/\//, '-');
    }

    /*
    const programmeOfStudyName = `${qualificationName} ${courseName2}`;
    const courseName3 = `${qualificationName} ${courseName2} ${examBoardName}`;
    const examBoard = examBoardsInDataset[examBoardName];
    const qualification = qualificationsInDataset[qualificationName];
    const programmeOfStudy = programmesOfStudyInDataset[programmeOfStudyName];
    const course = coursesInDataset[courseName3];

    // this is very hacky and doesn't belong here.
    await programmeOfStudy.setQualification(qualification);
    await course.setProgrammeOfStudy(programmeOfStudy);
    await course.setExamBoard(examBoard);
    */

    // exam
    const exam = await Exam.create({
        code: examCode,
        paper: examPaper,
        notes: examNotes,
        date: examDate,
        timeOfDay: examTimeOfDay,
        duration: examDuration
    });
    // let c = await exam.setCourse(course);

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

        // scan the dataset for examboards
        // then fetch (or create) entries for them in the db
        let examBoardsInDataset = [];
        const examBoards = _.chain(records)
            .pluck('Exam board')
            .unique()
            .value();
        const examBoardPromises = _.map(examBoards, fetchExamboardByName(req.db));
        examBoardsInDataset = _.object(examBoards, await Promise.all(examBoardPromises));

        // scan the dataset for qualifications
        // then fetch (or create) entries for them in the db
        let qualificationsInDataset = [];
        const qualifications = _.chain(records)
            .pluck('Qualification')
            .unique()
            .value();
        const qualificationsPromises = _.map(qualifications, fetchQualificationByName(req.db));
        qualificationsInDataset = _.object(qualifications, await Promise.all(qualificationsPromises));

        // scan the dataset for programmes of study
        // then fetch (or create) entries for them in the db
        let programmesOfStudyInDataset = [];
        const programmesOfStudy = _.chain(records)
            .map(recordProgrammeOfStudyName)
            .unique()
            .value();
        const programmesOfStudyPromises = _.map(programmesOfStudy, fetchQualificationByName(req.db));
        programmesOfStudyInDataset = _.object(programmesOfStudy, await Promise.all(programmesOfStudyPromises));

        // scan the dataset for courses
        // then fetch (or create) entries for them in the db
        let coursesInDataset = [];
        const courses = _.chain(records)
            .map(recordCourseName)
            .unique()
            .value();
        const coursesPromises = _.map(courses, fetchQualificationByName(req.db));
        coursesInDataset = _.object(courses, await Promise.all(coursesPromises));

        // scan the dataset for exams
        // then record entries for them in the db
        let examsInDataset = [];
        const examsPromises = _.map(
            records,
            saveExam(req.db, examBoardsInDataset, qualificationsInDataset, programmesOfStudyInDataset, coursesInDataset)
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
