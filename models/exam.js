'use strict';
module.exports = (sequelize, DataTypes) => {
    const Exam = sequelize.define(
        'Exam',
        {
            paper: DataTypes.STRING
        },
        {}
    );
    Exam.associate = function(models) {
        // associations can be defined here
        Exam.belongsTo(models.Course);
    };
    return Exam;
};
