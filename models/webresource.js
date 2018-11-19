const model = (sequelize, DataTypes) => {
    const WebResource = sequelize.define(
        'WebResource',
        {
            title: DataTypes.STRING,
            url: DataTypes.STRING
        },
        {}
    );
    WebResource.associate = models => {
        const { Dataset } = models;
        WebResource.belongsTo(Dataset);
    };
    return WebResource;
};

export default model;
