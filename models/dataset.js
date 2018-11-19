const model = (sequelize, DataTypes) => {
    const Dataset = sequelize.define(
        'Dataset',
        {
            name: DataTypes.STRING
        },
        {}
    );
    Dataset.associate = models => {
        const { User, WebResource } = models;
        Dataset.belongsTo(User, { as: 'Initiator' });
        Dataset.belongsTo(WebResource, { as: 'Source' });
    };
    return Dataset;
};

export default model;
