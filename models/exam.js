const model = (sequelize, DataTypes) => {
    const Exam = sequelize.define(
        'Exam',
        {
            code: DataTypes.STRING,
            paper: DataTypes.STRING,
            notes: DataTypes.STRING,
            date: DataTypes.DATE,
            timeOfDay: DataTypes.STRING,
            duration: DataTypes.STRING
        },
        {}
    );
    Exam.associate = function(models) {
        const { Course } = models;
        Exam.belongsTo(Course);
    };
    return Exam;
};

export default model;
