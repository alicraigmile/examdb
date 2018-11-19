const model = (sequelize, DataTypes) => {
    const Dataset = sequelize.define(
        'Dataset',
        {
            name: DataTypes.STRING
        },
        {}
    );
    Dataset.associate = models => {
        const { User } = models;
        Dataset.belongsTo(User, { as: 'IngestUser' });
    };
    return Dataset;
};

export default model;
