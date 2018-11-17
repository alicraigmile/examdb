const model = (sequelize, DataTypes) => {
    const ExamBoard = sequelize.define(
        'ExamBoard',
        {
            name: { type: DataTypes.STRING, unique: true }
        },
        {}
    );
    ExamBoard.associate = function(models) {
        const { Course, WebResource } = models;
        ExamBoard.belongsTo(WebResource, { as: 'Homepage' });
        ExamBoard.hasMany(Course);
    };
    return ExamBoard;
};

export default model;
