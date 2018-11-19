const model = (sequelize, DataTypes) => {
    const ProgrammeOfStudy = sequelize.define(
        'ProgrammeOfStudy',
        {
            name: DataTypes.STRING
        },
        {}
    );
    ProgrammeOfStudy.associate = models => {
        const { Course, Dataset, Qualification } = models;
        ProgrammeOfStudy.hasMany(Course);
        ProgrammeOfStudy.hasOne(Dataset);
        ProgrammeOfStudy.belongsTo(Qualification);
    };
    return ProgrammeOfStudy;
};

export default model;
