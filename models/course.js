
const model = (sequelize, DataTypes) => {
    const Course = sequelize.define(
        'Course',
        {
            name: DataTypes.STRING
        },
        {}
    );
    Course.associate = (models) => {
        // associations can be defined here
        Course.belongsTo(models.ProgrammeOfStudy);
        Course.belongsTo(models.ExamBoard);
        Course.belongsToMany(models.WebResource, { through: 'CourseWebResource' });
        Course.hasMany(models.Exam);
    };
    return Course;
};

export default model;