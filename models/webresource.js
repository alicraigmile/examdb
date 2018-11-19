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
        WebResource.hasOne(Dataset);
    };
    return WebResource;
};

export default model;
