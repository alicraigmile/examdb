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
    Exam.associate = models => {
        const { Course, Dataset } = models;
        Exam.belongsTo(Course);
        Exam.belongsTo(Dataset);
    };
    return Exam;
};

export default model;
