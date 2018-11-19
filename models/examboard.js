const model = (sequelize, DataTypes) => {
    const ExamBoard = sequelize.define(
        'ExamBoard',
        {
            name: { type: DataTypes.STRING, unique: true }
        },
        {}
    );
    ExamBoard.associate = models => {
        const { Course, Dataset, WebResource } = models;
        ExamBoard.hasMany(Course);
        ExamBoard.belongsTo(Dataset);
        ExamBoard.belongsTo(WebResource, { as: 'Homepage' });
    };
    return ExamBoard;
};

export default model;
