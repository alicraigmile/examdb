'use strict';
module.exports = (sequelize, DataTypes) => {
    const Qualification = sequelize.define(
        'Qualification',
        {
            name: DataTypes.STRING,
            unique: true
        },
        {}
    );
    Qualification.associate = function(models) {
        // associations can be defined here
        Qualification.hasMany(models.ProgrammeOfStudy);
    };
    return Qualification;
};
