const model = (sequelize, DataTypes) => {
    const Ingest = sequelize.define(
        'Ingest',
        {
            name: DataTypes.STRING
        },
        {}
    );
    Ingest.associate = function(models) {
        const { User, WebResource } = models;
        Ingest.belongsTo(WebResource, { as: 'Source' });
        Ingest.belongsTo(User, { as: 'Initiator' });
    };
    return Ingest;
};

export default model;
