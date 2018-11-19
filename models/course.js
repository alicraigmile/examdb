const model = (sequelize, DataTypes) => {
    const Course = sequelize.define(
        'Course',
        {
            name: DataTypes.STRING
        },
        {}
    );
    Course.associate = models => {
        const { Exam, ExamBoard, Dataset, ProgrammeOfStudy, WebResource } = models;
        Course.belongsTo(Dataset);
        Course.hasMany(Exam);
        Course.belongsTo(ExamBoard);
        Course.belongsTo(ProgrammeOfStudy);
        Course.belongsToMany(WebResource, { through: 'CourseWebResource' });
    };
    return Course;
};

export default model;
