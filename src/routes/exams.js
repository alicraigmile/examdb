import { Router } from 'express';
import _ from 'underscore';
import parse from 'csv-parse';
import { jSXNamespacedName } from 'babel-types';

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
    const canCatch = error => error instanceof Error && error.code;
    if (canCatch(error)) {
        fn();
    } else {
        throw error;
    }
};

const importARecord = async (record, db) => {
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

    let examBoard = await db.ExamBoard.findAll({ limit: 1, where: { name: examboardName } }).catch(
        throwError(500, 'ExamBoard Database error.')
    );

    if (!examBoard) {
        examBoard = await db.ExamBoard.build({ name: examboardName }).save();
    }

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
};

const router = Router({ mergeParams: true })
    .get('/exams.json', async (req, res) => {
        try {
            const exams = await req.db.Exam.findAll();
            res.json(exams);
        } catch (error) {
            res.error.json(500, 'Cannot fetch exams data.');
        }
    })

    .get('/exams', async (req, res) => {
        const template = 'examsindex';
        try {
            const qualifications = await req.db.Qualification.findAll();
            res.render(template, { qualifications });
        } catch (error) {
            res.render(template, {});
        }
    })

    .get('/exams/import', (req, res) => res.render('import'))

    .post('/exams/upload', async (req, res) => {
        const template = 'import';
        const sumIfTrue = (memo, item) => (item === true ? memo + 1 : memo);
        const importRecord = record => importARecord(record, req.db);

        if (!req.files) return res.error.html(400, 'No files were uploaded.', template);

        // The name of the input field is "file"
        const { file } = req.files;

        if (!file) return res.error.html(422, 'Did you remember to upload the file?', template);

        if (file.mimetype !== 'text/csv') return res.error.html(422, 'Expected mimetype text/csv', template);

        if (file.truncated) return res.error.html(422, 'Too large', template);

        try {
            parse(file.data, { columns: true }, async (err, records) => {
                if (err) return res.error.html(422, "Can't read CSV data", template);

                const imported = await Promise.all(records.map(importRecord)).catch(throwError());

                const successCount = _.filter(imported, r => r).size();
                const successMessage = `Upload successful. Imported '${successCount}' exam records from '${
                    file.name
                }'.`;
                res.error.html(200, successMessage, template);

                /*
                const recordsImported = _.chain(records)
                    .map(importRecord)
                    .reduce(sumIfTrue)
                    .value();
                const successMessage = `Upload successful. Imported ${recordsImported} exam records from '${file.name}'.`;
                return res.error.html(200, successMessage, template);
                */
            });
        } catch (error) {
            res.error.html(500, `Unexpected error - ${error}`, template);
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
