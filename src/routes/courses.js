import { Router } from 'express';


const getExams = course => course.getExams();

const router = Router({ mergeParams: true })
    .get('/courses.json', async (req, res, next) => {
        try {
            req.db.Course.findAll().then(courses => res.json(courses));
        } catch (error) {
            res.error.json(500, 'Cannot fetch courses data', error);
        }
        return next();
    })

    .get('/courses', (req, res) => res.redirect('/'))

    .get('/courses/:course.json', (req, res, next) => {
        const courseId = req.params.course;
        try {
            req.db.Course
                .findByPk(courseId, {include: [{ model: req.db.ProgrammeOfStudy }, { model: req.db.ExamBoard }] })
                .then(course => {console.log(course); return course;})
                .then(course => {
                    console.log(course);
                    course.getExams().then(exams => {
                        const output = { course, exams };
                        res.json(output);
                    });
                })
                .catch(error => res.error.json(404, `Course '${courseId}' was not found. ${error}`))
                .finally(next);
        } catch (error) {
            console.log(error);
            res.error.json(500, `Cannot fetch course data.`);
            next();
        }
    })

/*
  const courseExams = req.store.examsForCourse(course.id);
    const provider = req.store.provider(course.provider);
    const examboard = req.store.examboard(provider.examboard);
    const qualification = req.store.qualification(provider.qualification);
    const programmeOfStudy = req.store.programmeOfStudy(course.programmeofstudy);
    const exams = _.sortBy(courseExams,  dateOrder);
    const output = { course, exams, provider, examboard, qualification, programmeOfStudy };



.get('/courses/:course', (req, res) => {
    const courseId = req.params.course;
    try {
        req.db.Course.findByPk(courseId, {
            include: [{ model: req.db.ProgrammeOfStudy }, { model: req.db.ExamBoard }]
        }).then(course => {
                course.getExams().then(exams => {
                    const output = { course, exams };
                    res.render('course', output);
                });
            } else {
                res.error.html(404, `Course '${courseId}' was not found.`);
            }
        });
    } catch (error) {
        res.error.html(500, `Cannot fetch course data.`);
    }
});

*/

export default router;
