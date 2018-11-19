const model = (sequelize, DataTypes) => {
    const Qualification = sequelize.define(
        'Qualification',
        {
            name: { type: DataTypes.STRING, unique: true }
        },
        {}
    );
    Qualification.associate = models => {
        const { Dataset, ProgrammeOfStudy } = models;
        Qualification.belongsTo(Dataset);
        Qualification.hasMany(ProgrammeOfStudy);
    };
    return Qualification;
};

export default model;
