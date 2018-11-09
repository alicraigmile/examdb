import { Router } from 'express';


module.exports = Router({ mergeParams: true })

.get('/programmesofstudy.json', (req, res) => res.json(req.store.allProgrammesOfStudy()))

.get('/programmesofstudy', (req, res) => res.redirect('/'))

.get('/programmesofstudy/:programmeofstudy.json', (req, res) => {
    const programmeOfStudyId = req.params.programmeofstudy;
    const programmeOfStudy = req.store.programmeOfStudy(programmeOfStudyId);

    if (!programmeOfStudy) return res.error.json(404, `Programme of study '${programmeOfStudyId}' was not found.`);

    const exams = req.store.examsForProgrammeOfStudy(programmeOfStudy.id);
    _.map(exams, exam => {
        const course = req.store.course(exam.course);
        const provider = req.store.provider(course.provider);
        const examboard = req.store.examboard(provider.examboard);
        exam.c = course;
        exam.p = provider;
        exam.e = examboard;
        return exam;
    });

    return res.json({ programmeOfStudy, exams });
})

.get('/programmesofstudy/:programmeofstudy.csv', (req, res) => {
    const programmeofstudyId = req.params.programmeofstudy;
    const programmeofstudy = req.store.programmeOfStudy(programmeofstudyId);

    if (!programmeofstudy) return res.error.text(404, `Programme of study '${programmeofstudyId}' was not found.`);

    const exams = req.store.examsForProgrammeOfStudy(programmeofstudy.id);
    return res.csv(exams, true);
})

.get('/programmesofstudy/:programmeofstudy', (req, res) => {
    const programmeOfStudyId = req.params.programmeofstudy;
    const programmeOfStudy = req.store.programmeOfStudy(programmeOfStudyId);

    if (!programmeOfStudy) return res.error.html(404, `Programme of study '${programmeOfStudyId}' was not found.`);

    const courses = req.store.coursesByProgrammeOfStudy(programmeOfStudy.id);
    const qualification = req.store.qualification(programmeOfStudy.qualification);

    _.map(courses, course => {
        const provider = req.store.provider(course.provider);
        const examboard = req.store.examboard(provider.examboard);
        course.p = provider;
        course.e = examboard;
        return course;
    });

    const exams = req.store.examsForProgrammeOfStudy(programmeOfStudy.id);

    _.map(exams, exam => {
        const course = req.store.course(exam.course);
        const provider = req.store.provider(course.provider);
        const examboard = req.store.examboard(provider.examboard);
        exam.c = course;
        exam.p = provider;
        exam.e = examboard;
        return exam;
    });

    return res.render('programmeofstudy', { programmeOfStudy, qualification, courses, exams });
});