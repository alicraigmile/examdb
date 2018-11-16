import { Router } from 'express';
import _ from 'underscore';
import { Promise } from 'bluebird';
import csvParse from 'csv-parse';
//import parse from 'csv-parse';

import { triggerAsyncId } from 'async_hooks';
import { formatWithOptions } from 'util';

const parse = Promise.promisify(csvParse);

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;

const throwError = (code, errorMessage) => () => {
    const error = Error();
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

const importRecord = async (record, db) => {
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
    } catch(error) {
        throwError(500, 'ExamBoard Database error.')
    }

    if (!examBoard) {
        examBoard = await db.ExamBoard.build({ name: examboardName }).save();
    }

    throw(examBoard.id);

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

    .get('/exams/import', (req, res) => res.render('import'))

    .post('/exams/upload', async (req, res) => {
        const template = 'import';

        try {

            // if (!req.files) return res.error.html(, template);
            throwIf(files => !files, 400, 'No files were uploaded.')(req.files);

            // The name of the input field is "file"
            const { file } = req.files;

            // if (!file) return res.error.html(422, 'Did you remember to upload the file?', template);
            throwIf(f => !f, 422, 'Did you remember to upload the file?')(file);

            // if (file.mimetype !== 'text/csv') return res.error.html(422, 'Expected mimetype text/csv', template);
            throwIf(f => f.mimetype !== 'text/csv', 422, 'Expected file of type text/csv')(file);

            // if (file.truncated) return res.error.html(422, 'Too large', template);
            throwIf(f => f.truncated, 422, 'Too large')(file);

            const csvParserOptions = { columns: true };
            parse(file.data, csvParserOptions)
                .then( records => {
                    records.forEach( record => {
                        throw Error('mock parse failed');
                        
                    })
                });
                /*

                if (err) return res.error.html(422, "Can't read CSV data", template);

                // const imported = await Promise.all(records.map(importRecord));
                const imported = [await importRecord(records[0], req.db)];

                const successCount = _.filter(imported, r => r).length;
                const successMessage = `Upload successful. Imported '${successCount}' exam records from '${
                    file.name
                }'.`;
                return res.error.html(200, successMessage, template);
                */
        } catch (error) {
            catchError(error, () => res.error.html(500, `Unexpected error - ${error}`, template));
        }
    })

    .get('/exams/:exam.json', async (req, res) => {
        const examId = req.params.exam;
        //       throw(Error('not enough cats'));

        try {
            //throw Error('dogs rule');
            //jamCats();
            // fetch exam by id
            //throwError(501, 'still not enough cats')();

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
