const model = (sequelize, DataTypes) => {
    const Qualification = sequelize.define(
        'Qualification',
        {
            name: { type: DataTypes.STRING, unique: true }
        },
        {}
    );
    Qualification.associate = function(models) {
        const { ProgrammeOfStudy } = models;
        Qualification.hasMany(ProgrammeOfStudy);
    };
    return Qualification;
};

export default model;
