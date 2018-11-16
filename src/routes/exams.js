import { Router } from 'express';
import _ from 'underscore';
import { Promise } from 'bluebird';
import csvParser from 'csv-parse';

const csvParse = Promise.promisify(csvParser);

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;

const throwError = (code, errorMessage) => (originalSin) => {
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

const importRecord = (db) => async (record) => {
    
    const examboardName = record['Exam board'];
    const qualificationName = record.Qualification;
    const courseNameRaw = record.Course;
    const courseName = courseNameRaw.replace(/\n/g, ' ');
    const examCode = record.Code;
    const examPaper = record.Paper;
    const examNotes = record.Notes;
    const examTimeOfDay = record['Morning/Afternoon'];
    const examDuration = record.Duration;

    let examDate = record.Date;
    if (examDate.match(ddmmyyyy)) {
        examDate = examDate
            .split('/')
            .reverse()
            .join('-');
    }
    if (examDate.match(yyyymmdd)) {
        examDate = examDate.replace(/\//, '-');
    }

    let examBoard;
    try {
        examBoard = await db.ExamBoard.findAll({ limit: 1, where: { name: examboardName } });
    } catch (error) {
        throwError(500, 'ExamBoard Database error.');
    }

    if (!examBoard) {
        examBoard = await db.ExamBoard.build({ name: examboardName }).save();
    }

    throw examBoard.id;

    let qualification = await db.Qualification.findAll({ limit: 1, where: { name: qualificationName } }).catch(
        throwError(500, 'Qualifications Database error.')
    );

    if (!qualification) {
        qualification = await db.Qualification.build({ name: qualificationName }).save();
    }

    const programmeOfStudy = await db.ProgrammeOfStudy.build({
        name: courseName,
        qualificationId: qualification.id
    }).save();

    const course = await db.Course.build({
        name: courseName,
        programmeOfStudyId: programmeOfStudy.id,
        ExamBoardId: examBoard.id
    }).save();

    await db.Exam.build({
        code: examCode,
        paper: examPaper,
        notes: examNotes,
        date: examDate,
        timeOfDay: examTimeOfDay,
        duration: examDuration,
        CourseId: course.id
    }).save();

    // so that the async promise doesn't reject
    return true;
};

const router = Router({ mergeParams: true })
    .get('/exams.json', async (req, res) => {
        try {
            const exams = await req.db.Exam.findAll();
            res.json(exams);
        } catch (error) {
            catchError(error, () => res.error.json(error.code, error.message));
            // res.error.json(500, 'Cannot fetch exams data.');
        }
    })

    .get('/exams', async (req, res) => {
        const template = 'examsindex';
        try {
            const qualifications = await req.db.Qualification.findAll();
            res.render(template, { qualifications });
        } catch (error) {
            catchError(error, () => res.render(template, {}));
        }
    })

    .get('/exams/upload', (req, res) => res.redirect('/exams/import'))

    .get('/exams/import', (req, res) => res.render('import'))

    .post('/exams/upload', async (req, res) => {
        const template = 'import';

        // check that we have an acceptable file to work with
        let file;
        try {
            ({ file } = req.files);
            throwIf(f => !f, 422, 'Did you remember to upload the file?')(file);
            throwIf(f => f.mimetype !== 'text/csv', 415, 'Upload your exam data in text/csv format')(file);
            throwIf(f => f.truncated, 413, 'Try splitting the records across several smaller files')(file);
        } catch(error) {
            catchError(error, () => res.error.html(error.code, error.message, template));
            return true; // as 'file' is required for next step, we need to bug out here
        }

        // parse csv file to extract a set of exam data records
        let records = [];
        try {
            const csvParserOptions = { columns: true }; 
            records = await csvParse(file.data, csvParserOptions);
        } catch(error) {
            res.error.html(422, error, template);
            return true; // errors here are fatal too, so we need to bug out here
        }   

        console.log(records);
        // no records found 400 (Bad Request)
        if (records.length===0) {
            res.error.html(400, `No records found`, template)
            return true; // no data, no need to continue. bug out.
        }

        // import each exam data record into the database
        let imported = [];
        try {
            const promises = _.map(records, importRecord(req.db));
            imported = await Promise.all([promises]);
        } catch (error) {
            // catch and ignore
        }

        const totalRecordCount = records.length;
        const successCount = _.filter(imported, r => r).length;
        const successMessage = `Upload complete. Imported ${successCount} of ${totalRecordCount} exam records from '${file.name}'.`;
        res.error.html(200, successMessage, template); // not officially an error of course if 200 - OK.
        return true;

    })

    .get('/exams/:exam.json', async (req, res) => {
        const examId = req.params.exam;
        //       throw(Error('not enough cats'));

        try {
            // throw Error('dogs rule');
            // jamCats();
            // fetch exam by id
            // throwError(501, 'still not enough cats')();

            const exam = await req.db.Exam.findByPk(examId, {
                include: [{ model: req.db.Course }]
            }).then(throwIf(r => !r, 404, `Exam '${examId}' not found.`), throwError(500, 'Exam database error'));

            res.json(exam);
        } catch (error) {
            catchError(error, () => res.error.json(error.code, error.message));
        }
    })

    .get('/exams/:exam', async (req, res) => {
        const examId = req.params.exam;
        const template = 'exam';

        //       throw(Error('not enough cats'));

        try {
            //throw Error('dogs rule');
            //jamCats();
            // fetch exam by id
            //throwError(501, 'still not enough cats')();

            const exam = await req.db.Exam.findByPk(examId, {
                include: [{ model: req.db.Course }]
            }).then(throwIf(r => !r, 404, `Exam '${examId}' not found.`), throwError(500, 'Exam database error'));

            res.render(template, { exam });
        } catch (error) {
            catchError(error, () => res.error.html(error.code, error.message));
        }
    });

export default router;
