'use strict';
module.exports = (sequelize, DataTypes) => {
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
        // associations can be defined here
        Exam.belongsTo(models.Course);
    };
    return Exam;
};
