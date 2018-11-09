import { Router } from 'express';

function _importRecord(record, store) {
    const examboardName = record['Exam board'];
    const examboardId = examboardName.toLowerCase();
    store.addExamboard({ id: examboardId, name: examboardName });

    const qualificationName = record.Qualification;
    const qualificationId = qualificationName.toLowerCase().replace(/[^a-z0-9]/gi, '-');
    store.addQualification({ id: qualificationId, name: qualificationName });

    const providerId = `${qualificationId}-${examboardId}`;
    store.addProvider({ id: providerId, qualification: qualificationId, examboard: examboardId });

    const courseNameRaw = record.Course;
    const courseName = courseNameRaw.replace(/\n/g, ' ');
    const courseStub = courseNameRaw.toLowerCase().replace(/[^a-z0-9]/gi, '-');
    const courseId = `${qualificationId}-${examboardId}-${courseStub}`;
    const programmeofstudyId = `${qualificationId}-${courseStub}`;
    const bitesizePosId = record.POS;
    const bitesizeExamspecId = record['Exam spec'];

    store.addProgrammeOfStudy({
        id: programmeofstudyId,
        name: courseName,
        qualification: qualificationId,
        bitesize: bitesizePosId
    });

    store.addCourse({
        id: courseId,
        provider: providerId,
        programmeofstudy: programmeofstudyId,
        bitesize: bitesizeExamspecId
    });

    const examId = uuidv1();
    const examCode = record.Code;
    const examPaper = record.Paper;
    const examNotes = record.Notes;
    let examDate = record.Date;
    const examTimeOfDay = record['Morning/Afternoon'];
    const examDuration = record.Duration;

    if (examDate.match(ddmmyyyy)) {
        examDate = examDate
            .split('/')
            .reverse()
            .join('-');
    }

    if (examDate.match(yyyymmdd)) {
        examDate = examDate.replace(/\//, '-');
    }

    store.addExam({
        id: examId,
        course: courseId,
        code: examCode,
        paper: examPaper,
        notes: examNotes,
        date: examDate,
        timeOfDay: examTimeOfDay,
        duration: examDuration
    });

    // err, success
    return [null, true];
}


module.exports = Router({ mergeParams: true })

.get('/exams.json', (req, res) => {
    const renderJSONObject = exams => res.json(exams);
    const renderJsonErrorObject = () => res.error.json(500, 'Cannot fetch exams data.');

    const exams = req.store.allExams();

    Promise.resolve(exams)
        .then(renderJSONObject)
        .catch(renderJsonErrorObject);
})

.get('/exams', (req, res, next) => {
    const template = 'examsindex';
    const renderExamsIndexTemplate = qualifications => res.render(template, { qualifications });
    const renderErrorTemplate = () => {
        res.render(template, {});
    };
    const qualifications = req.store.allQualifications();

    Promise.resolve(qualifications)
        .then(renderExamsIndexTemplate)
        .catch(renderErrorTemplate);

    return next();
})

.get('/exams/import', (req, res) => res.render('import'))

.post('/exams/upload', (req, res, next) => {
    const template = 'import';
    const sumIfTrue = (memo, item) => (item === true ? memo + 1 : memo);
    const importRecord = (record) => _importRecord(record, req.store);

    if (!req.files) return res.error.html(400, 'No files were uploaded.', template);

    // The name of the input field is "file"
    const { file } = req.files.file;

    if (!file) return res.error.html(422, 'Did you remember to upload the file?', template);

    if (file.mimetype !== 'text/csv') return res.error.html(422, 'Expected mimetype text/csv', template);

    if (file.truncated) return res.error.html(422, 'Too large', template);

    parse(file.data, { columns: true }, (err, records) => {
        if (err) return res.error.html(422, "Can't read CSV data", template);

        const recordsImported = _.chain(records)
            .map(importRecord) // DEBT needs store and db to work I think
            .reduce(sumIfTrue)
            .value();
        const successMessage = `Upload successful. Imported ${recordsImported} exam records from '${file.name}'.`;
        return res.error.html(200, successMessage, template);
    });
    return next();
})

.get('/exams/:exam.json', (req, res) => {
    const examId = req.params.exam;
    const exam = req.store.exam(examId);

    if (!exam) return res.error.json(404, `The exam '${examId}' was not found.`);

    return res.json(exam);
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