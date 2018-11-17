const model = (sequelize, DataTypes) => {
    const Course = sequelize.define(
        'Course',
        {
            name: DataTypes.STRING
        },
        {}
    );
    Course.associate = models => {
        const { Exam, ExamBoard, ProgrammeOfStudy, WebResource } = models;
        Course.belongsTo(ProgrammeOfStudy);
        Course.belongsTo(ExamBoard);
        Course.belongsToMany(WebResource, { through: 'CourseWebResource' });
        Course.hasMany(Exam);
    };
    return Course;
};

export default model;
