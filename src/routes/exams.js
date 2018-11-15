import { Router } from 'express';
import _ from 'underscore';
import parse from 'csv-parse';

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;

const throwError = (code, errorMessage) => error => {
    const defaultErrorMessage = 'Software error';
    const defaultErrorCode = 500;
    const e = error || new Error(errorMessage || defaultErrorMessage);
    e.code = code || defaultErrorCode;
    throw e;
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

    try {
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

        // err, success
        return [null, true];
    } catch (error) {
        return [error];
    }
};

const router = Router({ mergeParams: true })
    .get('/exams.json', async (req, res, next) => {
        try {
            const exams = await req.db.Exam.findAll();
            res.json(exams);
        } catch (error) {
            res.error.json(500, 'Cannot fetch exams data.');
        }
        return next();
    })

    .get('/exams', async (req, res, next) => {
        const template = 'examsindex';
        try {
            const qualifications = await req.db.Qualification.findAll();
            res.render(template, { qualifications });
        } catch (error) {
            res.render(template, {});
        }
        return next();
    })

    .get('/exams/import', (req, res) => res.render('import'))

    .post('/exams/upload', async (req, res, next) => {
        const template = 'import';
        const sumIfTrue = (memo, item) => (item === true ? memo + 1 : memo);
        const importRecord = record => importARecord(record, req.db);

        if (!req.files) return res.error.html(400, 'No files were uploaded.', template);

        // The name of the input field is "file"
        const { file } = req.files;

        if (!file) return res.error.html(422, 'Did you remember to upload the file?', template);

        if (file.mimetype !== 'text/csv') return res.error.html(422, 'Expected mimetype text/csv', template);

        if (file.truncated) return res.error.html(422, 'Too large', template);

        parse(file.data, { columns: true }, (err, records) => {
            if (err) return res.error.html(422, "Can't read CSV data", template);

            const recordsImported = _.chain(records)
                .map(importRecord)
                .reduce(sumIfTrue)
                .value();
            const successMessage = `Upload successful. Imported ${recordsImported} exam records from '${file.name}'.`;
            return res.error.html(200, successMessage, template);
        });
        return next();
    })

    .get('/exams/:exam.json', async (req, res) => {
        const examId = req.params.exam;

        try {
            const exam = await req.db.Exam.findByPk(examId);
            if (exam) {
                res.json(exam);
            } else {
                res.error.json(404, `Exam '${examId}' not found.`);
            }
        } catch (error) {
            res.error.json(500, 'Cannot fetch exam.');
        }
    })

    .get('/exams/:exam', async (req, res) => {
        const examId = req.params.exam;

        try {
            const exam = await req.db.Exam.findByPk(examId);
            if (exam) {
                res.json(exam);
            } else {
                res.error.json(404, `Exam '${examId}' not found.`);
            }
        } catch (error) {
            res.error.json(500, 'Cannot fetch exam.');
        }
    })

    .get('/exams/:exam', (req, res) => {
        const examId = req.params.exam;
        const exam = req.store.exam(examId);

        if (!exam) return res.error.html(404, `The exam '${examId}' was not found.`);

        const course = req.store.course(exam.course);
        const provider = req.store.provider(course.provider);
        const examboard = req.store.examboard(provider.examboard);
        const qualification = req.store.qualification(provider.qualification);
        const programmeOfStudy = req.store.programmeOfStudy(course.programmeofstudy);
        const output = { exam, course, provider, examboard, qualification, programmeOfStudy };

        return res.render('exam', output);
    });

export default router;
