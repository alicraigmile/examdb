const model = (sequelize, DataTypes) => {
    const ProgrammeOfStudy = sequelize.define(
        'ProgrammeOfStudy',
        {
            name: DataTypes.STRING
        },
        {}
    );
    ProgrammeOfStudy.associate = models => {
        const { Course, Qualification } = models;
        ProgrammeOfStudy.belongsTo(Qualification);
        ProgrammeOfStudy.hasMany(Course);
    };
    return ProgrammeOfStudy;
};

export default model;
