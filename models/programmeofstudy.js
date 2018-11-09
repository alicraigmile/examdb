'use strict';
module.exports = (sequelize, DataTypes) => {
    const ProgrammeOfStudy = sequelize.define(
        'ProgrammeOfStudy',
        {
            name: DataTypes.STRING
        },
        {}
    );
    ProgrammeOfStudy.associate = function(models) {
        // associations can be defined here
        ProgrammeOfStudy.belongsTo(models.Qualification);
    };
    return ProgrammeOfStudy;
};
