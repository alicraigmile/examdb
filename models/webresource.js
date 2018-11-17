const model = (sequelize, DataTypes) => {
    const WebResource = sequelize.define(
        'WebResource',
        {
            title: DataTypes.STRING,
            url: DataTypes.STRING
        },
        {}
    );
    WebResource.associate = function(models) {
        // associations can be defined here
    };
    return WebResource;
};

export default model;
