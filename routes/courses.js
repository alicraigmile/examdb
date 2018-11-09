import { Router } from 'express';


module.exports = Router({ mergeParams: true })
.get('/courses.json', (req, res) => res.json(store.allCourses()))

.get('/courses', (req, res) => res.redirect('/'))

.get('/courses/:course.json', (req, res) => {
    const courseId = req.params.course;
    const course = req.store.course(courseId);

    if (!course) return res.error.json(404, `Course '${courseId}' was not found.`);

    return res.json(course);
})

.get('/courses/:course', (req, res) => {
    const courseId = req.params.course;
    const course = req.store.course(courseId);
    const dateOrder = exam =>
        exam.date
            .split('/')
            .reverse()
            .join(''); // this is WRONG

    if (!course) return res.error.html(404, `Course '${courseId}' was not found.`);

    const courseExams = req.store.examsForCourse(course.id);
    const provider = req.store.provider(course.provider);
    const examboard = req.store.examboard(provider.examboard);
    const qualification = req.store.qualification(provider.qualification);
    const programmeOfStudy = req.store.programmeOfStudy(course.programmeofstudy);
    const exams = _.sortBy(courseExams, dateOrder);
    const output = { course, exams, provider, examboard, qualification, programmeOfStudy };

    return res.render('course', output);
});